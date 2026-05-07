import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import { useFlowStore } from "@/admin/app/providers/stores/useFlowStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { ImportExportAPI } from "@/admin/shared/api/ImportExportAPI";
import { ImportInfoMap } from "@/admin/shared/types/api/import.response.type";

interface IImportExportStore {
  selectedFile: File | null;
  isDragOver: boolean;
  isLoadingTotal: boolean;
  isImporting: boolean;
  isFinished: boolean;
  isCustomImport: boolean;
  progress: number;
  step: string[];
  stepProgress: string | null;
  info: ImportInfoMap;
  infoProgress: ImportInfoMap;
  progressData: string;
  errorMessage: string | null;
}

export const useImportExportStore = defineStore("import_export_store", {
  state: (): IImportExportStore => ({
    selectedFile: null,
    isDragOver: false,
    isLoadingTotal: false,
    isImporting: false,
    isFinished: false,
    isCustomImport: false,
    progress: 0,
    step: [],
    stepProgress: null,
    info: {},
    infoProgress: {},
    progressData: "",
    errorMessage: null,
  }),

  getters: {},

  actions: {
    reset(): void {
      this.selectedFile = null;
      this.isDragOver = false;
      this.isLoadingTotal = false;
      this.isImporting = false;
      this.isFinished = false;
      this.isCustomImport = false;
      this.progress = 0;
      this.step = [];
      this.stepProgress = null;
      this.info = {};
      this.infoProgress = {};
      this.progressData = "";
      this.errorMessage = null;
    },

    setDragOver(state: boolean): void {
      this.isDragOver = state;
    },

    setSelectedFile(file: File | null): void {
      this.selectedFile = file;
    },

    async prepareCustomImport(file: File): Promise<boolean> {
      const translationsStore = useBuilderTranslationsStore();
      const translations = translationsStore.getTranslations;
      this.errorMessage = null;
      this.isFinished = false;
      this.selectedFile = file;
      this.isLoadingTotal = true;

      try {
        const response = await ImportExportAPI.getCustomImportTotal({
          action: "cost-calculator-custom-import-total",
          nonce: window?.ccb_nonces?.ccb_custom_import || "",
          file,
          type: "single",
        });

        if (!response.success || !response.message) {
          throw new Error("Unable to parse import file.");
        }

        this.info = response.message;
        this.infoProgress = Object.keys(this.info).reduce<ImportInfoMap>(
          (acc, key) => {
            acc[key] = 0;
            return acc;
          },
          {},
        );
        this.isCustomImport = true;

        return true;
      } catch {
        this.errorMessage = translations.importFailedThereIsAnErrorWithTheFile;
        toast(this.errorMessage, { type: "error" });
        return false;
      } finally {
        this.isLoadingTotal = false;
      }
    },

    async loadDemoImportTotal(): Promise<boolean> {
      const translationsStore = useBuilderTranslationsStore();
      const translations = translationsStore.getTranslations;
      this.errorMessage = null;
      this.isFinished = false;
      this.isLoadingTotal = true;

      try {
        const response = await ImportExportAPI.getDemoImportTotal({
          action: "cost-calculator-demo-calculators-total",
          nonce: window?.ccb_nonces?.ccb_demo_import_apply || "",
        });

        this.info = response || {};
        this.infoProgress = Object.keys(this.info).reduce<ImportInfoMap>(
          (acc, key) => {
            acc[key] = 0;
            return acc;
          },
          {},
        );
        this.isCustomImport = false;
        return Object.keys(this.info).length > 0;
      } catch {
        this.errorMessage = translations.unableToLoadImportTotals;
        toast(this.errorMessage, { type: "error" });
        return false;
      } finally {
        this.isLoadingTotal = false;
      }
    },

    nextKey(db: ImportInfoMap, key: string): string | null {
      const keys = Object.keys(db);
      const index = keys.indexOf(key);
      const next = index + 1;
      return typeof keys[next] !== "undefined" ? keys[next] : null;
    },

    async startImport(): Promise<boolean> {
      const translationsStore = useBuilderTranslationsStore();
      const translations = translationsStore.getTranslations;
      if (!Object.keys(this.info).length) {
        this.errorMessage = translations.noImportDataIsAvailable;
        return false;
      }

      this.isImporting = true;
      this.progressData = "";
      this.progress = 0;
      this.step = Object.keys(this.info);
      this.stepProgress = this.step[0] ?? null;
      this.errorMessage = null;

      const flowStore = useFlowStore();

      try {
        let guard = 0;
        let sameKeyAttempts = 0;

        while (this.stepProgress !== null) {
          guard++;
          if (guard > 10000) {
            throw new Error("Import loop stopped due to safety guard.");
          }

          const currentStep = this.stepProgress;
          const total = Number(this.info[currentStep] || 0);

          if (total === 0) {
            this.stepProgress = this.nextKey(this.info, currentStep);
            this.progress = 0;
            continue;
          }

          const currentKey = Number(this.infoProgress[currentStep] || 0);
          const response = await ImportExportAPI.runImport({
            action: "cost-calculator-import-run",
            step: currentStep,
            key: currentKey,
            nonce: window?.ccb_nonces?.ccb_demo_import_run || "",
            is_custom_import: this.isCustomImport,
          });

          this.progressData += `${response.data ?? "Empty Data"}\n`;

          if (!response.success) {
            throw new Error("Import failed.");
          }

          const responseKey = Number(response.key || 0);

          if (responseKey === currentKey) {
            sameKeyAttempts++;
            if (sameKeyAttempts > 20) {
              throw new Error("Import has stalled.");
            }
          } else {
            sameKeyAttempts = 0;
          }

          this.infoProgress[currentStep] = responseKey;
          this.progress = Math.min(100, Math.ceil((responseKey / total) * 100));

          if (responseKey >= total) {
            const nextStep = this.nextKey(this.info, currentStep);
            this.stepProgress = nextStep;
            this.progress = nextStep === null ? 100 : 0;
          }
        }

        this.isFinished = true;
        toast(translations.importCompleted, { type: "success" });

        await ImportExportAPI.runCalcUpdates({
          action: "calc_run_updates",
          access: true,
          nonce: window?.ccb_nonces?.ccb_run_calc_updates || "",
        });

        await flowStore.fetchCalculators();
        return true;
      } catch {
        this.errorMessage = translations.importFailedThereIsAnErrorWithTheFile;
        toast(this.errorMessage, { type: "error" });
        return false;
      } finally {
        this.isImporting = false;
      }
    },
  },
});
