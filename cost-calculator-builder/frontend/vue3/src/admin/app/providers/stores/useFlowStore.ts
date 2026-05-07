import { ICalculator } from "@/admin/shared/types/calculator.type";
import { defineStore } from "pinia";
import { IFetchFlowRequestParams } from "@/admin/shared/types/api/flow.request.type";
import { FlowAPI } from "@/admin/shared/api/FlowAPI";
import {
  ITemplate,
  ITemplateCategory,
} from "@/admin/shared/types/template.type";
import { toast } from "vue3-toastify";

interface IFlowStore {
  calculators: ICalculator[];
  params: IFetchFlowRequestParams;
  templates: ITemplate[];
  categories: ITemplateCategory[];
  admin_email: string;
  pro_active: boolean;
  unlock: boolean;
  favorites: number[];
  total: number;
  getFirstLoadCalculatorsCount: number;
  firstLoad: boolean;
  selectedIds: number[];
  viewType: string;
}

export const useFlowStore = defineStore("flow_store", {
  state: (): IFlowStore => ({
    calculators: [],
    templates: [],
    categories: [],
    params: {
      limit: 10,
      page: 1,
      sortBy: "id",
      direction: "desc",
    },
    admin_email: "",
    pro_active: false,
    unlock: false,
    favorites: [],
    total: 0,
    getFirstLoadCalculatorsCount: 10,
    firstLoad: true,
    selectedIds: [],
    viewType: "list",
  }),

  getters: {
    getCalculators: (state: IFlowStore): ICalculator[] => state.calculators,
    getTemplates: (state: IFlowStore): ITemplate[] => state.templates,
    getCategories: (state: IFlowStore): ITemplateCategory[] => state.categories,
    getAdminEmail: (state: IFlowStore): string => state.admin_email,
    getProActive: (state: IFlowStore): boolean => state.pro_active,
    getUnlock: (state: IFlowStore): boolean => state.unlock,
    getFavorites: (state: IFlowStore): number[] => state.favorites,
    getTotal: (state: IFlowStore): number => state.total,
    getSelectedIds: (state: IFlowStore): number[] => state.selectedIds,
    getViewType: (state: IFlowStore): string => state.viewType,
  },

  actions: {
    setCalculators(calculators: ICalculator[]): void {
      this.calculators = calculators;
    },

    setTemplates(templates: ITemplate[]): void {
      this.templates = templates;
    },

    setCategories(categories: ITemplateCategory[]): void {
      this.categories = categories;
    },

    setAdminEmail(admin_email: string): void {
      this.admin_email = admin_email;
    },

    setProActive(pro_active: boolean): void {
      this.pro_active = pro_active;
    },

    setUnlock(unlock: boolean): void {
      this.unlock = unlock;
    },

    setFavorites(favorites: number[]): void {
      this.favorites = favorites;
    },

    setTotal(total: number): void {
      this.total = total;
    },

    setSelectedIds(selectedIds: number[]): void {
      this.selectedIds = selectedIds;
    },

    setViewType(viewType: string): void {
      this.viewType = viewType;
    },

    async fetchCalculators(): Promise<void> {
      this.setSelectedIds([]);

      const limit = parseInt(
        localStorage.getItem("flow_page_size") || "10",
        10,
      );
      const page = parseInt(
        localStorage.getItem("flow_current_page") || "1",
        10,
      );

      this.params.limit = limit;
      this.params.page = page;

      const response = await FlowAPI.fetchCalculators({
        action: "ccb_fetch_calculators",
        nonce: window?.ccb_nonces?.ccb_fetch_calculators || "",
        params: this.params,
      });

      if (response.success) {
        this.setCalculators(response.data.calculators);
        this.setTotal(Number(response.data.total) || 0);

        if (this.firstLoad && response.data.calculators) {
          this.firstLoad = false;
          this.getFirstLoadCalculatorsCount = response.data.calculators.length;
        }
      } else {
        console.error(response.message);
      }
    },

    async fetchTemplates(): Promise<void> {
      const response = await FlowAPI.fetchTemplates({
        action: "ccb_fetch_templates",
        nonce: window?.ccb_nonces?.ccb_fetch_templates || "",
      });

      if (response.success) {
        this.setTemplates(response.data.templates);
        this.setCategories(response.data.categories);
        this.setAdminEmail(response.data.admin_email);
        this.setProActive(response.data.pro_active);
        this.setUnlock(response.data.unlock);
        this.setFavorites(
          response.data.favorites?.map((favorite: number) =>
            Number(favorite),
          ) || [],
        );
      } else {
        console.error(response.message);
      }
    },

    async addFavoriteTemplate(template_id: number): Promise<void> {
      const response = await FlowAPI.addFavoriteTemplate({
        action: "calc_toggle_favorite",
        nonce: window?.ccb_nonces?.ccb_toggle_favorite || "",
        template_id,
      });

      if (response.success) {
        this.setFavorites(
          response.data.favorites?.map((favorite: number) =>
            Number(favorite),
          ) || [],
        );
        toast(response.message, {
          type: "success",
        });
      } else {
        toast(response.message, {
          type: "error",
        });
      }
    },

    async deleteTemplate(id: number): Promise<void> {
      const response = await FlowAPI.deleteTemplate({
        action: "calc_delete_templates",
        nonce: window?.ccb_nonces?.ccb_delete_template || "",
        id,
      });

      if (response.success) {
        if (response.templates) {
          this.setTemplates(Object.values(response.templates));
        }

        toast(response.message, {
          type: "success",
        });
      } else {
        toast(response.message, {
          type: "error",
        });
      }
    },
  },
});
