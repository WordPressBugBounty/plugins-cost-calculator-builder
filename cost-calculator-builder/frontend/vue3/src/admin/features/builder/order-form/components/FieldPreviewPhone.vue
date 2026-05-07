<template>
  <div class="ccb-field-preview">
    <div class="ccb-field-preview__header">
      <label class="ccb-field-preview__label">
        {{ field.attributes?.label || "Phone" }}
        <span
          v-if="field.attributes?.required === '1'"
          class="ccb-field-preview__required"
          >*</span
        >
      </label>
      <div
        v-if="field.attributes?.primary === '1'"
        class="ccb-field-preview__badge"
      >
        <span class="ccb-field-preview__badge-dot"></span>
        Primary mean of communication
      </div>
    </div>
    <input
      type="tel"
      class="ccb-field-preview__input"
      :placeholder="String(field.attributes?.placeholder || 'Type your phone')"
      disabled
    />
  </div>
</template>

<script setup lang="ts">
import type { IOrderFormBuilderField } from "@/admin/shared/types/order-form.type";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const { textColor, formFieldsColor, borderColor } = useAppearanceColors();

defineProps<{ field: IOrderFormBuilderField }>();
</script>

<style scoped lang="scss">
.ccb-field-preview {
  &__input {
    color: v-bind(textColor) !important;
    background: v-bind(formFieldsColor) !important;
    border: 1px solid v-bind(borderColor) !important;
  }
}
</style>
