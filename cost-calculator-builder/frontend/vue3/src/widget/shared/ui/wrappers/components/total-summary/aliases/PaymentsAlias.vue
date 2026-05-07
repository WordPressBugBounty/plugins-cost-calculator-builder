<template>
  <div v-if="shouldBeVisible" style="display: contents">
    <PaymentList :payment="false" />
    <div
      v-if="showMakePaymentButton"
      class="ccb-payment-after-submit-btn-wrapper"
    >
      <Button
        :text="getMakePaymentText"
        type="success"
        :on-click="makePaymentAction"
        :disabled="makePaymentBtnDisabled"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PaymentList from "@/widget/features/submission/payments/PaymentList.vue";
import Button from "@/widget/shared/ui/components/Button";
import { usePaymentAfterSubmitStore } from "@/widget/app/providers/stores/paymentAfterSubmit.ts";
import { usePaymentStore } from "@/widget/app/providers/stores/paymentsStore.ts";
import { useSubmissionStore } from "@/widget/app/providers/stores/submissionStore.ts";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";

type Props = {
  showSummary: boolean;
  item?: any;
};

const props = defineProps<Props>();
const settingsStore = useSettingsStore();

const paymentAfterSubmitStore = usePaymentAfterSubmitStore();
const paymentStore = usePaymentStore();
const submissionStore = useSubmissionStore();
const translationsStore = useTranslationsStore();
const fieldsStore = useFieldsStore();

const isPaymentAfterSubmitMode = computed(() => {
  return paymentAfterSubmitStore.isPaymentAfterSubmit;
});

const isSummaryDisplayEnabled = computed(() => {
  return !!settingsStore.getFormSettings?.summaryDisplay?.enable;
});

const isSummaryBlockActive = computed(() => {
  const actionAfterSubmit =
    settingsStore.getFormSettings?.summaryDisplay?.actionAfterSubmit;
  return (
    isSummaryDisplayEnabled.value &&
    ["show_summary_block", "show_summary_block_with_pdf"].includes(
      actionAfterSubmit || "",
    ) &&
    settingsStore.getSummaryDisplayShowSummary
  );
});

const shouldShowPayments = computed(() => {
  if (isSummaryBlockActive.value) return true;
  if (!isPaymentAfterSubmitMode.value) return true;
  return paymentAfterSubmitStore.getSubmit;
});

const shouldBeVisible = computed(() => {
  if (!props.showSummary && isSummaryDisplayEnabled.value) {
    return shouldShowPayments.value;
  }
  return props.showSummary && shouldShowPayments.value;
});

const showMakePaymentButton = computed(() => {
  if (isSummaryBlockActive.value && paymentStore.paymentType) return true;
  return isPaymentAfterSubmitMode.value && paymentAfterSubmitStore.getSubmit;
});

const getMakePaymentText = computed((): string => {
  const makePayment =
    translationsStore.getTranslations.makePayment || "Make Payment";
  if (paymentStore.paymentType === "woocommerce") {
    return "Add to cart";
  }
  return makePayment;
});

const makePaymentBtnDisabled = computed(() => {
  if (!paymentStore.paymentType) return true;
  return fieldsStore.getRequiredFields.length > 0;
});

const makePaymentAction = () => {
  submissionStore.submissionCreateOrder();
};
</script>

<style scoped lang="scss">
.ccb-payment-after-submit-btn-wrapper {
  width: 100%;
  display: flex;
  margin-top: 10px;

  button {
    width: 100%;
  }
}
</style>
