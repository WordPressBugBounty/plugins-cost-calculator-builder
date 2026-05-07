<template>
  <div class="ccb-subtotal-wrapper" v-bind="attrs">
    <slot />
  </div>
  <slot name="notifications" />
</template>

<script setup lang="ts">
import { useAttrs } from "vue";

defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();
</script>

<style scoped lang="scss">
.ccb-subtotal-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
