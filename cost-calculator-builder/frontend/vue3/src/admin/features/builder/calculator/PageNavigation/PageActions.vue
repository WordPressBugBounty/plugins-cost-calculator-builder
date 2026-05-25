<template>
  <div
    class="ccb-page-actions"
    v-if="showActions"
    :class="[
      `ccb-page-actions--${actionsPosition}`,
      { 'ccb-page-actions--summary-last-page': summaryLastPage },
    ]"
  >
    <div class="ccb-page-actions__totals" v-if="summaryLastPage">
      <div
        class="ccb-page-actions__totals-item"
        v-for="total in summaryTotals"
        :key="total.idx"
      >
        <span class="ccb-page-actions__totals-item-label">{{
          total.title
        }}</span>
        <span class="ccb-page-actions__totals-item-value">
          $ {{ formatValue(getRandomValueByAlias(total.alias)) }}
        </span>
      </div>
      <div class="ccb-page-actions__summary">Show summary</div>
    </div>
    <div class="ccb-page-actions__buttons">
      <button
        class="ccb-page-actions__btn ccb-page-actions__btn--back"
        :class="{ 'ccb-page-actions__btn--hidden': isFirstPage }"
        :disabled="isFirstPage"
        @click="goBack"
      >
        {{ previousButtonLabel }}
        <i class="ccb-icon-Arrow-Previous"></i>
      </button>
      <button
        class="ccb-page-actions__btn ccb-page-actions__btn--next"
        @click="goNext"
        :disabled="isLastPage"
        :class="{ 'ccb-page-actions__btn--hidden': isLastPage }"
        v-if="!isLastPage"
      >
        {{ nextButtonLabel }}
        <i class="ccb-icon-Arrow-Previous"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { ILayout } from "@/admin/shared/types/settings.type";
import { useAppearanceTypography } from "@/admin/shared/utils/useAppearanceTypography";

const settingsStore = useSettingsStore();

const builderStore = useBuilderStore();

const summaryLastPage = computed(() => {
  return (
    settingsStore.getSettings?.page_break?.summary_after_last_page ?? false
  );
});

const pages = computed(() => {
  if (!summaryLastPage.value) {
    return builderStore.getPages;
  }

  const lastPage = builderStore.getPages[builderStore.getPages.length - 1] || 0;
  return [...builderStore.getPages, lastPage + 1];
});

function getRandomValueByAlias(alias: string): number {
  let hash = 0;
  for (let i = 0; i < alias.length; i += 1) {
    hash = (hash << 5) - hash + alias.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash % 1001);
}

function formatValue(value: number): string {
  return value.toFixed(2);
}

const summaryTotals = computed(() => {
  return settingsStore.getSettings?.page_break?.formulas || [];
});

const activePage = computed(() => builderStore.getActivePage);
const activePageData = computed(() => builderStore.getActivePageData);

const previousButtonLabel = computed(
  () => activePageData.value?.previousBtnLabel || "Back",
);

const nextButtonLabel = computed(
  () => activePageData.value?.nextBtnLabel || "Next",
);

const showActions = computed(() => pages.value.length > 1);
const isFirstPage = computed(() => activePage.value === 0);
const isLastPage = computed(() => activePage.value === pages.value.length - 1);

function goBack() {
  if (!isFirstPage.value) {
    builderStore.setActivePage(activePage.value - 1);
  }
}

function goNext() {
  if (!isLastPage.value) {
    builderStore.setActivePage(activePage.value + 1);
  }
}

const layoutSettings = computed<ILayout>(() => {
  return settingsStore.getSettings?.layout as unknown as ILayout;
});

const actionsPosition = computed(() => {
  return layoutSettings.value?.navigation_position;
});

const {
  containerColor: bgrColor,
  accentColor,
  containerShadow,
  containerBorder,
  containerBorderRadius,
  buttonBorderRadius,
  buttonBorderWidth,
  buttonBorderStyle,
} = useAppearanceColors();

import { useAppearanceSpacing } from "@/admin/shared/utils/useAppearanceSpacing";
const {
  containerMarginTop,
  containerMarginRight,
  containerMarginBottom,
  containerMarginLeft,
} = useAppearanceSpacing();

const { fieldsBtnFontSize, fieldsBtnFontWeight } = useAppearanceTypography();
</script>

<style scoped lang="scss">
.ccb-page-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  background: v-bind(bgrColor);
  border: v-bind(containerBorder);
  border-radius: v-bind(containerBorderRadius);
  box-shadow: v-bind(containerShadow);
  margin: v-bind(containerMarginTop) v-bind(containerMarginRight)
    v-bind(containerMarginBottom) v-bind(containerMarginLeft);
  width: 100%;

  &.ccb-page-actions--summary-last-page {
    justify-content: space-between;

    .ccb-page-actions__buttons {
      width: 40%;
      justify-content: flex-end;
      gap: 10px;
    }
  }

  &__totals {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    font-size: 12px;
    font-weight: 800;
  }

  &__totals-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    gap: 10px;
  }

  &__summary {
    color: v-bind(accentColor);
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      text-decoration: underline;
    }
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  &--top {
    order: -1;
  }

  &--bottom {
    order: 2;
  }

  &--hidden {
    display: none;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    font-size: v-bind(fieldsBtnFontSize) !important;
    font-weight: v-bind(fieldsBtnFontWeight);

    line-height: normal;
    padding: 11px 20px;
    border-radius: v-bind(buttonBorderRadius);
    transition: all 0.2s ease;

    &--back {
      background: transparent;
      border: v-bind(buttonBorderWidth) v-bind(buttonBorderStyle)
        v-bind(accentColor);
      color: v-bind(accentColor);
      padding: 11px 20px;

      i {
        margin-left: 10px;
      }

      &:hover:not(:disabled) {
        background: v-bind(accentColor);
        color: #fff;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.4;
      }
    }

    &--hidden {
      visibility: hidden;
      pointer-events: none;
    }

    &--next {
      background: v-bind(accentColor);
      color: v-bind(bgrColor);
      font-weight: 600;

      i {
        transform: rotate(180deg);
        margin-left: 10px;
      }

      &:hover {
        background: var(--ccb-green-bg-hover, #009a55);
      }
    }
  }
}
</style>
