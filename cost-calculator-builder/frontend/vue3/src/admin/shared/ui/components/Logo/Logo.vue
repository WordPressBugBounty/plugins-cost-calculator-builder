<template>
  <div class="ccb-logo-wrapper">
    <div class="ccb-logo">
      <img :src="getLogoUrl" alt="Cost Calculator" class="ccb-logo-image" />
    </div>
    <div class="ccb-logo-text">
      <Text text="Cost Calculator" size="m" weight="bold" />
      <Text text="Version 4.0.0" size="xs" weight="medium" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Text } from "@/admin/shared/ui/UIKit";

const getLogoUrl = computed(() => {
  return window.ccb_ajax_window?.plugin_url + "/frontend/dist/img/calc.svg";
});
</script>

<style scoped lang="scss">
.ccb-logo-wrapper {
  display: flex;
  align-items: center;
  column-gap: 16px;

  .ccb-logo {
    width: 40px;
    height: 40px;
    border-radius: 100px;
    background: #9bcf0c;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    .ccb-logo-image {
      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }

  .ccb-logo-text {
    display: flex;
    flex-direction: column;
    row-gap: 4px;
    line-height: 1;
    color: var(--ccb-font-heads);
  }
}
</style>
