<template>
  <div class="ccb-field-preview">
    <div class="ccb-field-preview__header">
      <label class="ccb-field-preview__label">
        {{ field.attributes?.label || "Email" }}
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
      type="email"
      class="ccb-field-preview__input"
      :placeholder="String(field.attributes?.placeholder || 'Type your email')"
      disabled
    />
    <input
      v-if="field.attributes?.confirmation === '1'"
      type="email"
      class="ccb-field-preview__input"
      placeholder="Confirm email"
      disabled
    />
  </div>
</template>

<script setup lang="ts">
import type { IOrderFormBuilderField } from "@/admin/shared/types/order-form.type";

defineProps<{ field: IOrderFormBuilderField }>();
</script>
