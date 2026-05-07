<template>
  <div class="slider-wrapper ccb-input-multi-range-field">
    <div class="slider-input">
      <input
        type="number"
        :value="values[0]"
        :min="min"
        :max="max"
        :disabled="true"
        readonly
      />
    </div>
    <Slider
      style="margin: 10px 0"
      :format="getFormatValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="true"
      :model-value="values"
      show-tooltip="focus"
    ></Slider>
    <div class="slider-input">
      <input
        type="number"
        :value="values[1]"
        :min="min"
        :max="max"
        :disabled="true"
        readonly
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from "vue";
import Slider from "@vueform/slider";
import { IMultiRangeField } from "@/widget/shared/types/fields";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
const { borderColor, textColor } = useAppearanceColors();
type Props = {
  field: IMultiRangeField;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const toNumber = (input: unknown, fallback: number): number => {
  const value = Number(input);
  return Number.isFinite(value) ? value : fallback;
};
const min = computed(() =>
  toNumber(field.value.min ?? field.value.minValue, 0),
);
const max = computed(() => {
  const parsed = toNumber(
    field.value.max ?? field.value.maxValue,
    min.value + 100,
  );
  return parsed > min.value ? parsed : min.value + 1;
});
const step = computed(() => {
  if (field.value.jump) return 1;
  const parsed = toNumber(field.value.step, 1);
  return parsed > 0 ? parsed : 1;
});
const values = computed<number[]>(() => {
  const source = Array.isArray(field.value.values) ? field.value.values : [];
  const leftRaw =
    source[0] ?? field.value.default ?? field.value.defaultValue ?? min.value;
  const rightRaw = source[1] ?? max.value;
  const left = Math.min(
    max.value,
    Math.max(min.value, toNumber(leftRaw, min.value)),
  );
  const right = Math.min(
    max.value,
    Math.max(left, toNumber(rightRaw, max.value)),
  );
  return [left, right];
});

const getFormatValue = (num: number): string => {
  const rounded = num.toFixed(2);
  return parseFloat(rounded).toString();
};
</script>

<style lang="scss">
.ccb-input-multi-range-field {
  position: relative;
  padding: 6px 0 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .slider-origin {
    width: 95%;
  }

  .slider-base {
    height: 8px;
  }

  .slider-handle {
    width: 32px !important;
    height: 32px !important;
    top: calc(
      (var(--slider-handle-height, 16px) - var(--slider-height, 6px)) / 2 * -1 +
        -8px
    ) !important;
    background-color: #fff !important;
    box-shadow: 0px 5px 30px 0px rgba(0, 0, 0, 0.1);

    &.slider-active {
      border: 1px solid v-bind(borderColor);
    }
  }

  .slider-target {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 1;
    padding: 0 20px;
    width: 100%;
  }

  .slider-tooltip {
    bottom: 40px;
  }

  .slider-input {
    width: 55px !important;
    input {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      border: none;
      outline: none;
      background: none;
      padding: 0;
      margin: 0;
      color: v-bind(textColor);

      border-radius: 4px;
      border: 1px solid v-bind(borderColor);
      width: 55px !important;
      padding: 10px;
      box-sizing: border-box;

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &[type="number"] {
        -moz-appearance: textfield;
      }
    }
  }
}
</style>
