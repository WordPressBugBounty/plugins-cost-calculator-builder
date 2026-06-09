import { defineStore } from "pinia";
import { ISettings } from "@/admin/shared/types/settings.type";
import { IGeneralSettings } from "@/admin/shared/types/general-settings.type";

interface ISettingsStore {
  settings: ISettings | null;
  general_settings: IGeneralSettings | null;
  orderFormValidationTriggered: boolean;
}

export const useSettingsStore = defineStore("settings_store", {
  state: (): ISettingsStore => ({
    settings: null,
    general_settings: null,
    orderFormValidationTriggered: false,
  }),

  getters: {
    getSettings: (state: ISettingsStore): ISettings | null => state.settings,
    getGeneralSettings: (state: ISettingsStore): IGeneralSettings | null =>
      state.general_settings,

    getPaymentsStatus: (state: ISettingsStore): boolean => {
      return (
        state.settings?.payment_gateway?.cards?.card_payments?.stripe?.enable ||
        state.settings?.payment_gateway?.cards?.card_payments?.razorpay
          ?.enable ||
        state.settings?.payment_gateway?.paypal?.enable ||
        state.settings?.payment_gateway?.cash_payment?.enable ||
        state.settings?.woo_checkout?.enable ||
        false
      );
    },

    getOrderFormStatus: (state: ISettingsStore): boolean => {
      return state.settings?.formFields?.accessEmail || false;
    },

    getOrderFormValidationTriggered: (state: ISettingsStore): boolean =>
      state.orderFormValidationTriggered,
  },

  actions: {
    setSettings(settings: ISettings): void {
      this.settings = settings;
    },
    setGeneralSettings(general_settings: IGeneralSettings): void {
      this.general_settings = general_settings;
    },
    triggerOrderFormValidation(): void {
      this.orderFormValidationTriggered = true;
    },
    resetOrderFormValidation(): void {
      this.orderFormValidationTriggered = false;
    },
    validateOrderForm(): string[] {
      const fields = this.settings?.formFields;
      if (!fields) return [];

      const errors: string[] = [];
      const isValidEmail = (value: string): boolean =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

      if (
        fields.adminEmailAddress?.trim() &&
        !isValidEmail(fields.adminEmailAddress)
      )
        errors.push("adminEmailAddressInvalid");

      if (!fields.accessEmail) return errors;

      if (fields.formType === "cost-calculator" && !fields.applyFormId?.trim())
        errors.push("applyFormId");
      if (fields.formType === "contact-form" && !fields.contactFormId?.trim())
        errors.push("contactFormId");
      if (!fields.openModalBtnText?.trim()) errors.push("openModalBtnText");
      if (!fields.submitBtnText?.trim()) errors.push("submitBtnText");
      if (!fields.emailSubject?.trim() && fields.formType === "cost-calculator")
        errors.push("emailSubject");
      if (
        !fields.adminEmailAddress?.trim() &&
        fields.formType === "cost-calculator"
      )
        errors.push("adminEmailAddress");
      return errors;
    },
  },
});
