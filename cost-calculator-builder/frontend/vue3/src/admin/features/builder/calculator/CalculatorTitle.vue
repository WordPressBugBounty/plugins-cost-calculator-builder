<template>
  <div class="ccb-calculator-title">
    <div v-if="isEditing" class="ccb-calculator-title__editor">
      <Input
        ref="titleInputRef"
        v-model="draftTitle"
        name="calculator_title"
        placeholder="Enter calculator title"
        border
        @keydown.enter="saveTitle"
        @keydown.esc="cancelEditing"
      />
      <Button label="Done" size="s" type="green" @click="saveTitle" />
    </div>
    <button
      v-else
      type="button"
      class="ccb-calculator-title__trigger"
      :class="{ 'ccb-calculator-title__trigger--hidden': isTitleHidden }"
      @click="startEditing"
    >
      <span class="ccb-calculator-title__icon" v-if="isTitleHidden">
        <i class="ccb-icon-no-preview"></i>
      </span>
      <Text :text="calculatorTitle || 'empty name'" size="m" weight="bold" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { useCalculatorStore } from "../../../app/providers/stores/useCalculatorStore";
import { Text, Button, Input } from "../../../shared/ui/UIKit";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
const calculatorStore = useCalculatorStore();

const appearanceStore = useAppearanceStore();

const isEditing = ref(false);
const draftTitle = ref("");
const titleInputRef = ref<any>(null);

const calculatorTitle = computed(() => calculatorStore.getTitle);

const isTitleHidden = computed(() => {
  return (
    appearanceStore.getActivePreset?.desktop?.typography?.data?.header_hide
      ?.value || false
  );
});

const focusTitleInput = async (): Promise<void> => {
  await nextTick();
  titleInputRef.value?.$el?.querySelector("input")?.focus();
};

const startEditing = async (): Promise<void> => {
  draftTitle.value = calculatorTitle.value;
  isEditing.value = true;
  await focusTitleInput();
};

const saveTitle = (): void => {
  calculatorStore.setTitle(draftTitle.value.trim() || calculatorTitle.value);
  isEditing.value = false;
};

const cancelEditing = (): void => {
  draftTitle.value = calculatorTitle.value;
  isEditing.value = false;
};
</script>

<style scoped lang="scss">
.ccb-calculator-title {
  padding: 10px 0;
  color: var(--ccb-font-labels);
  position: relative;

  &__trigger {
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    color: var(--ccb-font-labels);
    display: flex;
    align-items: center;
    gap: 10px;

    &--hidden {
      opacity: 0.5;
    }
  }

  &__icon {
    width: 20px;
    height: 20px;
    font-size: 12px;
    color: var(--ccb-bw-normal);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__editor {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 40px;

    input {
      height: 100%;
    }
  }

  :deep(.ccb-input) {
    min-width: 280px;
  }
}
</style>
