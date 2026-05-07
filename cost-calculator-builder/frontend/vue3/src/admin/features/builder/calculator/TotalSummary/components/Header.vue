<template>
  <div
    class="ccb-summary-header"
    :class="{ 'ccb-summary-header--open': isOpen }"
  >
    <div class="ccb-summary-header__title">
      {{ summary.options.title }}
    </div>
    <div class="ccb-summary-header__action" @click="toggle">
      <i class="ccb-icon-Path-3485"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
import { useAppearanceTypography } from "@/admin/shared/utils/useAppearanceTypography";

defineProps<{
  summary: any;
}>();

const emit = defineEmits<{
  (e: "hide-summary", value: boolean): void;
}>();

const appearanceStore = useAppearanceStore();
const bgrColor = computed(
  () =>
    `${appearanceStore.getActivePreset?.desktop?.colors?.data?.primary_color?.value || "#000000"}1D`,
);
const textColor = computed(
  () =>
    appearanceStore.getActivePreset?.desktop?.colors?.data?.primary_color
      ?.value || {},
);
const { headerFontSize, headerFontWeight } = useAppearanceTypography();

const isOpen = ref(false);

const toggle = () => {
  isOpen.value = !isOpen.value;
  emit("hide-summary", isOpen.value);
};
</script>

<style scoped lang="scss">
.ccb-summary-header {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  gap: 10px;
  color: v-bind(textColor);
  transition: 200ms ease;
  padding: 10px 0px;
  transform: rotate(0deg);

  &--open {
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
    background-color: v-bind(bgrColor);
    border-radius: 50%;

    i {
      font-size: 8px;
    }
  }
}
</style>
