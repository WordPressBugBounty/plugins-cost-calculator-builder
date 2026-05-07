<template>
  <div
    class="layout-preview"
    :class="[`layout-preview--summary-${summaryPosition}`]"
  >
    <div class="layout-preview__calculator" :style="calculatorStyle">
      <div class="layout-preview__content">
        <span class="layout-preview__line layout-preview__line--long" />
        <span class="layout-preview__line layout-preview__line--medium" />
        <span class="layout-preview__line layout-preview__line--short" />
      </div>

      <div
        v-if="navigationPosition !== 'hidden'"
        class="layout-preview__nav"
        :class="{ 'layout-preview__nav--top': navigationPosition === 'top' }"
      >
        <span
          class="layout-preview__nav-btn layout-preview__nav-btn--secondary"
        />
        <span
          class="layout-preview__nav-btn layout-preview__nav-btn--primary"
        />
      </div>
    </div>

    <div class="layout-preview__summary" :style="summaryStyle">
      <span class="layout-preview__summary-line" />
      <span
        class="layout-preview__summary-line layout-preview__summary-line--short"
      />
      <span class="layout-preview__summary-line" />
      <span
        class="layout-preview__summary-line layout-preview__summary-line--short"
      />
      <span class="layout-preview__summary-btn" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const props = defineProps<{
  summaryPosition: "left" | "right" | "bottom";
  calculatorWidth: number;
  summaryWidth: number;
  headerPosition: "top" | "bottom" | "hidden";
  navigationPosition: "top" | "bottom" | "hidden";
}>();

const calculatorStyle = computed(() => {
  return { width: `${props.calculatorWidth}%` };
});

const summaryStyle = computed(() => {
  return { width: `${props.summaryWidth}%` };
});

const { containerColor, accentColor } = useAppearanceColors();
</script>

<style scoped lang="scss">
.layout-preview {
  display: flex;
  gap: 6px;
  width: 100%;
  height: 180px;
  padding: 12px;
  border: 1px solid var(--ccb-input-border);
  border-radius: 8px;
  background-color: var(--ccb-bgr-sidebar-inner, #f5f5f7);

  &--summary-left {
    flex-direction: row-reverse;
  }

  &--summary-right {
    flex-direction: row;
  }

  &--summary-bottom {
    flex-direction: column;
  }

  &__calculator {
    display: flex;
    flex-direction: column;
    background-color: v-bind(containerColor);
    border-radius: 6px;
    padding: 10px;
    gap: 8px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  &__header {
    order: 0;

    &--bottom {
      order: 99;
    }
  }

  &__header-bar {
    display: block;
    width: 60%;
    height: 8px;
    border-radius: 4px;
    background-color: #d9d9d9;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }

  &__line {
    display: block;
    height: 4px;
    border-radius: 2px;
    background-color: #ebebeb;

    &--long {
      width: 80%;
    }
    &--medium {
      width: 55%;
    }
    &--short {
      width: 35%;
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    order: 98;

    &--top {
      order: -1;
    }
  }

  &__nav-btn {
    display: block;
    height: 10px;
    border-radius: 5px;

    &--secondary {
      width: 28px;
      background-color: #d9d9d9;
    }

    &--primary {
      width: 32px;
      background-color: v-bind(accentColor);
    }
  }

  &__summary {
    display: flex;
    flex-direction: column;
    gap: 5px;
    background-color: v-bind(containerColor);
    border-radius: 6px;
    padding: 10px;
    min-width: 0;
    overflow: hidden;
    max-height: 75px;
  }

  &__summary-line {
    display: block;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background-color: #ebebeb;

    &--short {
      width: 60%;
    }
  }

  &__summary-btn {
    display: block;
    width: 100%;
    height: 10px;
    border-radius: 5px;
    background-color: v-bind(accentColor);
    margin-top: auto;
  }
}
</style>
