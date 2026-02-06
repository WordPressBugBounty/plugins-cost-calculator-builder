<template>
  <div class="slider-wrapper ccb-default-range-field">
    <div class="slider-min-max">
      <div class="slider-min-max-item first">
        <span class="label">{{ field.min }}</span>
      </div>
      <div class="slider-min-max-item">
        <span class="label">{{ field.max }}</span>
      </div>
    </div>
    <Slider
      style="margin: 10px 0"
      v-model="model"
      :format="getFormatValue"
      :min="field.min"
      :max="field.max"
      :step="field.step"
      :disabled="field.disabled"
      @change="onChange"
      show-tooltip="focus"
    ></Slider>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from "vue";
import { IRangeField } from "@/widget/shared/types/fields";
import Slider from "@vueform/slider";

type Props = {
  field: IRangeField;
  modelValue: number;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const emit = defineEmits<{
  (event: "update:modelValue", value: number): void;
}>();

const model = computed<number>({
  get: () =>
    typeof props.modelValue === "number" ? props.modelValue : field.value.value,
  set: (val: number) => emit("update:modelValue", val),
});

const onChange = (value: number) => {
  emit("update:modelValue", value);
};

const getFormatValue = (num: number): string => {
  const rounded = num.toFixed(2);
  return parseFloat(rounded).toString();
};
</script>

<style lang="scss">
.ccb-default-range-field {
  position: relative;
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
      padding-top: 22px;
      pointer-events: none;
    }
  }
}
</style>
