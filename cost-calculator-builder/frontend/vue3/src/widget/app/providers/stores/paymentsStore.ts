import { ref } from "vue";
import { defineStore } from "pinia";
import { IPaymentTypes } from "@/widget/actions/pro-features/payments/paymentTypeRegistry.ts";
import type { Stripe } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useFieldsStore } from "./fieldsStore";

type PaymentTypes = "" | keyof IPaymentTypes;

const randomId = Math.random().toString(36).substring(2, 15);

export const usePaymentStore = defineStore(`paymentStore_${randomId}`, () => {
  const stripeInstance = ref<Stripe | null>(null);
  const cardComponent = ref<any>(null);
  const paymentType = ref<PaymentTypes>("");
  const showForm = ref<boolean>(false);
  const paymentMethodId = ref<string>("");
  const paymentIntentId = ref<string>("");
  const paymentAfterSubmitStoredPm = ref<string>("");

  const initializeStripe = async (key: string): Promise<void> => {
    if (!stripeInstance.value) {
      stripeInstance.value = await loadStripe(key);
    }
  };

  const setCardComponent = (component: any): void => {
    cardComponent.value = component;
  };

  const updatePaymentType = (value: PaymentTypes): void => {
    if (value !== paymentType.value) {
      paymentType.value = value;
      const fieldsStore = useFieldsStore();

      if (fieldsStore.checkRequiredFields()) {
        showForm.value = true;
      }
    }
  };

  const setPaymentMethodId = (value: string): void => {
    paymentMethodId.value = value;
  };

  const setPaymentIntentId = (value: string): void => {
    paymentIntentId.value = value;
  };

  const setPaymentAfterSubmitStoredPm = (value: string): void => {
    paymentAfterSubmitStoredPm.value = value;
  };

  const reset = (): void => {
    paymentType.value = "";
    showForm.value = false;
    paymentAfterSubmitStoredPm.value = "";
  };

  return {
    reset,
    updatePaymentType,
    setPaymentMethodId,
    setPaymentIntentId,
    showForm,
    paymentType,
    stripeInstance,
    cardComponent,
    initializeStripe,
    setCardComponent,
    paymentMethodId,
    paymentIntentId,
    paymentAfterSubmitStoredPm,
    setPaymentAfterSubmitStoredPm,
  };
});
