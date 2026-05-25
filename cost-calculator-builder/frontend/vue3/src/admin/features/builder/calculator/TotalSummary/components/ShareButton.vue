<template>
  <div class="ccb-summary-pdf">
    <div class="ccb-summary-pdf__button">{{ translations.sharePdf }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";

const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);

const { buttonBorderRadius, buttonBorder, textColor, formFieldsColor } =
  useAppearanceColors();
</script>

<style scoped lang="scss">
.ccb-summary-pdf {
  display: flex;

  &__button {
    width: 100%;
    padding: 12px;
    border-radius: v-bind(buttonBorderRadius);
    color: v-bind(textColor);
    border: v-bind(buttonBorder);
    background-color: v-bind(formFieldsColor);
    font-size: 14px;
    font-weight: 700;
    text-align: center;
    cursor: pointer;
    transition: 200ms ease;
  }
}
</style>
