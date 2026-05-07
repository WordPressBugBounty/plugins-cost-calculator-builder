<template>
  <div class="ccb-field-preview">
    <label class="ccb-field-preview__label">
      {{ field.attributes?.label || "Time Picker" }}
      <span
        v-if="field.attributes?.required === '1'"
        class="ccb-field-preview__required"
        >*</span
      >
    </label>
    <div class="ccb-field-preview__time-picker">
      <div class="ccb-field-preview__time-slot">
        <span class="ccb-field-preview__time-value">12</span>
        <span class="ccb-field-preview__time-separator">:</span>
        <span class="ccb-field-preview__time-value">00</span>
        <span v-if="!is24h" class="ccb-field-preview__time-period">AM</span>
      </div>
      <template v-if="field.attributes?.range">
        <span class="ccb-field-preview__time-range-divider">—</span>
        <div class="ccb-field-preview__time-slot">
          <span class="ccb-field-preview__time-value">12</span>
          <span class="ccb-field-preview__time-separator">:</span>
          <span class="ccb-field-preview__time-value">00</span>
          <span v-if="!is24h" class="ccb-field-preview__time-period">PM</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { IOrderFormBuilderField } from "@/admin/shared/types/order-form.type";

const props = defineProps<{ field: IOrderFormBuilderField }>();

const is24h = computed(() => {
  return (
    props.field.attributes?.format === true ||
    props.field.attributes?.format === "1"
  );
});
</script>

<style lang="scss">
.ccb-field-preview {
  &__time-picker {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__time-slot {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--ccb-bgr-sidebar, #f5f5f5);
    border: 1px solid var(--ccb-border-normal, #e0e0e0);
    border-radius: 8px;
    padding: 8px 12px;
  }

  &__time-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--ccb-font-title, #1a1a1a);
    min-width: 20px;
    text-align: center;
  }

  &__time-separator {
    font-size: 14px;
    color: var(--ccb-font-comment, #aaa);
  }

  &__time-period {
    font-size: 12px;
    color: var(--ccb-font-comment, #aaa);
    margin-left: 4px;
  }

  &__time-range-divider {
    color: var(--ccb-font-comment, #aaa);
  }
}
</style>
