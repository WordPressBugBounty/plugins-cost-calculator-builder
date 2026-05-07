<template>
  <div class="ccb-summary-pdf">
    <div class="ccb-summary-pdf__button">{{ translations.sharePdf }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";

const appearanceStore = useAppearanceStore();
const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);
const textColor = computed(
  () =>
    appearanceStore.getActivePreset?.desktop?.colors?.data?.primary_color
      ?.value || {},
);
const bgrColor = computed(
  () =>
    appearanceStore.getActivePreset?.desktop?.colors?.data?.secondary_color
      ?.value || {},
);

const borderColor = computed(
  () =>
    `${appearanceStore.getActivePreset?.desktop?.colors?.data?.primary_color?.value || "#000000"}1A`,
);

const borderRadius = computed(() => {
  const buttonBorderData = (appearanceStore.getActivePreset?.desktop as any)
    ?.borders?.data?.button_border?.data;
  return `${buttonBorderData?.border_radius?.value || 12}px`;
});
</script>

<style scoped lang="scss">
.ccb-summary-pdf {
  display: flex;

  &__button {
    width: 100%;
    padding: 12px;
    border-radius: v-bind(borderRadius);
    color: v-bind(textColor);
    border: 1px solid v-bind(borderColor);
    background-color: v-bind(bgrColor);
    font-size: 14px;
    font-weight: 700;
    text-align: center;
    cursor: pointer;
    transition: 200ms ease;
  }
}
</style>
