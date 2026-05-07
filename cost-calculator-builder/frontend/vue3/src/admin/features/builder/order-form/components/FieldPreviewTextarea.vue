<template>
  <div class="ccb-field-preview">
    <label class="ccb-field-preview__label">
      {{ field.attributes?.label || "Text Area" }}
      <span
        v-if="field.attributes?.required === '1'"
        class="ccb-field-preview__required"
        >*</span
      >
    </label>
    <textarea
      class="ccb-field-preview__textarea"
      :placeholder="String(field.attributes?.placeholder || 'Type your text')"
      disabled
    ></textarea>
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
  &__textarea {
    width: 100%;
    min-height: 100px;
    border: 1px solid v-bind(borderColor) !important;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    color: v-bind(textColor) !important;
    background: v-bind(formFieldsColor) !important;
    outline: none;
    resize: vertical;
    font-family: inherit;

    &::placeholder {
      color: var(--ccb-font-comment, #aaa);
    }
  }
}
</style>
