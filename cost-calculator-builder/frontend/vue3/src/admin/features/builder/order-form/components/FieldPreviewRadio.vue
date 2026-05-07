<template>
  <div class="ccb-field-preview">
    <label class="ccb-field-preview__label">
      {{ (field.attributes && field.attributes.label) || "Radio" }}
      <span
        v-if="field.attributes && field.attributes.required === '1'"
        class="ccb-field-preview__required"
        >*</span
      >
    </label>
    <div
      class="ccb-field-preview__radio-group"
      :class="(field.attributes && field.attributes.display) || 'Vertical'"
    >
      <label
        v-for="(option, index) in options"
        :key="index"
        class="ccb-field-preview__radio-item"
      >
        <input
          type="radio"
          :name="`radio_${field.id || field.tempId}`"
          disabled
        />
        <span>{{ option.optionText || `Radio ${index + 1}` }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type {
  IOrderFormBuilderField,
  IOrderFormFieldOption,
} from "@/admin/shared/types/order-form.type";

const props = defineProps<{ field: IOrderFormBuilderField }>();

const options = computed<IOrderFormFieldOption[]>(() => {
  const opts = props.field.attributes?.options;
  return Array.isArray(opts) ? (opts as IOrderFormFieldOption[]) : [];
});
</script>

<style lang="scss">
.ccb-field-preview {
  &__radio-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &.Horizontal {
      flex-direction: row;
    }

    &.Vertical {
      flex-direction: column;
    }
  }

  &__radio-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--ccb-font-labels, #555);
    cursor: default;

    input {
      pointer-events: none;
    }
  }
}
</style>
