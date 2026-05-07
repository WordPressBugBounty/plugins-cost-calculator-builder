<template>
  <div class="slider-wrapper ccb-default-range-field">
    <div class="slider-min-max">
      <div class="slider-min-max-item first">
        <span class="label">{{ min }}</span>
      </div>
      <div class="slider-min-max-item">
        <span class="label">{{ max }}</span>
      </div>
    </div>
    <Slider
      style="margin: 10px 0"
      :model-value="max"
      :format="getFormatValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="true"
      show-tooltip="focus"
    ></Slider>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from "vue";
import Slider from "@vueform/slider";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const { textColor, accentColor, containerColor } = useAppearanceColors();

type Props = {
  field: any;
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
.ccb-default-range-field {
  position: relative;
  pointer-events: none;
  .slider-min-max {
    display: flex;
    width: 102%;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    top: -3px;
    left: -3px;

    &-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      &.first {
        .tick {
          background: v-bind(accentColor);
        }
      }

      &.done {
        .tick {
          background-color: v-bind(accentColor);
        }
      }
    }

    .tick {
      height: 8px;
      width: 8px;
      border-radius: 50%;
      background: color-mix(in srgb, v-bind(containerColor), black 10%);
      margin: 0 auto 4px;
    }

    .label {
      color: v-bind(textColor);
      font-size: 12px;
      font-weight: 500;
      line-height: 100%;
      padding-top: 22px;
      pointer-events: none;
    }
  }
}
</style>
