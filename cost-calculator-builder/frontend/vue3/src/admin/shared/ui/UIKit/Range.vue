<template>
  <div class="ccb-range">
    <div v-if="label" class="ccb-range__header">
      <label class="ccb-range__label ccb-text-s ccb-medium">
        <span>{{ label }}</span>
        <span v-if="required" class="ccb-range__required-mark">*</span>
      </label>
      <span class="ccb-range__value ccb-text-s ccb-medium">
        {{ displayValue }}
      </span>
    </div>

    <div class="ccb-range__control" :class="{ 'is-disabled': disabled }">
      <Slider
        v-model="currentValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :format="() => ''"
        :tooltips="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import Slider from "@vueform/slider";
import "@vueform/slider/themes/default.css";
import type { IRange } from "../../types/uikit.type";

const props = withDefaults(defineProps<IRange>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  required: false,
  disabled: false,
});

const { min, max, name, disabled, step, label, required, suffix } =
  toRefs(props);

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void;
  (e: "change", name: string, value: number): void;
}>();

const currentValue = computed<number>({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
    emit("change", name.value || "", value);
  },
});

const formatValue = (value: number): string => {
  const precision = Number.isInteger(step.value) ? 0 : 2;
  const formatted = Number(value).toFixed(precision);

  if (!formatted.includes(".")) {
    return formatted;
  }

  return formatted.replace(/\.?0+$/, "");
};

const displayValue = computed(() => {
  return `${formatValue(props.modelValue)}${suffix.value || ""}`;
});
</script>

<style scoped lang="scss">
.ccb-range {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__label {
    color: var(--ccb-font-comment);
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding-left: 16px;
  }

  &__value {
    color: var(--ccb-font-labels);
  }

  &__required-mark {
    color: var(--ccb-red-bg-normal);
  }

  &__control {
    height: 24px;
    padding: 0 12px;
    border-radius: 999px;
    background-color: var(--ccb-input-normal);
    display: flex;
    align-items: center;

    &:deep(.slider-target) {
      width: 100%;
    }

    &:deep(.slider-base) {
      background-color: transparent;
      border-radius: 999px;
      height: 0;
    }

    &:deep(.slider-connect) {
      background-color: transparent;
    }

    &:deep(.slider-handle) {
      width: 16px;
      height: 16px;
      background-color: var(--ccb-bw-normal);
      border: none;
      border-radius: 50%;
      box-shadow: none;
      top: calc((16px - var(--slider-height, 6px)) / 2 * -1);
    }

    &:deep(.slider-handle:focus) {
      box-shadow: none;
    }

    &.is-disabled {
      opacity: 0.7;
      pointer-events: none;
    }
  }
}
</style>
