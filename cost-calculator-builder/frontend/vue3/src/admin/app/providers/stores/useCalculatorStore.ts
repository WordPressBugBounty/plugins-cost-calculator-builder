import { defineStore } from "pinia";
import { AdminAPI } from "@/admin/shared/api/AdminAPI";
import { toast } from "vue3-toastify";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { useConditionsStore } from "@/admin/app/providers/stores/useConditionsStore";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useTotalSummaryStore } from "@/admin/app/providers/stores/useTotalSummaryStore";
import { useOrderFormStore } from "@/admin/app/providers/stores/useOrderFormStore";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
import { useDiscountsStore } from "@/admin/app/providers/stores/useDiscountsStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { contactFormList } from "@/admin/features/settings/sections/consts/settings.consts";

interface ICalculatorStore {
  title: string;
  id?: number;
  requestLoader: boolean;
}

export const useCalculatorStore = defineStore("calculator_store", {
  state: (): ICalculatorStore => ({
    title: "",
    id: undefined,
    requestLoader: false,
  }),

  getters: {
    getTitle: (state: ICalculatorStore): string => state.title,
    getId: (state: ICalculatorStore): number | undefined => state.id,
    getRequestLoader: (state: ICalculatorStore): boolean => state.requestLoader,
  },

  actions: {
    setRequestLoader(loader: boolean): void {
      this.requestLoader = loader;
    },

    setTitle(title: string): void {
      this.title = title;
    },

    setId(id: number): void {
      this.id = id;
    },

    async getCalculatorAdminData(id: number): Promise<void> {
      this.setRequestLoader(true);
      const settingsStore = useSettingsStore();
      const conditionsStore = useConditionsStore();
      const builderStore = useBuilderStore();
      const totalSummaryStore = useTotalSummaryStore();
      const appearanceStore = useAppearanceStore();
      const orderFormStore = useOrderFormStore();
      const discountsStore = useDiscountsStore();

      discountsStore.hydrateListParams();

      const response = await AdminAPI.getCalculatorAdminData({
        action: "ccb_get_calculator_admin_data",
        nonce: window?.ccb_nonces?.ccb_get_calculator_admin_data || "",
        calc_id: id,
        discount: discountsStore.getDiscountList,
      });

      if (response.success) {
        if (response.data?.calculator_builder) {
          this.setTitle(response.data.calculator_builder.title);
          this.setId(+response.data.calculator_builder.id);
          builderStore.initBuilder(response.data.calculator_builder);
        }
        settingsStore.setSettings(response.data.settings);
        totalSummaryStore.setTotalSummary(response.data.total_summary);
        settingsStore.setGeneralSettings(response.data.general_settings);
        conditionsStore.initConditions(response.data.conditions);

        orderFormStore.initFromAdminData(response.data);
        appearanceStore.initAppearance(response.data.appearance);
        discountsStore.initFromBootstrap(response.data.discounts);

        if (response.data.contact_forms) {
          contactFormList.value = response.data.contact_forms.map(
            (form: { id: number; title: string }) => ({
              label: form.title,
              value: String(form.id),
            }),
          );
        }
        if (!response.data.discounts) {
          await discountsStore.fetchDiscounts(id);
        }
      } else {
        toast(response.message, {
          type: "error",
        });
      }

      setTimeout(() => {
        this.setRequestLoader(false);
      }, 500);
    },

    async saveCalculatorAdminData(): Promise<void> {
      this.setRequestLoader(true);

      const settingsStore = useSettingsStore();
      const conditionsStore = useConditionsStore();
      const builderStore = useBuilderStore();
      const totalSummaryStore = useTotalSummaryStore();
      const appearanceStore = useAppearanceStore();
      const translationsStore = useBuilderTranslationsStore();
      const translations = translationsStore.getTranslations;

      const orderFormErrors = settingsStore.validateOrderForm();
      if (orderFormErrors.length > 0) {
        settingsStore.triggerOrderFormValidation();
        builderStore.setSettingsActiveSection("order-form");
        toast("Please fill in all required Order Form fields.", {
          type: "error",
        });
        this.setRequestLoader(false);
        return;
      }
      settingsStore.resetOrderFormValidation();

      const baseData = {
        action: "calc_save_settings",
        nonce: window?.ccb_nonces?.ccb_save_settings || "",
        id: this.id ? +this.id : 0,
        title: this.title,
        status: "publish",
      };

      const response = await AdminAPI.saveCalculatorAdminData({
        ...baseData,
        settings: settingsStore.getSettings,
        total_summary: totalSummaryStore.getTotalSummary,
        conditions: conditionsStore.serializeConditions(),
        builder: builderStore.getBuilderFields,
      });

      if (response.success) {
        settingsStore.setSettings(response.data.settings);
        totalSummaryStore.setTotalSummary(response.data.total_summary);

        const calcId = this.id ? +this.id : 0;
        const appearanceSaved =
          await appearanceStore.persistEditedPresetForSettingsSave(calcId);
        if (!appearanceSaved) {
          toast(translations.settingsSavedButThemeChangesWereNotSaved, {
            type: "error",
          });
          setTimeout(() => {
            this.setRequestLoader(false);
          }, 500);
          return;
        }

        toast(response.message, {
          type: "success",
        });
      } else {
        toast(response.message, {
          type: "error",
        });
      }

      setTimeout(() => {
        this.setRequestLoader(false);
      }, 500);
    },

    async saveAsTemplate(): Promise<void> {
      const response = await AdminAPI.saveAsTemplate({
        action: "calc_save_as_template",
        nonce: window?.ccb_nonces?.ccb_save_as_template || "",
        calc_id: this.id ? +this.id : 0,
        title: this.title,
        category: "",
      });

      return response as any;
    },
  },
});
