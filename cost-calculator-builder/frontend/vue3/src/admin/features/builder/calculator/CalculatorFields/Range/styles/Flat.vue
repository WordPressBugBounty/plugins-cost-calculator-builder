<template>
  <div
    class="slider-wrapper ccb-flat-range-field"
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
    <div class="custom-marks" v-if="field.scalePoints">
      <div
        v-for="point in scalePoints"
        :key="point"
        class="mark"
        :style="getMarkStyle(point)"
      >
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
.ccb-flat-range-field {
  padding: 10px 3px 38px 3px;
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
          background: var(--ccb-accent-color);
        }
      }

      &.done {
        .tick {
          background-color: var(--ccb-accent-color);
        }
      }
    }

    .tick {
      height: 8px;
      width: 8px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--ccb-container-color), black 10%);
      margin: 0 auto 4px;
    }

    .label {
      color: var(--ccb-fields-description-color);
      font-size: 12px;
      font-weight: 500;
      line-height: 100%;
      padding-top: 8px;
      pointer-events: none;
    }
  }

  .slider-connect {
    border-radius: 10px;
  }

  .slider-handle {
    z-index: 1;

    &.slider-active {
      border: 1px solid var(--ccb-fields-border-color);
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

  .slider-base {
    height: 20px;
    width: 100%;
  }

  .slider-handle {
    background-color: #fff !important;
    height: 20px !important;
    width: 20px !important;
    margin-top: 6px;
  }

  .custom-marks {
    position: absolute;
    right: 11px;
    top: 30px;
    width: 96%;
  }

  .mark {
    position: absolute;
    transform: translateX(-50%);
    text-align: center;

    .label {
      color: var(--ccb-fields-description-color);
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
    background: var(--ccb-fields-bg-color);
    margin: 0 auto 4px;

    &.tick-passed {
      background: var(--ccb-accent-color) !important;
    }
  }
}
</style>
