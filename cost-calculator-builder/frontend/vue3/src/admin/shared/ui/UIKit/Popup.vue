<template>
  <transition name="ccb-popup-fade">
    <div
      class="ccb-popup"
      v-show="show"
      :class="{ 'with-overlay': overlay }"
      :style="{ width: width }"
    >
      <div class="ccb-popup__content">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { toRefs } from "vue";

const props = defineProps<{
  overlay?: boolean;
  show: boolean;
  width?: string;
}>();

const { show, overlay } = toRefs(props);
</script>

<style scoped lang="scss">
.ccb-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;

  &__content {
    background-color: var(--ccb-bgr-popup);
    border-radius: 12px;
    padding: 24px;
    will-change: transform, opacity;
  }

  &.with-overlay {
    background-color: rgba(0, 0, 0, 0.5);
  }
}

/* Fade анимация контейнера + лёгкий зум контента */
.ccb-popup-fade-enter-active,
.ccb-popup-fade-leave-active {
  transition: opacity 0.2s ease;
}
.ccb-popup-fade-enter-from,
.ccb-popup-fade-leave-to {
  opacity: 0;
}

/* Анимация контента, синхронизированная с состояниями контейнера */
.ccb-popup-fade-enter-active .ccb-popup__content,
.ccb-popup-fade-leave-active .ccb-popup__content {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.ccb-popup-fade-enter-from .ccb-popup__content,
.ccb-popup-fade-leave-to .ccb-popup__content {
  transform: translateY(8px) scale(0.98);
  opacity: 0;
}
</style>
