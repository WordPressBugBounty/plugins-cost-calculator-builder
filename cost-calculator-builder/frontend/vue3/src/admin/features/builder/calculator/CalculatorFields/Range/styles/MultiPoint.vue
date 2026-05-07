<template>
  <div
    class="slider-wrapper ccb-multi-point-range-field"
    :class="{ jump: field.jump }"
  >
    <div class="slider-min-max">
      <div class="slider-min-max-item first">
        <span class="tick"></span>
        <span class="label">{{ min }}</span>
      </div>
      <div class="slider-min-max-item" :class="{ done: value >= max }">
        <span class="tick"></span>
        <span class="label">{{ max }}</span>
      </div>
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
    <div class="custom-marks" v-if="field.scalePoints">
      <div
        v-for="point in scalePoints"
        :key="point"
        class="mark"
        :style="getMarkStyle(point)"
      >
        <div
          class="tick"
          v-if="point !== min && point !== max"
          :class="{ 'tick-passed': point <= value }"
        />
        <div
          class="label"
          :class="{ 'label-passed': point <= value }"
          v-if="point !== min && point !== max"
        >
          {{ point }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from "vue";
import Slider from "@vueform/slider";
import { IRangeField } from "@/widget/shared/types/fields";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
const { textColor, accentColor, containerColor } = useAppearanceColors();

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
const value = computed(() => {
  const parsed = toNumber(
    field.value.defaultValue ?? field.value.default ?? field.value.value,
    min.value,
  );
  return Math.min(max.value, Math.max(min.value, parsed));
});
const step = computed(() => {
  if (field.value.jump) return 1;
  const parsed = toNumber(field.value.step, 1);
  return parsed > 0 ? parsed : 1;
});

const scalePoints = computed(() => {
  const raw = field.value.scalePoints?.trim() || "";
  return raw
    .split(",")
    .map((p) => Number(p.trim()))
    .filter((p) => !isNaN(p) && p >= min.value && p <= max.value);
});

const getMarkStyle = (point: number) => {
  const range = Math.max(1, max.value - min.value);
  const percentage = ((point - min.value) / range) * 100;
  return {
    left: `${percentage}%`,
  };
};

const getFormatValue = (num: number): string => {
  const rounded = num.toFixed(2);
  return parseFloat(rounded).toString();
};
</script>

<style lang="scss">
.ccb-multi-point-range-field {
  position: relative;
  padding: 15px 0px 35px 0px;
  pointer-events: none;

  &.jump {
    .custom-marks {
      z-index: 2;
    }

    .slider-handle {
      pointer-events: none;
    }

    .slider-min-max-item {
      .label {
        cursor: pointer;
        pointer-events: auto;
      }
    }

    .custom-marks {
      .label {
        cursor: pointer;
        pointer-events: auto;
      }
    }
  }

  .slider-min-max {
    display: flex;
    width: 102%;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    top: 13px;
    left: 0;

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
      padding-top: 10px;
      pointer-events: none;
    }
  }

  .custom-marks {
    position: absolute;
    right: -13px;
    top: 13px;
    width: 105%;
    transform: scaleX(0.94);
  }

  .mark {
    position: absolute;
    transform: translateX(-50%);
    text-align: center;

    .label {
      color: v-bind(textColor);
      font-size: 12px;
      font-weight: 500;
      line-height: 100%;
      padding-top: 10px;
    }
  }

  .tick {
    height: 8px;
    width: 8px;
    border-radius: 50%;
    background: color-mix(in srgb, v-bind(containerColor), black 10%);
    margin: 0 auto 4px;

    &.tick-passed {
      background: v-bind(accentColor) !important;
    }
  }

  .slider-origin {
    width: 105%;
    right: -13px;
  }

  .slider-base {
    transform: scale(0.94);
    background-color: color-mix(
      in srgb,
      v-bind(containerColor),
      black 10%
    ) !important;
  }
  .slider-horizontal {
    height: 4px !important;
    border-radius: 10px;
  }

  .slider-tooltip {
    border-radius: 15px;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 10px;
    line-height: 100%;

    &::after,
    &::before {
      display: none;
    }
  }
}
</style>
