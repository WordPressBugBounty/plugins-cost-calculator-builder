import { computed } from "vue";
import { usePaymentStore } from "@/widget/app/providers/stores/paymentsStore.ts";
import { IPaymentTypes } from "@/widget/actions/pro-features/payments/paymentTypeRegistry.ts";

export function useSinglePayment() {
  const paymentStore = usePaymentStore();

  const paymentType = computed({
    get: () => paymentStore.paymentType,
    set: (newValue: keyof IPaymentTypes) => {
      paymentStore.updatePaymentType(newValue);
    },
  });

  return {
    paymentType,
  };
}
