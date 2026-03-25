<template>
  <div class="ccb-layout-container">
    <div class="ccb-live-demo-layout" v-if="isLiveDemoLayout">
      <div
        class="ccb-live-demo-layout__item"
        :class="{
          'ccb-live-demo-layout__item--active':
            activeLayout === 'two-columns-layout',
        }"
        @click="settingsStore.setLayout('two-columns-layout')"
      >
        <i class="ccb-icon-Union-27"></i>
        <span>Two Columns</span>
      </div>
      <div
        class="ccb-live-demo-layout__item"
        :class="{
          'ccb-live-demo-layout__item--active':
            activeLayout === 'vertical-layout',
        }"
        @click="settingsStore.setLayout('vertical-layout')"
      >
        <i class="ccb-icon-Union-26"></i>
        <span>Vertical</span>
      </div>
      <div
        class="ccb-live-demo-layout__item"
        :class="{
          'ccb-live-demo-layout__item--active':
            activeLayout === 'horizontal-layout',
        }"
        @click="settingsStore.setLayout('horizontal-layout')"
      >
        <i class="ccb-icon-Union-25"></i>
        <span>Horizontal</span>
      </div>
    </div>
    <div class="layout-switch">
      <HorizontalLayout v-show="activeLayout === 'horizontal-layout'">
        <slot />
      </HorizontalLayout>
      <VerticalLayout v-show="activeLayout === 'vertical-layout'">
        <slot />
      </VerticalLayout>
      <TwoColumnsLayout v-show="activeLayout === 'two-columns-layout'">
        <slot />
      </TwoColumnsLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { useAppStore } from "@/widget/app/providers/stores/appStore.ts";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";

const appStore = useAppStore();
const fieldsStore = useFieldsStore();
const settingsStore = useSettingsStore();

const HorizontalLayout = defineAsyncComponent(
  () => import("./components/Horizontal.vue"),
);
const VerticalLayout = defineAsyncComponent(
  () => import("./components/Vertical.vue"),
);
const TwoColumnsLayout = defineAsyncComponent(
  () => import("./components/TwoColumns.vue"),
);

const layoutMap = {
  "horizontal-layout": HorizontalLayout,
  "vertical-layout": VerticalLayout,
  "two-columns-layout": TwoColumnsLayout,
} as const;

const activeLayout = computed(() => {
  return settingsStore.getGeneralSettings?.layout ?? "two-columns-layout";
});

const enoughPages = computed(() => {
  return fieldsStore.getPages.length > 1;
});

const isLiveDemoLayout = computed(() => {
  return appStore.getIsLive && !enoughPages.value;
});
</script>

<style lang="scss">
.ccb-layout-container {
  position: relative;
  margin-top: 100px;

  @media (max-width: 1024px) {
    margin-top: 0px;
  }
}

.ccb-live-demo-layout {
  display: flex;
  flex-direction: flex-start;
  padding: 3px;
  border-radius: 8px;
  margin-bottom: 10px;
  color: var(--ccb-text-color);
  width: fit-content;
  position: absolute;
  top: -60px;
  right: 50%;
  transform: translateX(50%);
  z-index: 1000;
  background-color: #d2d8e5;
  white-space: nowrap;

  @media (max-width: 1024px) {
    display: none;
  }

  &__item {
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 10px;
    padding: 10px 25px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    color: rgb(0, 25, 49);

    i {
      font-size: 18px;
    }
  }

  &__item--active {
    background-color: #fff;

    i {
      color: #1ab163;
    }
  }
}

.layout-switch {
  position: relative;
}

.layout-fade-enter-active,
.layout-fade-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.layout-fade-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
  pointer-events: none;
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
