<template>
  <div
    ref="pickerRef"
    class="ccb-time-dropdown"
    :class="{ 'ccb-time-dropdown--open': isOpen }"
  >
    <div
      v-if="isMobilePickerOverlayVisible"
      class="ccb-time-dropdown__overlay"
      @click="closePicker"
    ></div>

    <button
      type="button"
      class="ccb-time-dropdown__input"
      :class="{ 'ccb-time-dropdown__input--focus': isOpen }"
      @click="togglePicker"
    >
      <i class="ccb-icon-timepicker-light-clock"></i>
      <span>{{ displayValue }}</span>
      <i
        class="ccb-icon-Path-3485 ccb-time-dropdown__chevron"
        :class="{ 'ccb-time-dropdown__chevron--open': isOpen }"
      ></i>
    </button>

    <div v-if="isOpen" class="ccb-time-dropdown__panel">
      <div class="ccb-time-dropdown__header">
        <span>{{ format ? "24H" : "12H" }}</span>
        <strong>{{ pendingDisplayValue }}</strong>
      </div>

      <div
        class="ccb-time-dropdown__wheel"
        :class="{ 'ccb-time-dropdown__wheel--24': format }"
      >
        <div class="ccb-time-dropdown__column">
          <button
            v-for="hour in hoursList"
            :key="`hour-${hour}`"
            type="button"
            class="ccb-time-dropdown__option"
            :class="{
              'ccb-time-dropdown__option--active': hour === selectedHour,
            }"
            @click="selectHour(hour)"
          >
            {{ hour }}
          </button>
        </div>

        <div class="ccb-time-dropdown__column">
          <button
            v-for="minute in minutesList"
            :key="`minute-${minute}`"
            type="button"
            class="ccb-time-dropdown__option"
            :class="{
              'ccb-time-dropdown__option--active': minute === pending.minutes,
            }"
            @click="selectMinute(minute)"
          >
            {{ pad(minute) }}
          </button>
        </div>

        <div
          v-if="!format"
          class="ccb-time-dropdown__column ccb-time-dropdown__periods"
        >
          <button
            type="button"
            class="ccb-time-dropdown__period"
            :class="{
              'ccb-time-dropdown__period--active': pendingPeriod === 'AM',
            }"
            @click="selectPeriod('AM')"
          >
            AM
          </button>
          <button
            type="button"
            class="ccb-time-dropdown__period"
            :class="{
              'ccb-time-dropdown__period--active': pendingPeriod === 'PM',
            }"
            @click="selectPeriod('PM')"
          >
            PM
          </button>
        </div>
      </div>

      <div class="ccb-time-dropdown__actions">
        <button type="button" class="ccb-time-dropdown__now" @click="selectNow">
          Now
        </button>
        <button
          type="button"
          class="ccb-time-dropdown__confirm"
          @click="confirmSelection"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

type TimeValue = {
  hours: number;
  minutes: number;
  seconds: number;
};

const props = defineProps<{
  format: boolean;
  modelValue: TimeValue | null;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: TimeValue): void;
}>();

const pickerRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const pending = ref<TimeValue>(normalizeTime(props.modelValue));
const isMobilePickerOverlayVisible = ref(false);
const MOBILE_PICKER_BREAKPOINT = 540;
let scrollPosition = 0;
let isPageScrollLocked = false;
const pageScrollStyles = {
  bodyOverflow: "",
  bodyPosition: "",
  bodyTop: "",
  bodyWidth: "",
  htmlOverflow: "",
};

const hoursList = computed(() => {
  const length = props.format ? 24 : 12;
  return Array.from({ length }, (_, index) =>
    props.format ? index : index + 1,
  );
});

const minutesList = computed(() =>
  Array.from({ length: 60 }, (_, index) => index),
);

const selectedHour = computed(() => {
  if (props.format) {
    return pending.value.hours;
  }

  return pending.value.hours % 12 || 12;
});

const pendingPeriod = computed(() => (pending.value.hours >= 12 ? "PM" : "AM"));

const displayValue = computed(() =>
  formatDisplayValue(normalizeTime(props.modelValue)),
);

const pendingDisplayValue = computed(() => formatDisplayValue(pending.value));

watch(
  () => props.modelValue,
  (value) => {
    pending.value = normalizeTime(value);
  },
);

const togglePicker = () => {
  pending.value = normalizeTime(props.modelValue);
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    lockPageScroll();
    document.addEventListener("click", handleClickOutside);
  } else {
    unlockPageScroll();
    document.removeEventListener("click", handleClickOutside);
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (pickerRef.value && !pickerRef.value.contains(event.target as Node)) {
    closePicker();
  }
};

const closePicker = () => {
  isOpen.value = false;
  unlockPageScroll();
  document.removeEventListener("click", handleClickOutside);
};

const lockPageScroll = () => {
  if (
    isPageScrollLocked ||
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return;
  }

  if (!isMobilePickerViewport()) {
    isMobilePickerOverlayVisible.value = false;
    return;
  }

  const body = document.body;
  const html = document.documentElement;

  scrollPosition = window.scrollY || html.scrollTop || 0;
  pageScrollStyles.bodyOverflow = body.style.overflow;
  pageScrollStyles.bodyPosition = body.style.position;
  pageScrollStyles.bodyTop = body.style.top;
  pageScrollStyles.bodyWidth = body.style.width;
  pageScrollStyles.htmlOverflow = html.style.overflow;

  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollPosition}px`;
  body.style.width = "100%";
  html.style.overflow = "hidden";
  isMobilePickerOverlayVisible.value = true;
  isPageScrollLocked = true;
};

const unlockPageScroll = () => {
  isMobilePickerOverlayVisible.value = false;

  if (
    !isPageScrollLocked ||
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return;
  }

  const body = document.body;
  const html = document.documentElement;

  body.style.overflow = pageScrollStyles.bodyOverflow;
  body.style.position = pageScrollStyles.bodyPosition;
  body.style.top = pageScrollStyles.bodyTop;
  body.style.width = pageScrollStyles.bodyWidth;
  html.style.overflow = pageScrollStyles.htmlOverflow;
  window.scrollTo(0, scrollPosition);
  isPageScrollLocked = false;
};

const isMobilePickerViewport = () => {
  if (typeof window === "undefined") return false;

  const appContainerWidth =
    pickerRef.value?.closest(".ccb-app-container")?.getBoundingClientRect()
      .width || 0;

  return (
    window.innerWidth < MOBILE_PICKER_BREAKPOINT ||
    appContainerWidth < MOBILE_PICKER_BREAKPOINT
  );
};

const selectHour = (hour: number) => {
  if (props.format) {
    pending.value = { ...pending.value, hours: hour };
    return;
  }

  const isPm = pendingPeriod.value === "PM";
  let nextHour = hour % 12;

  if (isPm) {
    nextHour += 12;
  }

  pending.value = { ...pending.value, hours: nextHour };
};

const selectMinute = (minute: number) => {
  pending.value = { ...pending.value, minutes: minute };
};

const selectPeriod = (period: "AM" | "PM") => {
  const hours = pending.value.hours;

  if (period === "AM" && hours >= 12) {
    pending.value = { ...pending.value, hours: hours - 12 };
  }

  if (period === "PM" && hours < 12) {
    pending.value = { ...pending.value, hours: hours + 12 };
  }
};

const selectNow = () => {
  pending.value = normalizeTime(new Date());
};

const confirmSelection = () => {
  emit("update:modelValue", { ...pending.value, seconds: 0 });
  closePicker();
};

function formatDisplayValue(time: TimeValue) {
  if (props.format) {
    return `${pad(time.hours)}:${pad(time.minutes)}`;
  }

  const period = time.hours >= 12 ? "PM" : "AM";
  const hours = time.hours % 12 || 12;
  return `${hours}:${pad(time.minutes)} ${period}`;
}

function normalizeTime(value: TimeValue | Date | null): TimeValue {
  if (value instanceof Date) {
    return {
      hours: value.getHours(),
      minutes: value.getMinutes(),
      seconds: 0,
    };
  }

  if (value) {
    return {
      hours: clamp(value.hours, 0, 23),
      minutes: clamp(value.minutes, 0, 59),
      seconds: 0,
    };
  }

  const now = new Date();
  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: 0,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Number(value) || 0, min), max);
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}
</script>

<style lang="scss" scoped>
.ccb-time-dropdown {
  position: relative;
  width: 100%;

  &__input {
    width: 100%;
    min-height: var(--ccb-field-button-height);
    padding: 0 var(--ccb-field-side-indent);
    padding-left: max(35px, var(--ccb-field-side-indent));
    border: var(--ccb-fields-border) var(--ccb-fields-border-style)
      var(--ccb-fields-border-color);
    border-radius: var(--ccb-fields-border-radius);
    background: var(--ccb-fields-bg-color);
    color: var(--ccb-text-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--ccb-fields-button-size);
    font-weight: var(--ccb-fields-button-weight);
    position: relative;
    transition:
      border-color 200ms ease,
      box-shadow 200ms ease;

    @media only screen and (max-width: 480px) {
      padding-left: max(35px, var(--ccb-mobile-field-side-indent));
      font-size: var(--ccb-mobile-fields-button-size);
      font-weight: var(--ccb-mobile-fields-button-weight);
    }

    @media (max-width: 480px) {
      padding-right: 0px;
    }

    &--focus {
      border-color: var(--ccb-accent-color);
      box-shadow: 0 0 0 4px
        color-mix(in srgb, var(--ccb-accent-color), transparent 82%);
    }

    .ccb-icon-timepicker-light-clock {
      position: absolute;
      left: 12px;
      font-size: 16px;
    }
  }

  &__overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    pointer-events: auto;
    z-index: 999998;
  }

  &__chevron {
    margin-left: auto;
    color: var(--ccb-text-color);
    font-size: 10px;
    opacity: 0.65;
    transition: transform 200ms ease;

    &--open {
      transform: rotate(180deg);
    }

    @media (max-width: 480px) {
      display: none;
    }
  }

  &__panel {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    z-index: 30;
    width: 100%;
    padding: 12px;
    border: 1px solid var(--ccb-fields-border-color);
    border-radius: calc(var(--ccb-fields-border-radius) * 2);
    background: var(--ccb-fields-bg-color);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.16);
    box-sizing: border-box;
    width: 320px;

    @media (max-width: 540px) {
      position: fixed;
      top: 50%;
      right: auto;
      bottom: auto;
      left: 50%;
      transform: translate(-50%, -50%);
      width: calc(100vw - 100px);
      min-width: unset;
      max-width: calc(100vw - 100px);
      z-index: 999999;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    color: var(--ccb-text-color);

    span {
      opacity: 0.55;
      font-size: var(--ccb-fields-button-size);
      font-weight: 600;
    }

    strong {
      font-size: calc(var(--ccb-fields-button-size) + 6px);
      font-weight: 700;
    }
  }

  &__wheel {
    display: grid;
    grid-template-columns: 1fr 1fr 96px;
    gap: 0;
    max-height: 144px;
    border: 1px solid var(--ccb-fields-border-color);
    border-radius: var(--ccb-fields-border-radius);
    overflow: hidden;
    position: relative;

    &--24 {
      grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr 1fr 76px;
    }
  }

  &__column {
    max-height: 144px;
    overflow-y: auto;
    scrollbar-width: none;
    border-right: 1px solid var(--ccb-fields-border-color);

    &:last-child {
      border-right: none;
    }

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__option,
  &__period {
    width: 100%;
    min-height: 48px;
    border: 0;
    background: transparent;
    color: var(--ccb-text-color);
    cursor: pointer;
    font-size: calc(var(--ccb-fields-button-size) + 2px);
    font-weight: 500;
    transition:
      background 200ms ease,
      color 200ms ease,
      opacity 200ms ease;

    &:hover {
      background: color-mix(in srgb, var(--ccb-accent-color), transparent 56%);
    }
  }

  &__option {
    opacity: 0.45;

    &--active {
      opacity: 1;
      background: color-mix(in srgb, var(--ccb-accent-color), transparent 88%);
      color: var(--ccb-text-color);
      font-size: calc(var(--ccb-fields-button-size) + 6px);
      font-weight: 700;
      box-shadow:
        inset 0 1px 0
          color-mix(in srgb, var(--ccb-accent-color), transparent 45%),
        inset 0 -1px 0
          color-mix(in srgb, var(--ccb-accent-color), transparent 45%);
    }
  }

  &__periods {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    background: var(--ccb-fields-bg-color);
  }

  &__period {
    flex: 1;
    border: 1px solid var(--ccb-fields-border-color);
    border-radius: var(--ccb-button-border-radius);
    font-size: var(--ccb-fields-button-size);
    font-weight: 700;

    &--active {
      background: var(--ccb-accent-color);
      border-color: var(--ccb-accent-color);
      color: var(--ccb-fields-bg-color);
      box-shadow: 0 8px 16px
        color-mix(in srgb, var(--ccb-accent-color), transparent 70%);
    }
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 18px;
  }

  &__now,
  &__confirm {
    min-height: 44px;
    padding: 10px 20px;
    border-radius: var(--ccb-button-border-radius);
    cursor: pointer;
    font-size: var(--ccb-fields-button-size);
    font-weight: var(--ccb-fields-button-weight);
    transition:
      background 200ms ease,
      border-color 200ms ease;
  }

  &__now {
    border: 1px solid var(--ccb-fields-border-color);
    background: var(--ccb-fields-bg-color);
    color: var(--ccb-text-color);

    &:hover {
      background: color-mix(in srgb, var(--ccb-accent-color), transparent 90%);
    }
  }

  &__confirm {
    margin-left: auto;
    border: 1px solid var(--ccb-accent-color);
    background: var(--ccb-accent-color);
    color: var(--ccb-fields-bg-color);

    &:hover {
      background: hsl(from var(--ccb-accent-color) h s calc(l - 5));
    }
  }
}
</style>
