<template>
  <div
    class="slider-wrapper ccb-modern-multi-range-field"
    :class="{ jump: field.jump }"
  >
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
      :format="getFormatValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="true"
      :model-value="values"
      show-tooltip="focus"
    ></Slider>
    <div class="custom-ticks">
      <div v-for="tick in 25" :key="tick" class="tick" />
    </div>
    <div class="custom-marks" v-if="field.scalePoints">
      <div class="stick-line">
        <div class="stick-line-item"></div>
      </div>
      <div
        v-for="point in scalePoints"
        :key="point"
        class="mark"
        :style="getMarkStyle(point)"
      >
        <div
          class="label"
          :class="{ 'label-passed': point <= values[0] }"
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
import { IMultiRangeField } from "@/widget/shared/types/fields";
import Slider from "@vueform/slider";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
const { borderColor, textColor, accentColor, containerColor } =
  useAppearanceColors();
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
</script>

<style lang="scss">
.ccb-modern-multi-range-field {
  position: relative;
  padding: 10px 3px 40px 3px;

  .slider-origin {
    width: 96%;
    right: 8px;
  }

  .slider-min-max {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    top: 47px;

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
      padding-top: 8px;
      pointer-events: none;
    }
  }

  &.jump {
    .slider-min-max-item {
      .label {
        cursor: pointer;
        pointer-events: auto;
      }
    }

    .slider-handle {
      pointer-events: none;
    }

    .custom-marks {
      .label {
        cursor: pointer;
        pointer-events: auto;
      }
    }
  }

  .slider-tooltip {
    bottom: 40px;
  }

  .slider-base {
    height: 20px;
    width: 100%;
  }

  .slider-handle {
    background-color: #fff !important;
    height: 31px !important;
    width: 28px !important;
    border-radius: 4px;
    box-shadow: 0px 5px 30px 0px rgba(0, 0, 0, 0.1);
    transform: translateX(7px);

    &.slider-active {
      border: 1px solid v-bind(borderColor);
    }
  }

  .slider-connect {
    background: linear-gradient(
      90deg,
      rgba(238, 241, 247, 0) 0%,
      v-bind(accentColor) 100%
    ) !important;
  }

  .custom-marks {
    position: absolute;
    left: 0;
    top: 45px;
    width: 100%;
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
      pointer-events: none;
    }
  }

  .custom-ticks {
    width: 98%;
    height: 0;
    pointer-events: none;
    display: flex;
    justify-content: space-between;
    top: 20px;
    position: absolute;
    padding: 0 10px;
    box-sizing: border-box;
  }

  .tick {
    width: 1px;
    height: 20px;
    background: rgba(0, 0, 0, 0.04);
    transform: translateX(-50%);
  }
}
</style>
