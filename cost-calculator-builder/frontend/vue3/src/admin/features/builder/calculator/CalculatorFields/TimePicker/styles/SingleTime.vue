<template>
  <div class="ccb-single-timePicker">
    <div class="ccb-single-timePicker__input">
      <i class="ccb-icon-timepicker-light-clock"></i>
      <span>{{ displayValue }}</span>
      <i class="ccb-icon-Path-3485 ccb-single-timePicker__chevron"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useCallbackStore } from "@/widget/app/providers/stores/callbackStore.ts";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
import useAppearanceTypography from "@/admin/shared/utils/useAppearanceTypography";
const {
  textColor,
  borderColor,
  formFieldsColor,
  borderRadius,
  borderWidth,
  borderStyle,
} = useAppearanceColors();
const { fieldsBtnFontSize, fieldsBtnFontWeight } = useAppearanceTypography();

const callbackStore = useCallbackStore();

type TimeValue = {
  hours: number;
  minutes: number;
  seconds: number;
};

const props = defineProps<{
  format: boolean;
  modelValue: TimeValue | null;
}>();

const emit = defineEmits(["update:modelValue"]);

const time = ref<TimeValue>(props.modelValue || getCurrentTime());

const displayValue = computed(() => formatTime(time.value));

watch(time, (newTime) => {
  if (newTime) {
    emit("update:modelValue", newTime);
  }
});

callbackStore.add("updateSingleTimePicker", (val: string) => {
  if (!val) return;

  const [timePart, period] = val.toLowerCase().split(" ");
  const [hours, minutes] = timePart.split(":").map(Number);

  let convertedHours = hours;
  if (period === "pm" && hours !== 12) {
    convertedHours = hours + 12;
  } else if (period === "am" && hours === 12) {
    convertedHours = 0;
  }

  time.value = {
    hours: convertedHours,
    minutes: minutes,
    seconds: 0,
  };
});

function formatTime(value: TimeValue) {
  const minutes = value.minutes.toString().padStart(2, "0");

  if (props.format) {
    return `${value.hours.toString().padStart(2, "0")}:${minutes}`;
  }

  const period = value.hours >= 12 ? "PM" : "AM";
  const hours = value.hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

function getCurrentTime() {
  const now = new Date();

  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: 0,
  };
}
</script>

<style lang="scss">
.ccb-single-timePicker {
  pointer-events: none;
  color: v-bind(textColor);

  &__input {
    width: 100%;
    min-height: var(--ccb-field-button-height);
    padding: 0 var(--ccb-field-side-indent);
    padding-left: max(35px, var(--ccb-field-side-indent));
    border: v-bind(borderWidth) v-bind(borderStyle) v-bind(borderColor);
    border-radius: v-bind(borderRadius);
    background: v-bind(formFieldsColor);
    color: v-bind(textColor);
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: v-bind(fieldsBtnFontSize);
    font-weight: v-bind(fieldsBtnFontWeight);
    position: relative;
    box-sizing: border-box;

    .ccb-icon-timepicker-light-clock {
      position: absolute;
      left: 12px;
      font-size: 16px;
    }
  }

  &__chevron {
    margin-left: auto;
    font-size: 10px;
    opacity: 0.65;
  }
}
</style>
