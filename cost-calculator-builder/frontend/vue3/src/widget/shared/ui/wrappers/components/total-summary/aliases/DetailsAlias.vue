<template>
  <TotalSummaryList
    v-if="showSummary && isDetailsVisible"
    list-type="summary"
    :summaries="summaries"
    style="width: 100%"
  />
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { Field } from "@/widget/shared/types/fields";
import TotalSummaryList from "@/widget/shared/ui/total-summary/TotalSummaryList.vue";

type Props = {
  showSummary: boolean;
  summaries: Field[];
  isDetailsVisible: boolean;
};

defineProps<Props>();
</script>
