<template>
  <component
    :is="currentComponents"
    :calculator="calculator"
    @toggle-select-calculator="toggleSelectCalculator"
    @delete-calculator="deleteCalculator"
    @duplicate-calculator="duplicateCalculator"
    @edit-calculator="editCalculator"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, toRefs } from "vue";
import { ICalculator } from "@/admin/shared/types/calculator.type";
import { useFlowStore } from "@/admin/app/providers/stores/useFlowStore";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";

type Props = {
  type: "list" | "grid";
  calculator: ICalculator;
};

const props = defineProps<Props>();

const { calculator, type } = toRefs(props);

const flowStore = useFlowStore();
const appStore = useAppStore();

const toggleSelectCalculator = (id: number): void => {
  let selectedIds = [...flowStore.getSelectedIds];
  if (flowStore.getSelectedIds.includes(+id)) {
    selectedIds = selectedIds.filter((_id) => {
      return +_id !== +id;
    });
  } else {
    selectedIds.push(+id);
  }

  flowStore.setSelectedIds(selectedIds);
};

const deleteCalculator = async (id: number): Promise<void> => {
  await appStore.deleteCalculators([id]);
  await flowStore.fetchCalculators();
};

const duplicateCalculator = async (id: number): Promise<void> => {
  await appStore.duplicateCalculators([id]);
  await flowStore.fetchCalculators();
};

const editCalculator = async (id: number): Promise<void> => {
  await appStore.editCalculator(id);
};

const currentComponents = computed(() => {
  if (type.value === "list") {
    return defineAsyncComponent(() => import("./styles/CalculatorRow.vue"));
  } else if (type.value === "grid") {
    return defineAsyncComponent(() => import("./styles/CalculatorCard.vue"));
  }
});
</script>
