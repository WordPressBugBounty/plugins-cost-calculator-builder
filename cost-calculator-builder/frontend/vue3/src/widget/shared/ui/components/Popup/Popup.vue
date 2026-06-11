<template>
  <div v-show="isVisible" class="ccb-popup" :class="{ [size]: true }">
    <div class="ccb-popup__overlay">
      <div class="ccb-popup__wrapper">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineExpose, ref, computed, onUnmounted } from "vue";

type Props = {
  size?: "medium" | "small" | "large";
};

const props = defineProps<Props>();
const size = computed(() => props.size || "medium");

const isVisible = ref(false);

let scrollLockCount = 0;
const bodyScrollLockState = {
  scrollY: 0,
  overflow: "",
  position: "",
  top: "",
  width: "",
};

const lockBodyScroll = () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (scrollLockCount === 0) {
    bodyScrollLockState.scrollY = window.scrollY;
    bodyScrollLockState.overflow = document.body.style.overflow;
    bodyScrollLockState.position = document.body.style.position;
    bodyScrollLockState.top = document.body.style.top;
    bodyScrollLockState.width = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${bodyScrollLockState.scrollY}px`;
    document.body.style.width = "100%";
  }

  scrollLockCount++;
};

const unlockBodyScroll = () => {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    scrollLockCount <= 0
  ) {
    return;
  }

  scrollLockCount--;

  if (scrollLockCount > 0) {
    return;
  }

  const { scrollY, overflow, position, top, width } = bodyScrollLockState;

  document.body.style.overflow = overflow;
  document.body.style.position = position;
  document.body.style.top = top;
  document.body.style.width = width;
  window.scrollTo(0, scrollY);
};

const showPopup = () => {
  if (isVisible.value) {
    return;
  }

  lockBodyScroll();
  isVisible.value = true;
};

const hidePopup = () => {
  if (!isVisible.value) {
    return;
  }

  isVisible.value = false;
  unlockBodyScroll();
};

onUnmounted(() => {
  if (isVisible.value) {
    isVisible.value = false;
    unlockBodyScroll();
  }
});

defineExpose({
  showPopup,
  hidePopup,
});
</script>

<style lang="scss">
.ccb-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;

  &.large {
    .calc-thank-you-page-container {
      width: 730px;
    }
  }

  &.medium {
    .calc-thank-you-page-container {
      width: 495px;
      @media screen and (max-width: 550px) {
        width: unset;
      }
    }
  }

  &.small {
    .calc-thank-you-page-container {
      width: 410px;
    }
  }

  &__overlay {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__wrapper {
    padding: 10px;
    background: transparent;

    @media (max-width: 768px) {
      width: 90%;
    }
  }
}
</style>
