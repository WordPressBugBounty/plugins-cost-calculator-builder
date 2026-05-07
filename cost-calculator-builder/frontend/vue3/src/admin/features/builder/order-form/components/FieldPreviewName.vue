<template>
  <div class="ccb-field-preview">
    <label class="ccb-field-preview__label">
      {{ field.attributes?.label || "Name" }}
      <span
        v-if="field.attributes?.required === '1'"
        class="ccb-field-preview__required"
        >*</span
      >
    </label>
    <input
      type="text"
      class="ccb-field-preview__input"
      :placeholder="String(field.attributes?.placeholder || 'Type your name')"
      disabled
    />
  </div>
</template>

<script setup lang="ts">
import type { IOrderFormBuilderField } from "@/admin/shared/types/order-form.type";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const { formFieldsColor, textColor, borderColor } = useAppearanceColors();

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
