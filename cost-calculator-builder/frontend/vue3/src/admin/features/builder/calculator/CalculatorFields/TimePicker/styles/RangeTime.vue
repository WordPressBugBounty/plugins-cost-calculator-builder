<template>
  <div class="ccb-range-timePicker">
    <div class="ccb-range-timePicker__from">
      <div class="ccb-range-timePicker__input">
        <i class="ccb-icon-timepicker-light-clock"></i>
        <span>{{ fromDisplayValue }}</span>
      </div>
    </div>
    <div class="ccb-range-timePicker__separator">
      <span>to</span>
    </div>
    <div class="ccb-range-timePicker__to">
      <div class="ccb-range-timePicker__input">
        <i class="ccb-icon-timepicker-light-clock"></i>
        <span>{{ toDisplayValue }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useCallbackStore } from "@/widget/app/providers/stores/callbackStore.ts";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
import useAppearanceTypography from "@/admin/shared/utils/useAppearanceTypography";
const callbackStore = useCallbackStore();
const {
  textColor,
  borderColor,
  formFieldsColor,
  borderRadius,
  borderWidth,
  borderStyle,
} = useAppearanceColors();
const { fieldsBtnFontSize, fieldsBtnFontWeight } = useAppearanceTypography();

type TimeValue = {
  hours: number;
  minutes: number;
  seconds: number;
};

const props = defineProps<{
  format: boolean;
  minInterval: string;
  modelValue?: {
    from?: { hours: number; minutes: number; seconds: number };
    to?: { hours: number; minutes: number; seconds: number };
  } | null;
}>();

const emit = defineEmits(["update:modelValue"]);

const parseInterval = (interval: string): number => {
  const hoursMatch = interval.match(/(\d+)h/);
  const minutesMatch = interval.match(/(\d+)m/);

  const hours = hoursMatch ? parseInt(hoursMatch[1]) * 60 : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

  return hours + minutes;
};

const from = ref<TimeValue>(props.modelValue?.from || getCurrentTime());

const to = ref<TimeValue>(props.modelValue?.to || getCurrentTime());

const fromDisplayValue = computed(() => formatTime(from.value));
const toDisplayValue = computed(() => formatTime(to.value));

onMounted(() => {
  if (props.minInterval) {
    handleFromUpdate(from.value);
  }
});

const changeFormat = (val: string) => {
  const [timePart, period] = val.toLowerCase().split(" ");
  const [hours, minutes] = timePart.split(":").map(Number);

  let convertedHours = hours;
  if (period === "pm" && hours !== 12) {
    convertedHours = hours + 12;
  } else if (period === "am" && hours === 12) {
    convertedHours = 0;
  }

  return {
    hours: convertedHours,
    minutes: minutes,
    seconds: 0,
  };
};

callbackStore.add(
  "updateRangeTimePicker",
  (val: { start: string; end: string }) => {
    from.value = changeFormat(val.start);
    to.value = props.minInterval
      ? getTimeWithInterval(from.value, parseInterval(props.minInterval))
      : changeFormat(val.end);
  },
);

const toDateFromTimeObject = (time: TimeValue): Date => {
  const date = new Date();
  date.setHours(time.hours);
  date.setMinutes(time.minutes);
  date.setSeconds(time.seconds || 0);
  return date;
};

const handleFromUpdate = (newTime: TimeValue) => {
  from.value = newTime;

  if (props.minInterval) {
    const interval = parseInterval(props.minInterval);
    to.value = getTimeWithInterval(newTime, interval);
  }
};

const getTimeWithInterval = (time: TimeValue, interval: number): TimeValue => {
  const date = toDateFromTimeObject(time);
  date.setMinutes(date.getMinutes() + interval);

  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: 0,
  };
};

watch([from, to], (newTime: unknown) => {
  if (!Array.isArray(newTime)) return;
  emit("update:modelValue", newTime);
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
.ccb-range-timePicker {
  display: flex;
  pointer-events: none;

  &__from,
  &__to {
    flex: 1;
    min-width: 0;
  }

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

  &__separator {
    padding: 0 10px;
    border: v-bind(borderWidth) v-bind(borderStyle) v-bind(borderColor);
    background: v-bind(formFieldsColor);
    border-right: none;
    border-left: none;
    display: flex;
    align-items: center;
    font-weight: 500;
    color: v-bind(textColor);

    span {
      font-size: v-bind(fieldsBtnFontSize);

      @media only screen and (max-width: 480px) {
        font-size: calc(var(--ccb-mobile-fields-button-size) - 2px);
      }
    }
  }

  &__from {
    .ccb-range-timePicker__input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  &__to {
    .ccb-range-timePicker__input {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
}
</style>
