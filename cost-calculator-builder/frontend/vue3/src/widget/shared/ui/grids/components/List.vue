<template>
  <div class="ccb-fields-list">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.ccb-fields-list {
  display: grid;
  gap: var(--ccb-field-spacing);
}

.ccb-horizontal,
.ccb-two-column {
  .ccb-fields-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
