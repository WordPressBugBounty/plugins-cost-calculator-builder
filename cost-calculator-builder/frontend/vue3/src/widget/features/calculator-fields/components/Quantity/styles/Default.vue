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
import { ref } from "vue";
import { IQuantityField } from "@/widget/shared/types/fields";
import { watch } from "vue";

type Props = {
  field: IQuantityField;
};

const props = defineProps<Props>();

const value = ref<string>(props.field.value.toString());

const emit = defineEmits(["input"]);

const increment = () => {
  let newValue =
    Math.round((Number(value.value) + Number(props.field.step)) * 100) / 100;
  if (newValue <= props.field.max) {
    value.value = newValue.toString();
    emit("input", { target: { value: newValue } });
  }
};

const decrement = () => {
  let newValue =
    Math.round((Number(value.value) - Number(props.field.step)) * 100) / 100;
  if (newValue >= props.field.min) {
    value.value = newValue.toString();
    emit("input", { target: { value: newValue } });
  }
};

watch(value, (newValue) => {
  emit("input", { target: { value: newValue } });
});
</script>
