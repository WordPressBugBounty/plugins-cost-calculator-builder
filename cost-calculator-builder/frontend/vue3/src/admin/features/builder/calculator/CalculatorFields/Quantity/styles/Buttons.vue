<template>
  <div
    class="ccb-field__input-wrapper ccb-quantity-buttons"
    :class="[
      { 'ccb-quantity-buttons--separation': separation },
      buttonsPosition,
    ]"
  >
    <div class="ccb-quantity-buttons__item down" @click="decrement">
      <i class="ccb-icon-Path-3518"></i>
    </div>
    <input
      type="text"
      :id="inputId"
      :aria-labelledby="ariaLabelledby"
      v-model="value"
      @focus="emit('focus', $event)"
      @focusout="emit('focusout', $event)"
      @blur="emit('blur', $event)"
      @keypress="emit('keypress', $event)"
    />
    <div class="ccb-quantity-buttons__item up" @click="increment">
      <i class="ccb-icon-Path-3493"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRefs } from "vue";
import { IQuantityField } from "@/widget/shared/types/fields";
import { watch } from "vue";

// const appearanceStore = useAppearanceStore();
// const fieldsBgColor = computed(
//   () =>
//     appearanceStore.getActivePreset?.desktop?.colors?.data?.fields?.value
//       ?.color || {},
// );

import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
const {
  borderColor,
  formFieldsColor,
  textColor,
  accentColor,
  errorColor,
  borderWidth,
  borderStyle,
} = useAppearanceColors();

type Props = {
  field: IQuantityField;
  value: string;
  inputId?: string;
  ariaLabelledby?: string;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const value = ref<string>(props.value);

const emit = defineEmits([
  "input",
  "focus",
  "focusout",
  "blur",
  "keypress",
  "increment",
  "decrement",
]);

const increment = () => emit("increment");
const decrement = () => emit("decrement");

const separation = computed(() => {
  return field.value.separation;
});

const buttonsPosition = computed(() => {
  return field.value.buttonsPosition === "right"
    ? "ccb-quantity-buttons--right"
    : "ccb-quantity-buttons--both";
});

watch(value, (newValue) => {
  emit("input", { target: { value: newValue } });
});

watch(
  () => props.value,
  (newValue) => {
    value.value = newValue;
  },
);
</script>

<style lang="scss">
.ccb-quantity-buttons {
  display: flex;
  align-items: normal;
  justify-content: flex-end;
  width: 100%;

  input {
    border-right: none;
    border-radius: 0;
    border-top-left-radius: var(--ccb-fields-border-radius);
    border-bottom-left-radius: var(--ccb-fields-border-radius);
    transition: none !important;

    &:focus {
      border-color: v-bind(accentColor) !important;
    }
  }

  .ccb-quantity-buttons__item {
    border: v-bind(borderWidth) v-bind(borderStyle) v-bind(borderColor);
    padding: 0 var(--ccb-field-side-indent);
    min-height: var(--ccb-field-button-height);
    background-color: v-bind(formFieldsColor);
    font-size: var(--ccb-fields-button-size);
    font-weight: var(--ccb-field-weight);
    box-sizing: border-box;
    color: v-bind(textColor);
    outline: none !important;
    line-height: unset !important;
    box-shadow: none !important;
    cursor: pointer;
    min-width: 47px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: color-mix(in srgb, v-bind(formFieldsColor) 85%, black);
    }
  }

  .down {
    order: 2;
  }

  .up {
    order: 3;
    border-left: none;
    border-top-right-radius: var(--ccb-fields-border-radius);
    border-bottom-right-radius: var(--ccb-fields-border-radius);
  }
}

.ccb-quantity-buttons:focus-within .ccb-quantity-buttons__item {
  border-color: v-bind(accentColor);
}

.ccb-quantity-buttons.ccb-quantity-buttons--separation.ccb-quantity-buttons--right:focus-within
  .ccb-quantity-buttons__item {
  border-color: v-bind(borderColor) !important;
}

.ccb-field-quantity.required
  .ccb-quantity-buttons.ccb-quantity-buttons--separation {
  .ccb-quantity-buttons__item {
    border-color: v-bind(borderColor) !important;
  }
}

.ccb-field-quantity.required .ccb-quantity-buttons {
  .ccb-quantity-buttons__item {
    border-color: v-bind(errorColor) !important;
  }
}

.ccb-field-quantity.required input {
  border-color: v-bind(errorColor) !important;
}

.ccb-quantity-buttons--separation.ccb-quantity-buttons--right {
  input {
    margin-right: 10px;
    border: v-bind(borderWidth) v-bind(borderStyle) v-bind(borderColor);
    border-right: v-bind(borderWidth) v-bind(borderStyle) v-bind(borderColor);
    border-top-right-radius: var(--ccb-fields-border-radius);
    border-bottom-right-radius: var(--ccb-fields-border-radius);
  }

  .down {
    border-top-left-radius: var(--ccb-fields-border-radius);
    border-bottom-left-radius: var(--ccb-fields-border-radius);
  }
}
.ccb-quantity-buttons--both {
  input {
    order: 2;
    border-left: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    text-align: center;
  }
  .down {
    order: 1;
    border-right: none;
    border-top-left-radius: var(--ccb-fields-border-radius);
    border-bottom-left-radius: var(--ccb-fields-border-radius);
  }
}

.ccb-quantity-buttons--both.ccb-quantity-buttons--separation {
  gap: 10px;

  input {
    border-radius: var(--ccb-fields-border-radius);
    border: v-bind(borderWidth) v-bind(borderStyle) v-bind(borderColor);
  }

  .ccb-quantity-buttons__item {
    border-radius: var(--ccb-fields-border-radius);
    border: v-bind(borderWidth) v-bind(borderStyle) v-bind(borderColor);
  }
}
</style>
