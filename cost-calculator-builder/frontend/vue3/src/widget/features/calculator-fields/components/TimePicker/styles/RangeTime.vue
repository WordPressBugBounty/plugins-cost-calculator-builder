<template>
  <div class="ccb-range-timePicker">
    <div class="ccb-range-timePicker__from">
      <TimeDropdown
        v-model="from"
        :format="format"
        @update:model-value="handleFromUpdate"
      />
    </div>
    <div class="ccb-range-timePicker__separator">
      <span>to</span>
    </div>
    <div class="ccb-range-timePicker__to">
      <TimeDropdown
        v-model="to"
        :format="format"
        @update:model-value="handleToUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useCallbackStore } from "@/widget/app/providers/stores/callbackStore.ts";
import TimeDropdown from "./TimeDropdown.vue";

const callbackStore = useCallbackStore();

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

const handleToUpdate = (newTime: TimeValue) => {
  to.value = newTime;

  if (props.minInterval) {
    const interval = parseInterval(props.minInterval);
    from.value = getTimeWithInterval(newTime, -interval);
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

  &__from,
  &__to {
    flex: 1;
    min-width: 0;
  }

  &__separator {
    padding: 0 10px;
    border: var(--ccb-fields-border) var(--ccb-fields-border-style)
      var(--ccb-fields-border-color);
    background: var(--ccb-fields-bg-color);
    border-right: none;
    border-left: none;
    display: flex;
    align-items: center;
    font-weight: 500;
    color: var(--ccb-text-color);

    span {
      font-size: var(--ccb-fields-button-size);

      @media only screen and (max-width: 480px) {
        font-size: var(--ccb-mobile-fields-button-size);
      }
    }
  }

  &__from {
    .ccb-time-dropdown__input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  &__to {
    .ccb-time-dropdown__input {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    .ccb-time-dropdown__panel {
      left: auto;
      right: 0;
    }
  }
}
</style>
