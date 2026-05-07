<template>
  <div class="ccb-admin-wrapper">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.ccb-admin-wrapper {
  margin-left: 4px;
  margin-right: 24px;
  padding: 0;
  position: relative;
  transition: background-color 300ms linear;
  background-color: var(--ccb-page-left);
  height: 100%;
  overflow: hidden;
}
</style>
