<template>
  <OrderForm
    v-if="shouldShowForm"
    v-show="!isPaymentAfterSubmitPhase"
    class="ccb-total-summary-action"
    :options="item.options"
  />
</template>

<script setup lang="ts">
import { computed, watchEffect, onMounted, onBeforeUnmount } from "vue";
import OrderForm from "@/widget/features/submission/order-form";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { usePaymentAfterSubmitStore } from "@/widget/app/providers/stores/paymentAfterSubmit.ts";
import { usePaymentStore } from "@/widget/app/providers/stores/paymentsStore.ts";
import { useSubmissionStore } from "@/widget/app/providers/stores/submissionStore.ts";

const settingsStore = useSettingsStore();
const paymentAfterSubmitStore = usePaymentAfterSubmitStore();
const paymentStore = usePaymentStore();
const submissionStore = useSubmissionStore();

type Props = {
  showSummary: boolean;
  item: any;
};

const props = defineProps<Props>();

const orderFormStatus = computed(() => {
  return settingsStore.getFormSettings?.accessEmail;
});

const isSummaryDisplayEnabled = computed(() => {
  return !!settingsStore.getFormSettings?.summaryDisplay?.enable;
});

const shouldShowForm = computed(() => {
  if (!orderFormStatus.value) return false;
  if (isSummaryDisplayEnabled.value) return true;
  return props.showSummary;
});

const hasPaymentMethods = computed(() => {
  const formSettings = settingsStore.getFormSettings;
  return formSettings?.payment && formSettings?.paymentMethods?.length;
});

watchEffect(() => {
  if (orderFormStatus.value && hasPaymentMethods.value) {
    paymentAfterSubmitStore.setIsPaymentAfterSubmit(true);
  }
});

const isPaymentAfterSubmitPhase = computed(() => {
  return (
    paymentAfterSubmitStore.isPaymentAfterSubmit &&
    paymentAfterSubmitStore.getSubmit
  );
});

const handleWooCheckout = () => {
  paymentStore.updatePaymentType("woocommerce");
  submissionStore.submissionCreateOrder();
};

onMounted(() => {
  window.addEventListener("ccbWooCheckout", handleWooCheckout);
});

onBeforeUnmount(() => {
  window.removeEventListener("ccbWooCheckout", handleWooCheckout);
});
</script>
