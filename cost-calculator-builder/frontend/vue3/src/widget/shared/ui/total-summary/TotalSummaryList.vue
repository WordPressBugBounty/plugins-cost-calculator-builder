<template>
  <component :is="currentComponents" :summaries="props.summaries">
    <slot v-if="props.listType === 'total'"></slot>
  </component>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { Field } from "@/widget/shared/types/fields";

type Props = {
  listType: "total" | "summary";
  summaries?: Field[];
};

const props = defineProps<Props>();
const currentComponents = computed(() => {
  if (props.listType === "total") {
    return defineAsyncComponent(() => import("./lists/TotalsList.vue"));
  } else if (props.listType === "summary") {
    return defineAsyncComponent(() => import("./lists/SummaryList.vue"));
  }

  return "";
});
</script>
