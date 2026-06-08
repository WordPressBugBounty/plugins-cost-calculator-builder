<template>
  <PdfInvoice
    v-if="showSummary"
    class="ccb-total-summary-action"
    :style="containerStyle"
    :popup-mode="popupMode"
    @open-mobile-quote="$emit('open-mobile-quote')"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import PdfInvoice from "@/widget/features/pdf-invoice/send-quote";

type Props = {
  showSummary: boolean;
  item: any;
  popupMode?: "default" | "mobile-summary" | "mobile-summary-page";
};

const props = defineProps<Props>();
defineEmits(["open-mobile-quote"]);

const containerStyle = computed(() => {
  const width = props.item.options?.width;
  return {
    width: width ? `calc(${width}% - 5px)` : "100%",
  };
});
</script>
