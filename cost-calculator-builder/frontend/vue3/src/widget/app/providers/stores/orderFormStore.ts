import { defineStore } from "pinia";
import { useOrderForm } from "@/widget/actions/pro-features/order-form/composable/useOrderForm.ts";
import { usePaymentStore } from "./paymentsStore";
import { useSubmissionStore } from "./submissionStore";

const orderFormInstance = useOrderForm();

interface IOrderFormState {
  nextButtonStatus: boolean;
  nextButton: boolean;
  contactFormDisabled: boolean;
}

export const useOrderFormStore = defineStore("orderForms", {
  state: (): IOrderFormState => ({
    nextButtonStatus: true,
    nextButton: false,
    contactFormDisabled: false,
  }),

  actions: {
    updateNextButtonStatus(value: boolean): void {
      if (value === true) {
        this.contactFormDisabled = false;
      }

      this.nextButtonStatus = value;
    },

    updateNextButton(value: boolean): void {
      this.nextButton = value;
    },

    updateContactFormDisabled(value: boolean): void {
      this.contactFormDisabled = value;
    },

    initOrderForm(formFields: any[] = []): void {
      orderFormInstance.initializeFields(formFields);
    },

    resetBtnData(): void {
      const submissionStore = useSubmissionStore();
      const paymentStore = usePaymentStore();

      submissionStore.reset();
      paymentStore.reset();

      this.nextButtonStatus = true;
      this.nextButton = false;
      this.contactFormDisabled = false;
    },
  },

  getters: {
    getNextButtonStatus: (state: IOrderFormState): boolean =>
      state.nextButtonStatus,
    getNextButton: (state: IOrderFormState): boolean => state.nextButton,
    getContactFormDisabled: (state: IOrderFormState): boolean =>
      state.contactFormDisabled,
  },
});
