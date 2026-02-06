<template>
  <transition name="layout-fade" mode="out-in">
    <component
      :is="currentComponents"
      :key="appearanceStore.getAppearanceBoxStyle"
    >
      <slot />
    </component>
  </transition>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";

const appearanceStore = useAppearanceStore();

const settingsStore = useSettingsStore();

const currentComponents = computed(() => {
  if (settingsStore.getGeneralSettings?.layout === "horizontal-layout") {
    return defineAsyncComponent(() => import("./components/Horizontal.vue"));
  } else if (settingsStore.getGeneralSettings?.layout === "vertical-layout") {
    return defineAsyncComponent(() => import("./components/Vertical.vue"));
  } else {
    return defineAsyncComponent(() => import("./components/TwoColumns.vue"));
  }
});
</script>

<style lang="scss">
.layout-fade-enter-active,
.layout-fade-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.layout-fade-enter-from,
.layout-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
  &.ccb-layout-container {
    min-height: fit-content;
  }
  .ccb-invoice {
    .layout-container {
      display: none !important;
    }
  }
}

.layout-fade-enter-to,
.layout-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  &.ccb-layout-container {
    min-height: fit-content;
  }
  .ccb-invoice {
    .layout-container {
      display: none !important;
    }
  }
}

.ccb-actions {
  display: flex;
  flex-direction: row;
  gap: 10px;
  flex-wrap: wrap;

  &__item {
    width: 100%;

    button {
    }
  }

  &.button-2 {
    display: flex;
    gap: 10px;
    justify-content: space-between;

    &.has-share {
      flex-direction: column !important;
    }
  }
}
</style>
