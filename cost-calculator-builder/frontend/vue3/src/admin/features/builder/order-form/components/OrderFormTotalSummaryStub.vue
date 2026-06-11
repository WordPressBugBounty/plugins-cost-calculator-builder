<template>
  <div class="ccb-order-form-summary-stub">
    <div
      class="ccb-summary-header"
      :class="{ 'ccb-summary-header--open': isOpen }"
    >
      <div class="ccb-summary-header__title">{{ summaryTitle }}</div>
      <div class="ccb-summary-header__action" @click="toggle">
        <i class="ccb-icon-Path-3485"></i>
      </div>
    </div>

    <div
      class="ccb-summary-details"
      :class="{ 'ccb-summary-details--open': isOpen }"
    >
      <div class="ccb-summary-details__header">
        <div class="ccb-summary-details__header__label">
          {{ translations.name }}
        </div>
        <div class="ccb-summary-details__header__value">
          {{ translations.total }}
        </div>
      </div>

      <div
        v-for="row in stubRows"
        :key="row.label"
        class="ccb-summary-details__row"
      >
        <span class="ccb-summary-details__label">{{ row.label }}</span>
        <span class="ccb-summary-details__value">{{ row.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
import { useAppearanceTypography } from "@/admin/shared/utils/useAppearanceTypography";

const translationsStore = useBuilderTranslationsStore();

const {
  textColor,
  containerDarkColor,
  borderColor,
  descriptionColor,
  buttonBorderRadius,
} = useAppearanceColors();

const {
  headerFontSize,
  headerFontWeight,
  summaryHeaderFontSize,
  summaryHeaderFontWeight,
  summaryFieldFontSize,
  summaryFieldFontWeight,
} = useAppearanceTypography();

const summaryTitle = "Total Summary";
const isOpen = ref(true);

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const translations = computed(() => translationsStore.getTranslations);

const stubRows = [
  { label: "Number of pages", value: "10" },
  { label: "Mobile ready", value: "Yes" },
];
</script>

<style scoped lang="scss">
.ccb-order-form-summary-stub {
  padding: 15px 24px 8px;
  opacity: 0.45;
  pointer-events: none;
  user-select: none;
  color: v-bind(textColor);
}

.ccb-summary-header {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  gap: 10px;
  color: v-bind(textColor);
  transition: 200ms ease;
  padding: 10px 0;
  transform: rotate(0deg);

  &--open {
    color: v-bind(textColor);
    .ccb-summary-header__action {
      transform: rotate(180deg);
    }
  }

  &__title {
    font-size: v-bind(headerFontSize);
    font-weight: v-bind(headerFontWeight);
  }

  &__action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    cursor: pointer;
    background-color: v-bind(containerDarkColor);
    border-radius: 50%;

    i {
      font-size: 8px;
    }
  }
}

.ccb-summary-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  max-height: 0;
  overflow: hidden;
  transition:
    max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;

  &__label,
  &__value {
    font-weight: 700;
  }

  &__label {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 8px;
  }

  &__value {
    flex: 0 0 auto;
    max-width: 50%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &--open {
    max-height: 100%;
    overflow: visible;
    opacity: 1;
  }

  &__header {
    font-size: v-bind(summaryHeaderFontSize);
    font-weight: v-bind(summaryHeaderFontWeight);
    line-height: normal;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 4px 10px;
    background-color: v-bind(containerDarkColor);
    border-radius: v-bind(buttonBorderRadius);
    margin-bottom: 5px;
  }

  &__group {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    border-bottom: 1px dashed v-bind(borderColor);
    padding: 4px 0;
    min-width: 0;
    font-size: v-bind(summaryFieldFontSize);
    font-weight: v-bind(summaryFieldFontWeight);
    line-height: normal;

    &--child {
      padding-left: 12px;
      border-bottom: none;
      color: v-bind(descriptionColor);
    }
  }
}

.ccb-details {
  &__label,
  &__value {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__label {
    padding-right: 8px;
  }

  &__value {
    flex: 0 0 auto;
    max-width: 50%;
    text-align: right;
  }
}
</style>
