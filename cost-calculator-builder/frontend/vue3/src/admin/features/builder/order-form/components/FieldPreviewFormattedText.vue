<template>
  <div class="ccb-field-preview">
    <label v-if="field.attributes?.label" class="ccb-field-preview__label">
      {{ field.attributes.label }}
    </label>
    <div class="ccb-field-preview__formatted-text">
      <div
        v-html="
          field.attributes?.text || 'Write the Title or formatted text...'
        "
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IOrderFormBuilderField } from "@/admin/shared/types/order-form.type";

defineProps<{ field: IOrderFormBuilderField }>();
</script>

<style lang="scss">
.ccb-field-preview {
  &__formatted-text {
    font-size: 14px;
    color: var(--ccb-font-labels, #555);
    line-height: 1.5;
    padding: 8px 0;
  }
}
</style>
