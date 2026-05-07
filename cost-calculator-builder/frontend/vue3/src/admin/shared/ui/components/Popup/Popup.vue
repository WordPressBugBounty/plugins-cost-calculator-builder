<template>
  <div class="ccb-popup" @click="close">
    <button class="ccb-popup__close" @click="close">
      <i class="ccb-icon-close"></i>
    </button>
    <div class="ccb-popup__content ccb-custom-scrollbar" @click.stop>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "close"): void;
}>();

const close = () => {
  emit("close");
};
</script>

<style scoped lang="scss">
.ccb-popup {
  position: relative;
  background: var(--ccb-page-left);
  border-radius: 10px;
  padding: 50px 20px 20px 20px;
  position: absolute;
  top: -200px;
  left: -20px;
  right: 0;
  bottom: 0;
  width: 100%;
  height: calc(100vh - 40px);
  margin-left: 20px;

  &__content {
    overflow: auto;
    height: 100%;
  }

  &__close {
    position: absolute;
    right: 10px;
    top: 10px;
    border: none;
    color: var(--ccb-bw-normal);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}
</style>
