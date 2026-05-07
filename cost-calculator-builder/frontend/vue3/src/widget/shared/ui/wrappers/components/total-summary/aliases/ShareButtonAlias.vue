<template>
  <PdfInvoice
    v-if="showSummary"
    class="ccb-total-summary-action"
    :style="containerStyle"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import PdfInvoice from "@/widget/features/pdf-invoice/send-quote";

type Props = {
  showSummary: boolean;
  item: any;
};

const props = defineProps<Props>();

const containerStyle = computed(() => {
  const width = props.item.options?.width;
  return {
    width: width ? `calc(${width}% - 5px)` : "100%",
  };
});
</script>
