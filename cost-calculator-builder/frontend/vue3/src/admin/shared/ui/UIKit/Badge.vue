<template>
  <div class="ccb-badge" :class="classes">
    <Text v-if="label" :text="label" size="xs" weight="bold" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Text from "./Text.vue";
import { IBadge } from "@/admin/shared/types/uikit.type";

const props = defineProps<IBadge>();

const classes = computed(() => {
  return [`ccb-badge-${props.type}`];
});
</script>

<style lang="scss">
.ccb-badge {
  padding: 6px;
  border-radius: 99px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ccb-bgr-overlay);
  transition: var(--ccb-transition-normal);

  &.ccb-badge-green {
    background-color: green;
    color: var(--ccb-button-w-normal);
  }

  &.ccb-badge-blue {
    background-color: var(--ccb-ultra-bg-normal);
    color: var(--ccb-button-w-normal);
  }

  &.ccb-badge-purple {
    background-color: purple;
    color: var(--ccb-button-w-normal);
  }
}
</style>
