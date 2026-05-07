<template>
  <div class="ccb-toggle">
    <label class="ccb-toggle__item__label ccb-text-m">
      <Text
        :text="label || ''"
        :size="size || 'l'"
        :weight="weight || 'bold'"
      />
      <input
        type="checkbox"
        class="ccb-toggle__item__input"
        :checked="modelValue"
        :disabled="disabled"
        @change="onChange"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { IToggle } from "@/admin/shared/types/uikit.type";
import Text from "./Text.vue";

const props = defineProps<IToggle>();
const { label, modelValue, disabled, name, size, weight } = toRefs(props);

const emit = defineEmits<{
  (e: "change", name: string, value: any): void;
  (e: "update:modelValue", value: any): void;
}>();

function onChange(e: Event) {
  if (disabled.value) return;
  const target = e.target as HTMLInputElement;
  emit("update:modelValue", target.checked);
  emit("change", name.value || "", target.checked);
}
</script>

<style scoped lang="scss">
.ccb-toggle {
  .ccb-toggle__item {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    position: relative;
  }

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    border: 0;
  }

  .ccb-toggle__item__label {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
    position: relative;

    &-text {
      color: var(--ccb-text-color);
    }

    &::before {
      content: "";
      min-width: 40px;
      min-height: 24px;
      background-color: var(--ccb-input-normal);
      border-radius: 999px;
      transition: background-color 0.2s ease-in-out;
      display: inline-block;
      border: 1px solid var(--ccb-border-normal);
    }

    &::after {
      content: "";
      position: absolute;
      left: 3px;
      width: 18px;
      height: 18px;
      background-color: var(--ccb-bw-normal);
      border-radius: 50%;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease-in-out;
    }
  }

  .ccb-toggle__item__label:has(> input[type="checkbox"]:checked)::before {
    background-color: var(--ccb-input-normal);
  }

  .ccb-toggle__item__label:has(> input[type="checkbox"]:checked)::after {
    transform: translateX(18px);
  }

  .ccb-toggle__item__label:has(> input[type="checkbox"]:not(:checked)) {
    opacity: 0.6;
  }

  .ccb-toggle__item__label:has(> input[type="checkbox"]:checked) {
    opacity: 1;
  }

  .ccb-toggle__item__label:has(> input[type="checkbox"]:focus-visible)::before {
    outline: 2px solid #93c5fd;
    outline-offset: 2px;
  }

  .ccb-toggle__item__label:has(> input[type="checkbox"]:disabled) {
    cursor: not-allowed;
    opacity: 0.6;
  }
}
</style>
