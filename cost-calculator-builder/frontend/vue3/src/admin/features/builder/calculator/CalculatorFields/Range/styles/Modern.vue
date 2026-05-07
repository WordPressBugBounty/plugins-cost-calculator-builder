<template>
  <div
    class="slider-wrapper ccb-modern-range-field"
    :class="{ jump: field.jump }"
  >
    <div class="slider-min-max">
      <div class="slider-min-max-item first">
        <span class="label">{{ min }}</span>
      </div>
      <div class="slider-min-max-item" :class="{ done: value >= max }">
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
        <div class="label" v-if="point !== min && point !== max">
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
const { borderColor, textColor, accentColor, containerColor } =
  useAppearanceColors();

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
.ccb-modern-range-field {
  padding: 10px 3px 40px 3px;
  position: relative;
  pointer-events: none;

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
    top: 33px;

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

  .slider-handle {
    z-index: 1;

    &.slider-active {
      border: 1px solid v-bind(borderColor);
    }
  }

  .slider-base {
    height: 20px;
    width: 100%;
  }

  .slider-tooltip {
    margin-bottom: 16px !important;
  }

  .slider-handle {
    background-color: #fff !important;
    height: 31px !important;
    width: 28px !important;
    border-radius: 4px;
    box-shadow: 0px 5px 30px 0px rgba(0, 0, 0, 0.1);
    transform: translateX(7px);
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
    right: 8px;
    top: 30px;
    width: 96%;
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
    top: 10px;
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
