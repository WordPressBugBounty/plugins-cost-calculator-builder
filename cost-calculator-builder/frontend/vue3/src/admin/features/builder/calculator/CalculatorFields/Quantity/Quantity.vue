<template>
  <div
    class="ccb-field ccb-field-quantity"
    :class="{
      required: isRequired,
      'ccb-field-disabled': field.disabled,
      [field.additionalStyles || '']: !!field.additionalStyles,
    }"
  >
    <div class="ccb-field__label">
      <div v-if="isRequired" class="ccb-required-tooltip"></div>
      <div class="ccb-field__title">
        <span :id="labelId">{{ field.label }}</span>
        <span v-if="field.required" class="ccb-field-required-mark">*</span>
      </div>
      <div class="ccb-field__hidden" v-if="field.hidden">
        <i class="ccb-icon-ic_eye_crossed"></i>
      </div>
    </div>

    <component
      :is="getStyleComponent"
      :field="field"
      :value="formattedValue"
      :input-id="inputId"
      :aria-labelledby="labelId"
      :key="forceUpdateKey"
    />

    <div class="ccb-field__descriptions ccb-after">
      <div v-if="!field.hideMinMax" class="ccb-field__description">
        Min: {{ field.min }} - Max: {{ field.max }}
      </div>
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, toRefs } from "vue";

const props = defineProps<{
  field: any;
}>();

const { field } = toRefs(props);

// const requiredWarningText = computed(() => {
//   return "Это поле обязательно для заполнения";
// });

const isRequired = computed(() => {
  return false;
});

// const getRangeRequiredText = computed(() => {
//   return "Это поле обязательно для заполнения";
// });

const labelId = computed(() => {
  return "quantity-label";
});

const formattedValue = computed(() => {
  return field.value.default || field.value.min || 0;
});

const inputId = computed(() => {
  return "quantity-input";
});

const forceUpdateKey = computed(() => {
  return Math.random();
});

const styles = computed(() => field.value.styles?.style);

const getStyleComponent = computed(() => {
  if (styles.value === "default") {
    return defineAsyncComponent(
      () =>
        import(
          "@/admin/features/builder/calculator/CalculatorFields/Quantity/styles/Default.vue"
        ),
    );
  }
  if (styles.value === "buttons") {
    return defineAsyncComponent(
      () =>
        import(
          "@/admin/features/builder/calculator/CalculatorFields/Quantity/styles/Buttons.vue"
        ),
    );
  }
});
</script>

<style>
.ccb-field-quantity {
  pointer-events: none;
}
</style>
