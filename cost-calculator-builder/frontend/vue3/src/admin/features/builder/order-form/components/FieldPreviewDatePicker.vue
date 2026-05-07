<template>
  <div class="ccb-field-preview">
    <label class="ccb-field-preview__label">
      {{ field.attributes?.label || "Date Picker" }}
      <span
        v-if="field.attributes?.required === '1'"
        class="ccb-field-preview__required"
        >*</span
      >
    </label>
    <div class="ccb-field-preview__date-picker">
      <input
        type="text"
        class="ccb-field-preview__input"
        :placeholder="String(field.attributes?.placeholder || 'Select Date')"
        disabled
      />
      <i class="ccb-icon-ic_calendar ccb-field-preview__date-icon"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IOrderFormBuilderField } from "@/admin/shared/types/order-form.type";

defineProps<{ field: IOrderFormBuilderField }>();
</script>

<style lang="scss">
.ccb-field-preview {
  &__date-picker {
    position: relative;

    .ccb-field-preview__input {
      padding-right: 36px;
    }
  }

  &__date-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: var(--ccb-font-comment, #aaa);
  }
}
</style>
