<template>
  <div class="ccb-calculator-page-container">
    <Transition name="fade" mode="out-in">
      <component :is="activeModule" :key="builderContent.content" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const builderStore = useBuilderStore();
const builderContent = builderStore.getBuilderContent;

const activeModule = computed(() => {
  switch (builderContent.content) {
    case "calculator":
      return defineAsyncComponent(
        () => import("@/admin/features/builder/calculator/Calculator.vue"),
      );
    case "total-summary":
      return defineAsyncComponent(
        () => import("@/admin/features/builder/total-summary/TotalSummary.vue"),
      );
    case "order-form":
      return defineAsyncComponent(
        () => import("@/admin/features/builder/order-form/OrderForm.vue"),
      );
    case "confirmation":
      return defineAsyncComponent(
        () => import("@/admin/features/builder/confirmation/Confirmation.vue"),
      );
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
