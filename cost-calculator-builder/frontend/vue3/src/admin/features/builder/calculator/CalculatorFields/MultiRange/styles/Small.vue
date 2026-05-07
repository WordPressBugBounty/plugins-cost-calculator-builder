<template>
  <div
    class="slider-wrapper ccb-small-multi-range-field"
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
    <div class="custom-marks" v-if="field.scalePoints">
      <div
        v-for="point in scalePoints"
        :key="point"
        class="mark"
        :style="getMarkStyle(point)"
      >
        <div
          class="tick"
          :class="{
            'tick-passed': point >= values[0] && point <= values[1],
          }"
        />
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
const { formFieldsColor, textColor, accentColor, containerColor } =
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
.ccb-small-multi-range-field {
  padding: 15px 0 20px 0;
  position: relative;

  .slider-min-max {
    display: flex;
    width: 102%;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    top: 22px;
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

  .slider-wrapper {
    position: relative;
    padding: 20px 0px 35px;
  }
  .slider-horizontal {
    height: 2px !important;
  }

  .custom-marks {
    position: absolute;
    left: 0;
    top: 22px;
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

  .tick {
    width: 1px;
    height: 8px;
    background: v-bind(formFieldsColor);
    margin: 0 auto 4px;

    &.tick-passed {
      background: v-bind(accentColor) !important;
    }
  }

  .slider-tooltip {
    border-radius: 15px;
    margin-bottom: -10px;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 10px;
    line-height: 100%;

    &::after,
    &::before {
      display: none;
    }
  }

  .slider-handle {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    height: 12px;

    &::after {
      display: block;
      content: "";
      width: 0 !important;
      height: 0 !important;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 6px solid v-bind(accentColor) !important;
      background: transparent !important;
      border-radius: 0 !important;
      top: 4px;
      cursor: pointer;
      box-shadow: none !important;
      margin-left: 3px;

      &:focus {
        outline: none;
        box-shadow: none;
      }
    }
  }
}
</style>
