<template>
  <div class="ccb-popup">
    <div class="ccb-popup__content">
      <button
        class="ccb-back-btn"
        @click="close"
        v-if="showBackButton"
        title="Back"
      >
        <i class="ccb-icon-ic_back"></i>
      </button>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, toRefs } from "vue";

const props = defineProps<{
  showBackButton?: boolean;
}>();

const { showBackButton } = toRefs(props);

const emit = defineEmits<{
  (e: "close"): void;
}>();

const close = () => {
  emit("close");
};
</script>

<style scoped>
#wp-content {
  background-color: red;
}

.ccb-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999999;
  border-radius: 16px;
  background: var(--ccb-page-left);
  margin-top: 32px;
  margin-left: 160px;
  padding: 8px 24px;
  margin-bottom: 30px;
  height: calc(100vh - 32px);
}

.ccb-popup__content {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}
.ccb-back-btn {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1011100;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: var(--ccb-bw-dull-normal);
  color: var(--ccb-font-labels);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
  transition: var(--ccb-transition-normal, 0.2s ease);

  &:hover {
    background: var(--ccb-bw-dull-hover, #f5f5f5);
  }
}
</style>
