<template>
  <div class="ccb-single-timePicker">
    <TimeDropdown v-model="time" :format="format" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useCallbackStore } from "@/widget/app/providers/stores/callbackStore.ts";
import TimeDropdown from "./TimeDropdown.vue";

const callbackStore = useCallbackStore();

const props = defineProps<{
  format: boolean;
  modelValue: { hours: number; minutes: number; seconds: number } | null;
}>();

const emit = defineEmits(["update:modelValue"]);

const time = ref<{ hours: number; minutes: number; seconds: number }>(
  props.modelValue || getCurrentTime(),
);

watch(time, (newTime) => {
  if (newTime) {
    emit("update:modelValue", newTime);
  }
});

watch(
  () => props.modelValue,
  (newTime) => {
    if (newTime) {
      time.value = newTime;
    }
  },
);

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

function getCurrentTime() {
  const now = new Date();

  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: 0,
  };
}
</script>
