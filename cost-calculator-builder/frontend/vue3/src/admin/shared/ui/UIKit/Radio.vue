<template>
  <div
    class="ccb-radio"
    :class="{
      'ccb-radio--row': layout === 'row',
      'ccb-radio--column': layout === 'column',
    }"
  >
    <Text class="ccb-radio__header" :text="label" size="s" weight="medium" />
    <div class="ccb-radio__options">
      <label
        class="ccb-radio__label"
        v-for="option in options"
        :key="option.value"
        :class="{
          'is-checked': modelValue === option.value,
          'is-disabled': option.disable,
        }"
      >
        <input
          class="ccb-radio__input"
          type="radio"
          :value="option.value"
          :checked="modelValue === option.value"
          @change="onChange"
        />
        <Text
          class="ccb-radio__title"
          :text="option.label"
          size="s"
          weight="medium"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import Text from "./Text.vue";
import { IRadio } from "@/admin/shared/types/uikit.type";

const props = defineProps<IRadio>();
const modelValue = defineModel<string>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", name: string, value: string): void;
}>();

const onChange = (e: Event) => {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
  emit("change", props.name || "", (e.target as HTMLInputElement).value);
};
</script>

<style scoped lang="scss">
.ccb-radio {
  display: flex;
  flex-direction: column;
  gap: 18px;

  &__options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &--row {
    .ccb-radio__options {
      flex-direction: row;
      gap: 10px;
    }
  }

  &--column {
    .ccb-radio__options {
      flex-direction: column;
      gap: 10px;
    }
  }

  &__header {
    color: var(--ccb-font-comment);
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 8px;

    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  &__input {
    background: var(--ccb-input-normal);
    border: 1px solid var(--ccb-border-normal);
    width: 20px;
    height: 20px;
    transition: var(--ccb-transition-normal);
    padding: 0;
    margin: 0;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active,
    &:focus {
      outline: none;
      box-shadow: none;
      background: var(--ccb-input-normal);
      border: 1px solid var(--ccb-border-normal);
    }

    &::before {
      background-color: var(--ccb-font-labels) !important;
    }
  }

  &__title {
    transition: var(--ccb-transition-normal);
    cursor: pointer;
    color: var(--ccb-font-labels);
  }
}
</style>
