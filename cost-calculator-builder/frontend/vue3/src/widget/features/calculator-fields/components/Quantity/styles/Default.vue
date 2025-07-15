<template>
  <div class="ccb-field__input-wrapper">
    <input type="text" v-model="value" />
    <div class="ccb-input-counter up" @click="increment">
      <i class="ccb-icon-Path-3486"></i>
    </div>
    <div class="ccb-input-counter down" @click="decrement">
      <i class="ccb-icon-Path-3485"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs } from "vue";
import { IQuantityField } from "@/widget/shared/types/fields";
import { watch } from "vue";

type Props = {
  field: IQuantityField;
  value: string;
};

const props = defineProps<Props>();

const { field } = toRefs(props);

const value = ref<string>(props.value);
const emit = defineEmits(["input"]);

watch(
  () => props.value,
  (newValue) => {
    value.value = newValue;
  },
);

const increment = () => {
  let newValue =
    Math.round((Number(value.value) + Number(field.value.step)) * 100) / 100;
  if (newValue <= field.value.max) {
    value.value = newValue.toString();
    emit("input", { target: { value: newValue } });
  }
};

const decrement = () => {
  let newValue =
    Math.round((Number(value.value) - Number(field.value.step)) * 100) / 100;
  if (newValue >= field.value.min) {
    value.value = newValue.toString();
    emit("input", { target: { value: newValue } });
  }
};

watch(value, (newValue) => {
  emit("input", { target: { value: newValue } });
});
</script>
