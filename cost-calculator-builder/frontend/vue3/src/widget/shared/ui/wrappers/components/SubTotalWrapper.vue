<template>
  <div class="ccb-block">
    <div class="ccb-section ccb-section-subtotal">
      <div class="ccb-subtotal-wrapper">
        <slot />
      </div>
    </div>
    <slot name="notifications" />
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/widget/_mixins.scss" as mixins;

.ccb-subtotal-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ccb-section {
  @include mixins.container;
}
</style>
<script setup lang="ts"></script>
