<template>
  <Teleport to="body">
    <transition name="ccb-confirm-fade">
      <div v-if="visible" class="ccb-confirm-dialog" @click.self="handleCancel">
        <div class="ccb-confirm-dialog__content">
          <div class="ccb-confirm-dialog__header">
            <Text
              v-if="title"
              :text="title"
              size="m"
              weight="bold"
              class="ccb-confirm-dialog__title"
            />
            <button class="ccb-confirm-dialog__close" @click="handleCancel">
              <i class="ccb-icon-ic_cross_small"></i>
            </button>
          </div>

          <Text
            :text="message"
            size="s"
            weight="regular"
            class="ccb-confirm-dialog__message"
          />

          <div class="ccb-confirm-dialog__actions">
            <Button
              :label="cancelText || 'Cancel'"
              size="s"
              :type="cancelType || 'default'"
              @click="handleCancel"
            />
            <Button
              :label="confirmText || 'Confirm'"
              size="s"
              :type="confirmType || 'blue'"
              @click="handleConfirm"
            />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { IConfirmDialog } from "@/admin/shared/types/uikit.type";
import Text from "./Text.vue";
import Button from "./Button.vue";

defineProps<IConfirmDialog>();

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
  (e: "update:visible", value: boolean): void;
}>();

function handleConfirm() {
  emit("update:visible", false);
  emit("confirm");
}

function handleCancel() {
  emit("update:visible", false);
  emit("cancel");
}
</script>

<style scoped lang="scss">
.ccb-confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.45);

  &__content {
    background-color: var(--ccb-bgr-popup);
    border-radius: 12px;
    padding: 24px;
    min-width: 380px;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    will-change: transform, opacity;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--ccb-font-labels);
  }

  &__close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ccb-font-labels);
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: var(--ccb-transition-normal);

    i {
      font-size: 16px;
    }

    &:hover {
      background-color: var(--ccb-bw-dull-normal);
    }
  }

  &__message {
    color: var(--ccb-font-labels);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }
}

.ccb-confirm-fade-enter-active,
.ccb-confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.ccb-confirm-fade-enter-from,
.ccb-confirm-fade-leave-to {
  opacity: 0;
}

.ccb-confirm-fade-enter-active .ccb-confirm-dialog__content,
.ccb-confirm-fade-leave-active .ccb-confirm-dialog__content {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.ccb-confirm-fade-enter-from .ccb-confirm-dialog__content,
.ccb-confirm-fade-leave-to .ccb-confirm-dialog__content {
  transform: translateY(8px) scale(0.98);
  opacity: 0;
}
</style>
