<template>
  <div class="ccb-empty-content">
    <div class="ccb-empty-content__icon">
      <i :class="icon"></i>
    </div>
    <div class="ccb-empty-content__title">
      <Text :text="title" size="l" weight="bold" />
    </div>
    <div class="ccb-empty-content__description">
      <Text :text="description" size="m" weight="regular" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import Text from "./Text.vue";

const props = defineProps<{
  title: string;
  description: string;
  icon: string;
}>();

const { title, description, icon } = toRefs(props);
</script>

<style scoped lang="scss">
.ccb-empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 10px;
  padding: 100px 0;

  &__icon {
    font-size: 50px;
    color: var(--ccb-bw-normal);
  }

  &__title {
    color: var(--ccb-bw-normal);
  }

  &__description {
    color: var(--ccb-bw-normal);
  }
}
</style>
