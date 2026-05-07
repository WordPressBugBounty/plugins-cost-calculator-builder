import { defineStore } from "pinia";
import { FlowAPI } from "@/admin/shared/api/FlowAPI";
import { ImportExportAPI } from "@/admin/shared/api/ImportExportAPI";
import { toast } from "vue3-toastify";

export type Page = "" | "flow" | "calculator";

interface IAppStore {
  editMode: boolean;
  demo: boolean;
  calcId: number | null;
  page: Page;
  currentPage: string;
  exportLink: string;
  isPro: boolean;
  calcUrl: string;
}

export const useAppStore = defineStore("app_store", {
  state: (): IAppStore => ({
    editMode: false,
    demo: false,
    calcId: null,
    page: "",
    currentPage: "",
    exportLink: "",
    isPro: false,
    calcUrl: "",
  }),

  getters: {
    getEditMode: (state: IAppStore): boolean => state.editMode,
    getDemo: (state: IAppStore): boolean => state.demo,
    getCalcId: (state: IAppStore): number | null => state.calcId,
    getPage: (state: IAppStore): Page => state.page,
    getCurrentPage: (state: IAppStore): string => state.currentPage,
    getExportLink: (state: IAppStore): string => state.exportLink,
    getIsPro: (state: IAppStore): boolean => state.isPro,
    getCalcUrl: (state: IAppStore): string => state.calcUrl,
  },

  actions: {
    setEditMode(editMode: boolean): void {
      this.editMode = editMode;
    },
    setDemo(demo: boolean): void {
      this.demo = demo;
    },
    setCalcId(calcId: number | null): void {
      this.calcId = calcId;
    },
    setPage(page: Page): void {
      this.page = page;
    },
    setCurrentPage(currentPage: string): void {
      this.currentPage = currentPage;
    },

    setExportLink(exportLink: string): void {
      this.exportLink = exportLink;
    },

    setIsPro(isPro: boolean): void {
      this.isPro = isPro;
    },

    setCalcUrl(calcUrl: string): void {
      this.calcUrl = calcUrl;
    },

    async createCalculator(): Promise<void> {
      const response = await FlowAPI.createCalculator({
        action: "calc_create_id",
        nonce: (window as any).ccb_nonces.ccb_create_id,
      });

      if (response.success) {
        this.setPage("calculator");
        this.setEditMode(true);
        this.setCalcId(response.data.id);
        (window as any).history.replaceState({}, "", `?${response.data.url}`);
      }
    },

    async editCalculator(id: number): Promise<void> {
      const response = await FlowAPI.editCalculator({
        action: "calc_edit_calc",
        nonce: (window as any).ccb_nonces.ccb_edit_calc,
        id: id,
      });

      if (response.success) {
        this.setEditMode(true);
        this.setPage("calculator");
        this.setCurrentPage("calculator");
        this.setCalcId(id);
        (window as any).history.replaceState({}, "", `?${response.data.url}`);
      }
    },

    async useTemplate(templateId: number): Promise<void> {
      const response = await FlowAPI.useTemplate({
        action: "calc_use_template",
        nonce: (window as any).ccb_nonces.ccb_use_template,
        template_id: templateId,
      });

      if (response.success) {
        await ImportExportAPI.runCalcUpdates({
          action: "calc_run_updates",
          access: true,
          nonce: (window as any).ccb_nonces.ccb_run_calc_updates,
        });
        await this.editCalculator(response.data.id);
      }
    },

    async deleteTemplate(id: number): Promise<void> {
      const response = await FlowAPI.deleteTemplate({
        action: "calc_delete_templates",
        nonce: (window as any).ccb_nonces.ccb_delete_template,
        id: id,
      });

      toast(response.message, {
        type: response.success ? "success" : "error",
      });
    },

    async deleteCalculators(ids: number[]): Promise<void> {
      const response = await FlowAPI.deleteCalculators({
        action: "ccb_delete_calc",
        nonce: (window as any).ccb_nonces.ccb_delete_calc,
        ids: ids,
      });

      if (response.success) {
        toast(response.message, {
          type: "success",
        });
      } else {
        toast(response.message, {
          type: "error",
        });
      }
    },

    async duplicateCalculators(ids: number[]): Promise<void> {
      const response = await FlowAPI.duplicateCalculators({
        action: "ccb_duplicate_calc",
        nonce: (window as any).ccb_nonces.ccb_duplicate_calc,
        ids: ids,
      });

      if (response.success) {
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
