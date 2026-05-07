<template>
  <div class="ccb-admin-calculator-list__list">
    <div
      class="ccb-admin-calculator-list__list-item"
      v-for="(calculator, index) in calculators"
      :key="calculator.id"
      :style="{ animationDelay: `${index * 40}ms` }"
    >
      <CalculatorItem type="list" :calculator="calculator" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { CalculatorItem } from "@/admin/shared/ui/components/Calculator";
import { ICalculator } from "@/admin/shared/types/calculator.type";

interface ICalculatorListProps {
  calculators: ICalculator[];
}

const props = defineProps<ICalculatorListProps>();
const { calculators } = toRefs(props);
</script>

<style scoped lang="scss">
.ccb-admin-calculator-list__list {
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  gap: 2px;

  &-item {
    position: relative;
    opacity: 0;
    transform: translateY(8px);
    animation: itemIn 280ms ease forwards;
    will-change: transform, opacity;

    &:has(.ccb-calculator-row--dropdown-open) {
      z-index: 10;
    }
  }
}

@keyframes itemIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
