<template>
  <div class="ccb-admin-calculator-list__grid">
    <div
      class="ccb-admin-calculator-list__grid-item"
      v-for="(calculator, index) in calculators"
      :style="{ animationDelay: `${index * 40}ms` }"
      :key="calculator.id"
    >
      <CalculatorItem type="grid" :calculator="calculator" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { CalculatorItem } from "@/admin/shared/ui/components/Calculator";
import { ICalculator } from "@/admin/shared/types/calculator.type";

interface ICalculatorGridProps {
  calculators: ICalculator[];
}

const props = defineProps<ICalculatorGridProps>();
const { calculators } = toRefs(props);
</script>

<style scoped lang="scss">
.ccb-admin-calculator-list__grid {
  padding: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;

  &-item {
    position: relative;
    opacity: 0;
    transform: translateY(8px);
    animation: itemIn 280ms ease forwards;
    will-change: transform, opacity;

    &:has(.ccb-calculator-card--dropdown-open) {
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
