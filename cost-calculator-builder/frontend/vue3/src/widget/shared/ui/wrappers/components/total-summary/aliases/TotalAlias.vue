<template>
  <TotalSummaryList v-if="showSummary" list-type="total" style="width: 100%">
    <template v-for="summary in totals" :key="summary.alias">
      <Transition name="fade">
        <TotalSummaryItem
          v-if="!summary.hidden"
          item-type="total"
          :summary="summary"
        />
      </Transition>
    </template>
  </TotalSummaryList>
</template>

<script setup lang="ts">
import { Field } from "@/widget/shared/types/fields";
import TotalSummaryList from "@/widget/shared/ui/total-summary/TotalSummaryList.vue";
import TotalSummaryItem from "@/widget/shared/ui/total-summary/TotalSummaryItem.vue";

type Props = {
  showSummary: boolean;
  totals: Field[];
};

defineProps<Props>();
</script>
