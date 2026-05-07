<template>
  <div class="ccb-admin-header">
    <div class="ccb-admin-header__left">
      <slot name="left"></slot>
    </div>
    <div class="ccb-admin-header__right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.ccb-admin-header {
  display: flex;
  width: 100%;
  height: 64px;
  justify-content: space-between;
  align-items: center;

  &__left {
    display: flex;
    align-items: center;
    column-gap: 20px;
  }

  &__right {
    display: flex;
    align-items: center;
    column-gap: 20px;
  }
}
</style>
