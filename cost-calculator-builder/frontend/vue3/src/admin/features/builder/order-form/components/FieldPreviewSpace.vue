<template>
  <div class="ccb-field-preview ccb-field-preview--space">
    <div class="ccb-field-preview__space"></div>
  </div>
</template>

<script setup lang="ts">
import type { IOrderFormBuilderField } from "@/admin/shared/types/order-form.type";

defineProps<{ field: IOrderFormBuilderField }>();
</script>

<style lang="scss">
.ccb-field-preview {
  &--space {
    padding: 0;
  }

  &__space {
    height: 32px;
  }
}
</style>
