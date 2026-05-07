<template>
  <div class="ccb-summary-pdf">
    <div class="ccb-summary-pdf__button">{{ translations.submitOrder }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";

const appearanceStore = useAppearanceStore();
const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);
const activePreset = computed(
  () => appearanceStore.getActivePreset as Record<string, any>,
);
const accentColor = computed(
  () => activePreset.value?.desktop?.colors?.data?.accent_color?.value || {},
);
const borderRadius = computed(
  () =>
    `${activePreset.value?.desktop?.borders?.data?.button_border?.data.border_radius.value || 12}px`,
);
</script>

<style scoped lang="scss">
.ccb-summary-pdf {
  display: flex;
  &__button {
    width: 100%;
    padding: 12px;
    border-radius: v-bind(borderRadius);
    color: #fff;
    background-color: v-bind(accentColor);
    font-size: 14px;
    font-weight: 700;
    text-align: center;
    cursor: pointer;
    transition: 200ms ease;
  }
}
</style>
