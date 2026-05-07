<template>
  <div class="ccb-create-card">
    <div class="ccb-create-card__img">
      <img :src="img" alt="Create Card" />
    </div>
    <div class="ccb-create-card__title">
      <Text :text="title" size="l" weight="bold" />
    </div>
    <div class="ccb-create-card__description">
      <Text :text="description" size="m" weight="regular" />
    </div>
    <div class="ccb-create-card__button">
      <Button
        label="Continue"
        size="m"
        type="blue-ghost"
        iconRight="ccb-icon-Path-3490"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Text, Button } from "@/admin/shared/ui/UIKit";

defineProps<{
  title: string;
  img: string;
  description: string;
}>();
</script>

<style scoped lang="scss">
.ccb-create-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 16px;
  background-color: var(--ccb-bgr-menu);
  border-radius: 16px;
  padding: 32px 16px;
  max-width: 328px;

  &__title {
    color: var(--ccb-font-heads);
  }

  &__img {
    img {
      width: 70px;
      height: 70px;
    }
  }

  &__description {
    padding: 0 16px;
    .ccb-text {
      color: var(--ccb-font-text) !important;
      text-align: center;
    }
  }
}
</style>
