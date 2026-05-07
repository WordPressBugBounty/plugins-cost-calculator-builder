<template>
  <div :class="classes">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from "vue";
const props = defineProps<{
  disabled?: boolean;
}>();

const { disabled } = toRefs(props);

const classes = computed(() => {
  return [
    "ccb-settings-block",
    disabled.value ? "ccb-settings-block-disabled" : "",
  ];
});
</script>

<style scoped lang="scss">
.ccb-settings-block {
  width: 100%;
  height: fit-content;
  background-color: var(--ccb-bgr-sidebar);
  border-radius: 16px;
  padding: 24px;
  transition: var(--ccb-transition-normal);
  color: var(--ccb-font-labels);

  &.ccb-settings-block-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}
</style>
