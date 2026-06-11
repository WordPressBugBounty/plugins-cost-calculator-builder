<template>
  <div class="ccb-calculator-page-container">
    <Transition name="fade" mode="out-in">
      <component :is="activeModule" :key="moduleKey" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const builderStore = useBuilderStore();
const builderContent = builderStore.getBuilderContent;

const CalculatorModule = defineAsyncComponent(
  () => import("@/admin/features/builder/calculator/Calculator.vue"),
);
const OrderFormModule = defineAsyncComponent(
  () => import("@/admin/features/builder/order-form/OrderForm.vue"),
);
const ConfirmationModule = defineAsyncComponent(
  () => import("@/admin/features/builder/confirmation/Confirmation.vue"),
);

const moduleKey = computed(() => {
  if (
    builderContent.content === "calculator" ||
    builderContent.content === "total-summary"
  ) {
    return "calculator";
  }

  return builderContent.content;
});

const activeModule = computed(() => {
  switch (builderContent.content) {
    case "calculator":
      return CalculatorModule;
    case "total-summary":
      return CalculatorModule;
    case "order-form":
      return OrderFormModule;
    case "confirmation":
      return ConfirmationModule;
    default:
      return null;
  }
});
</script>

<style scoped lang="scss">
.ccb-calculator-page-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  span {
    font-size: 24px;
    font-weight: 600;
    color: #000;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
