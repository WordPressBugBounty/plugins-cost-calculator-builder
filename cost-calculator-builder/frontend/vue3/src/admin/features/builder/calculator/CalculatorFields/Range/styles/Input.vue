<template>
  <div class="slider-wrapper ccb-input-range-field">
    <div class="slider-input">
      <input
        type="number"
        :value="max"
        :min="min"
        :max="max"
        :disabled="true"
        readonly
      />
    </div>
    <Slider
      :model-value="max"
      :min="min"
      :max="max"
      :step="step"
      :disabled="true"
      show-tooltip="focus"
      class="custom-slider"
      :format="getFormatValue"
    />
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from "vue";
import Slider from "@vueform/slider";
import { IRangeField } from "@/widget/shared/types/fields";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
const { borderColor, textColor } = useAppearanceColors();

type Props = {
  field: IRangeField;
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

const getFormatValue = (num: number): string => {
  const rounded = num.toFixed(2);
  return parseFloat(rounded).toString();
};
</script>

<style lang="scss">
.ccb-input-range-field {
  position: relative;
  padding: 6px 8px 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;

  .slider-base {
    height: 8px;
  }

  .slider-tooltip {
    margin-bottom: 16px !important;
  }

  .slider-handle {
    width: 32px !important;
    height: 32px !important;
    top: calc(
      (var(--slider-handle-height, 16px) - var(--slider-height, 6px)) / 2 * -1 +
        -8px
    ) !important;
    background-color: #fff;
    box-shadow: 0px 5px 30px 0px rgba(0, 0, 0, 0.1);
  }

  .slider-handle {
    z-index: 1;

    &.slider-active {
      border: 1px solid v-bind(borderColor);
    }
  }

  .custom-slider {
    flex: 1;
    min-width: 0;
    padding-left: 26px;
  }

  .slider-input {
    width: 55px !important;
    flex-shrink: 0;
    input {
      box-sizing: border-box;
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
