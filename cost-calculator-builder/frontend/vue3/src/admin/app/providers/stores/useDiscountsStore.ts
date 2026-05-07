import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import { DiscountAPI } from "@/admin/shared/api/DiscountAPI";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import type {
  IDiscountForm,
  IDiscountsCollection,
  IDiscountListParams,
  IDiscountResponse,
  IDiscountConditionForm,
  IDiscountTotalOption,
  NumericLike,
  DiscountSortBy,
  DiscountSortDirection,
  IDiscountConditionResponse,
  DiscountPeriod,
  DiscountConditionType,
} from "@/admin/shared/types/discounts.type";

const DISCOUNT_FILTER_STORAGE_KEY = "ccb_discount_filter";

const DEFAULT_DISCOUNT_LIST_PARAMS: IDiscountListParams = {
  limit: 15,
  page: 1,
  sortBy: "discount_id",
  direction: "desc",
};

interface IDiscountsStore {
  discounts: IDiscountResponse[];
  discountsCount: number;
  listParams: IDiscountListParams;
  selectedDiscountIds: number[];
  isLoaded: boolean;
  isModalOpen: boolean;
  activeDiscount: IDiscountForm | null;
}

export const useDiscountsStore = defineStore("discounts_store", {
  state: (): IDiscountsStore => ({
    discounts: [],
    discountsCount: 0,
    listParams: { ...DEFAULT_DISCOUNT_LIST_PARAMS },
    selectedDiscountIds: [],
    isLoaded: false,
    isModalOpen: false,
    activeDiscount: null,
  }),

  getters: {
    getDiscounts: (state: IDiscountsStore): IDiscountResponse[] =>
      state.discounts,
    getDiscountsCount: (state: IDiscountsStore): number => state.discountsCount,
    getDiscountList: (state: IDiscountsStore): IDiscountListParams =>
      state.listParams,
    getSelectedDiscountIds: (state: IDiscountsStore): number[] =>
      state.selectedDiscountIds,
    getIsLoaded: (state: IDiscountsStore): boolean => state.isLoaded,
    getIsModalOpen: (state: IDiscountsStore): boolean => state.isModalOpen,
    getActiveDiscount: (state: IDiscountsStore): IDiscountForm | null =>
      state.activeDiscount,
    getTotalPages: (state: IDiscountsStore): number => {
      const pages = Math.ceil(state.discountsCount / state.listParams.limit);
      return pages > 0 ? pages : 1;
    },
  },

  actions: {
    toggleSelectAll(): void {
      const currentPageIds = this.discounts.map((item) =>
        Number(item.discount_id),
      );
      this.selectedDiscountIds =
        this.selectedDiscountIds.length > 0 ? [] : currentPageIds;
    },

    hydrateListParams(): void {
      const raw = localStorage.getItem(DISCOUNT_FILTER_STORAGE_KEY);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw) as Partial<IDiscountListParams>;
        const next: IDiscountListParams = {
          ...DEFAULT_DISCOUNT_LIST_PARAMS,
          ...(Number(parsed.limit) > 0 ? { limit: Number(parsed.limit) } : {}),
          ...(Number(parsed.page) > 0 ? { page: Number(parsed.page) } : {}),
          ...(this.isSortBy(parsed.sortBy) ? { sortBy: parsed.sortBy } : {}),
          ...(this.isDirection(parsed.direction)
            ? { direction: parsed.direction }
            : {}),
        };
        this.listParams = next;
      } catch (error) {
        console.error("Failed to parse discount filter", error);
      }
    },

    persistListParams(): void {
      localStorage.setItem(
        DISCOUNT_FILTER_STORAGE_KEY,
        JSON.stringify(this.listParams),
      );
    },

    setDiscounts(discounts: IDiscountResponse[]): void {
      this.discounts = discounts;
      this.isLoaded = true;
    },

    setDiscountsCount(discountsCount: NumericLike): void {
      this.discountsCount = Number(discountsCount) || 0;
    },

    setListParams(listParams: IDiscountListParams): void {
      this.listParams = listParams;
    },

    patchListParams(patch: Partial<IDiscountListParams>): void {
      this.listParams = {
        ...this.listParams,
        ...patch,
      };
    },

    resetListParams(): void {
      this.listParams = { ...DEFAULT_DISCOUNT_LIST_PARAMS };
      this.persistListParams();
    },

    setSelectedDiscountIds(ids: number[]): void {
      this.selectedDiscountIds = ids;
    },

    toggleSelectDiscount(id: number): void {
      if (this.selectedDiscountIds.includes(id)) {
        this.selectedDiscountIds = this.selectedDiscountIds.filter(
          (selectedId) => selectedId !== id,
        );
        return;
      }

      this.selectedDiscountIds = [...this.selectedDiscountIds, id];
    },

    toggleSelectAllCurrentPage(): void {
      const currentPageIds = this.discounts.map((item) =>
        Number(item.discount_id),
      );
      const isAllSelected = currentPageIds.every((id) =>
        this.selectedDiscountIds.includes(id),
      );

      this.selectedDiscountIds = isAllSelected ? [] : currentPageIds;
    },

    isSortBy(value: unknown): value is DiscountSortBy {
      return (
        value === "discount_id" ||
        value === "title" ||
        value === "is_promo" ||
        value === "period" ||
        value === "discount_status"
      );
    },

    isDirection(value: unknown): value is DiscountSortDirection {
      return value === "asc" || value === "desc";
    },

    getTotalsOptions(): IDiscountTotalOption[] {
      const builderStore = useBuilderStore();
      return builderStore.getTotalElements.map((item) => ({
        idx: item.idx,
        alias: item.alias,
        title: item.title,
      }));
    },

    getDefaultCondition(): IDiscountConditionForm {
      const [first] = this.getTotalsOptions();
      return {
        totals: first ? [first] : [],
        condition: ">",
        over_price: 100,
        discount_type: "percent_of_amount",
        discount_amount: 10,
      };
    },

    getDefaultDiscountForm(): IDiscountForm {
      return {
        title: "",
        is_promo: false,
        promocode: {
          promocode: "",
          promocode_count: 100,
          promocode_used: 0,
        },
        schedule: {
          period: "period",
          period_date: {
            start: "",
            end: "",
          },
          single_date: "",
          view_type: "show_without_title",
        },
        conditions: [this.getDefaultCondition()],
      };
    },

    mapConditionResponseToForm(
      condition: IDiscountConditionResponse,
      totalsOptions: IDiscountTotalOption[],
    ): IDiscountConditionForm {
      const aliases = condition.field_alias
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const totals = totalsOptions.filter((option) =>
        aliases.includes(option.alias),
      );

      const discountType: DiscountConditionType =
        condition.discount_type === "free" ||
        condition.discount_type === "fixed_amount" ||
        condition.discount_type === "percent_of_amount"
          ? condition.discount_type
          : "percent_of_amount";

      return {
        totals,
        condition:
          condition.condition_symbol === "<" ||
          condition.condition_symbol === "="
            ? condition.condition_symbol
            : ">",
        over_price: Number(condition.over_price) || 0,
        discount_type: discountType,
        discount_amount: Number(condition.discount_amount) || 0,
      };
    },

    mapDiscountResponseToForm(discount: IDiscountResponse): IDiscountForm {
      const totalsOptions = this.getTotalsOptions();
      const conditions = (discount.conditions || []).map((condition) =>
        this.mapConditionResponseToForm(condition, totalsOptions),
      );

      const period = this.isPeriod(discount.period)
        ? discount.period
        : "period";

      return {
        discount_id: Number(discount.discount_id),
        title: discount.title || "",
        is_promo: Boolean(discount.is_promo),
        promocode: {
          promocode: discount.promocode || "",
          promocode_count: Number(discount.promocode_count) || 0,
          promocode_used: Number(discount.promocode_used) || 0,
        },
        schedule: {
          period,
          period_date: {
            start: discount.period_start_date || "",
            end: discount.period_end_date || "",
          },
          single_date: discount.single_date || "",
          view_type:
            discount.view_type === "show_with_title"
              ? "show_with_title"
              : "show_without_title",
        },
        conditions: conditions.length
          ? conditions
          : [this.getDefaultCondition()],
      };
    },

    isPeriod(value: string): value is DiscountPeriod {
      return (
        value === "period" || value === "single_day" || value === "permanently"
      );
    },

    initFromBootstrap(discountsCollection?: IDiscountsCollection): void {
      this.hydrateListParams();

      if (!discountsCollection) return;

      this.setDiscounts(discountsCollection.discounts || []);
      this.setDiscountsCount(discountsCollection.discounts_count);
      this.isLoaded = true;
    },

    applyDiscountListResponse(response: IDiscountsCollection): void {
      const rows = response?.discounts || [];
      const count = Number(response?.discounts_count) || 0;

      if (count === 0) {
        this.setDiscounts([]);
        this.setDiscountsCount(0);
        this.resetListParams();
        return;
      }

      if (rows.length === 0 && count > 0 && this.listParams.page > 1) {
        this.patchListParams({ page: this.listParams.page - 1 });
        this.persistListParams();
        return;
      }

      this.setDiscounts(rows);
      this.setDiscountsCount(count);
      this.persistListParams();
    },

    async fetchDiscounts(calcId: number): Promise<void> {
      this.hydrateListParams();

      const response = await DiscountAPI.fetchDiscounts({
        action: "calc_discount_list",
        nonce: window?.ccb_nonces?.ccb_get_discounts || "",
        calc_id: calcId,
        pagination: this.listParams,
      });

      if (!response.success) {
        toast(response.message || "Unable to fetch discounts", {
          type: "error",
        });
        return;
      }

      const previousPage = this.listParams.page;
      this.applyDiscountListResponse(response.data.discounts);

      if (this.listParams.page !== previousPage) {
        await this.fetchDiscounts(calcId);
      }
    },

    async createDiscount(
      calcId: number,
      discount: IDiscountForm,
    ): Promise<boolean> {
      const response = await DiscountAPI.createDiscount({
        action: "calc_create_discount",
        nonce: window?.ccb_nonces?.ccb_create_discount || "",
        calc_id: calcId,
        discount,
        pagination: this.listParams,
      });

      if (!response.success) {
        toast(response.message || "Unable to create discount", {
          type: "error",
        });
        return false;
      }

      this.applyDiscountListResponse(response.data.discounts);
      this.selectedDiscountIds = [];
      return true;
    },

    async updateDiscount(
      calcId: number,
      discount: IDiscountForm,
    ): Promise<boolean> {
      if (!discount.discount_id) return false;

      const response = await DiscountAPI.updateDiscount({
        action: "calc_update_discount",
        nonce: window?.ccb_nonces?.ccb_update_discount || "",
        calc_id: calcId,
        discount_id: discount.discount_id,
        discount,
        pagination: this.listParams,
      });

      if (!response.success) {
        toast(response.message || "Unable to update discount", {
          type: "error",
        });
        return false;
      }

      this.applyDiscountListResponse(response.data.discounts);
      this.selectedDiscountIds = [];
      return true;
    },

    async deleteDiscount(calcId: number, discountId: number): Promise<boolean> {
      const response = await DiscountAPI.deleteDiscount({
        action: "calc_delete_discount",
        nonce: window?.ccb_nonces?.ccb_delete_discount || "",
        calc_id: calcId,
        discount_id: discountId,
        pagination: this.listParams,
      });

      if (!response.success) {
        toast(response.message || "Unable to delete discount", {
          type: "error",
        });
        return false;
      }

      const previousPage = this.listParams.page;
      this.applyDiscountListResponse(response.data.discounts);
      if (this.listParams.page !== previousPage) {
        await this.fetchDiscounts(calcId);
      }

      this.selectedDiscountIds = [];
      return true;
    },

    async duplicateDiscount(
      calcId: number,
      discountId: number,
    ): Promise<boolean> {
      const response = await DiscountAPI.duplicateDiscount({
        action: "calc_duplicate_discount",
        nonce: window?.ccb_nonces?.ccb_duplicate_discount || "",
        calc_id: calcId,
        discount_id: discountId,
        pagination: this.listParams,
      });

      if (!response.success) {
        toast(response.message || "Unable to duplicate discount", {
          type: "error",
        });
        return false;
      }

      this.applyDiscountListResponse(response.data.discounts);
      this.selectedDiscountIds = [];
      return true;
    },

    async deleteBulk(calcId: number, ids: number[]): Promise<boolean> {
      if (!ids.length) return false;

      const response = await DiscountAPI.deleteDiscount({
        action: "calc_delete_discount",
        nonce: window?.ccb_nonces?.ccb_delete_discount || "",
        calc_id: calcId,
        discount_ids: ids,
        pagination: this.listParams,
      });

      if (!response.success) {
        toast(response.message || "Unable to delete discounts", {
          type: "error",
        });
        return false;
      }

      const previousPage = this.listParams.page;
      this.applyDiscountListResponse(response.data.discounts);
      if (this.listParams.page !== previousPage) {
        await this.fetchDiscounts(calcId);
      }

      this.selectedDiscountIds = [];
      return true;
    },

    async duplicateBulk(calcId: number, ids: number[]): Promise<boolean> {
      if (!ids.length) return false;

      const response = await DiscountAPI.duplicateDiscount({
        action: "calc_duplicate_discount",
        nonce: window?.ccb_nonces?.ccb_duplicate_discount || "",
        calc_id: calcId,
        discount_ids: ids,
        pagination: this.listParams,
      });

      if (!response.success) {
        toast(response.message || "Unable to duplicate discounts", {
          type: "error",
        });
        return false;
      }

      this.applyDiscountListResponse(response.data.discounts);
      this.selectedDiscountIds = [];
      return true;
    },

    setSort(sortBy: DiscountSortBy): void {
      const direction: DiscountSortDirection =
        this.listParams.sortBy === sortBy && this.listParams.direction === "asc"
          ? "desc"
          : "asc";

      this.patchListParams({
        sortBy,
        direction,
        page: 1,
      });
      this.persistListParams();
    },

    setPage(page: number): void {
      const normalized = page > 0 ? page : 1;
      this.patchListParams({ page: normalized });
      this.persistListParams();
    },

    setLimit(limit: number): void {
      const normalized = limit > 0 ? limit : DEFAULT_DISCOUNT_LIST_PARAMS.limit;
      this.patchListParams({ limit: normalized, page: 1 });
      this.persistListParams();
    },

    openCreateModal(): void {
      this.activeDiscount = this.getDefaultDiscountForm();
      this.isModalOpen = true;
    },

    openEditModal(discountId: number): void {
      const selected = this.discounts.find(
        (discount) => Number(discount.discount_id) === discountId,
      );
      if (!selected) return;

      this.activeDiscount = this.mapDiscountResponseToForm(selected);
      this.isModalOpen = true;
    },

    closeModal(): void {
      this.isModalOpen = false;
      this.activeDiscount = null;
    },

    generatePromoCode(length = 10): string {
      const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        code += charset.charAt(randomIndex);
      }

      return code;
    },
  },
});
