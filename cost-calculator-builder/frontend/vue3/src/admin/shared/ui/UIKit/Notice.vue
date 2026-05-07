<template>
  <div class="ccb-notice" :class="type">
    <div class="ccb-notice__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { INotice } from "@/admin/shared/types/uikit.type";

defineProps<INotice>();
</script>

<style scoped lang="scss">
.ccb-notice {
  padding: 16px;
  border-radius: 12px;

  &__content {
    gap: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &.info {
    background-color: var(--ccb-bw-dull-normal);
    color: var(--ccb-font-text);
    font-size: 12px;
  }

  &.warning {
    background-color: var(--ccb-yellow-bg-dull-normal);
    color: var(--ccb-yellow-fg-normal);
  }

  &.success {
    background-color: var(--ccb-green-bg-dull-normal);
    color: var(--ccb-green-fg-normal);
  }

  &.error {
    background-color: var(--ccb-red-bg-dull-normal, #fef2f2);
    color: var(--ccb-red-fg-normal, #dc2626);
  }

  &.warning {
    background-color: var(--ccb-orange-bg-dull-normal, #fffbeb);
    color: var(--ccb-orange-fg-normal, #d97706);
  }
}
</style>
