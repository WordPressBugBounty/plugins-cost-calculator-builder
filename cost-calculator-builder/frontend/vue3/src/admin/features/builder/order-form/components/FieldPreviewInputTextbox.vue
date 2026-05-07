<template>
  <div class="ccb-field-preview">
    <label class="ccb-field-preview__label">
      {{ field.attributes?.label || "Input Textbox" }}
      <span
        v-if="field.attributes?.required === '1'"
        class="ccb-field-preview__required"
        >*</span
      >
    </label>
    <input
      type="text"
      class="ccb-field-preview__input"
      :placeholder="String(field.attributes?.placeholder || 'Type your text')"
      disabled
    />
  </div>
</template>

<script setup lang="ts">
import type { IOrderFormBuilderField } from "@/admin/shared/types/order-form.type";

defineProps<{ field: IOrderFormBuilderField }>();
</script>
