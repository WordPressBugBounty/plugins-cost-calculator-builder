<template>
  <GeneratePdf
    v-if="showSummary"
    class="ccb-total-summary-action"
    :options="item.options"
    :style="containerStyle"
  />
</template>

<script setup lang="ts">
import GeneratePdf from "@/widget/features/pdf-invoice/generate-pdf";
import { computed } from "vue";
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
