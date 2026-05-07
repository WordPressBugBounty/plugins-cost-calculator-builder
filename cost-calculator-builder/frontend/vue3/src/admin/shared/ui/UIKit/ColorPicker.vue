<template>
  <div class="ccb-color-picker" @click="onColorPickerClick">
    <input
      class="ccb-color-picker__input"
      type="color"
      :value="modelValue"
      ref="colorPickerInputRef"
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface IProps {
  modelValue: string;
}

defineProps<IProps>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

const colorPickerInputRef = ref<HTMLInputElement | null>(null);

const onColorPickerClick = () => {
  colorPickerInputRef.value?.click();
};
</script>

<style scoped lang="scss">
.ccb-color-picker {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid var(--ccb-input-border);
  overflow: hidden;
  flex-shrink: 0;
  background-color: v-bind(modelValue);
  cursor: pointer;

  &__input {
    width: 100%;
    height: 100%;
    border: 0;
    padding: 0;
    cursor: pointer;
    background: transparent;
    visibility: hidden;
  }
}
</style>
