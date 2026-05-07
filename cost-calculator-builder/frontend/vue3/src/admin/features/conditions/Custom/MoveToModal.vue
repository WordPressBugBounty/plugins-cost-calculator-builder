<template>
  <div class="ccb-moveto-modal">
    <div class="ccb-moveto-modal-overlay" @click.self="closeModal"></div>

    <div class="ccb-moveto-modal-content">
      <div class="ccb-moveto-modal-content-header">
        <Text text="Move to" size="mx" weight="bold" />
      </div>

      <div class="ccb-moveto-modal-content-body">
        <div
          class="ccb-moveto-modal__item"
          v-for="space in spaces"
          :key="space.slug"
          :class="{
            'is-current': space.slug === currentSpaceSlug,
            'is-selected': space.slug === selectedSpaceSlug,
          }"
          @click="selectedSpaceSlug = space.slug"
        >
          <div class="ccb-moveto-modal__item-left">
            <span class="ccb-moveto-modal__item-label">{{ space.label }}</span>
          </div>
          <i
            v-if="space.slug === currentSpaceSlug"
            class="ccb-icon-ic_check ccb-moveto-modal__item-check"
          ></i>
        </div>
      </div>

      <div class="ccb-moveto-modal-content-footer">
        <Button label="Cancel" type="default" size="m" @click="closeModal" />
        <Button label="Done" type="default" size="m" @click="applyMove" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Text, Button } from "@/admin/shared/ui/UIKit";
import { useConditionsStore } from "@/admin/app/providers/stores/useConditionsStore";

const conditionsStore = useConditionsStore();

const props = defineProps<{
  nodeId: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const spaces = computed(() => conditionsStore.getSpaces);

const currentSpaceSlug = computed(() => {
  const node = conditionsStore.nodes.find((n) => n.id === props.nodeId);
  return node?.data?.space || conditionsStore.getCurrentSpace;
});

const selectedSpaceSlug = ref(currentSpaceSlug.value);

const closeModal = () => {
  emit("close");
};

const applyMove = () => {
  if (
    selectedSpaceSlug.value &&
    selectedSpaceSlug.value !== currentSpaceSlug.value
  ) {
    conditionsStore.moveChainToSpace(props.nodeId, selectedSpaceSlug.value);
    conditionsStore.setCurrentSpace(selectedSpaceSlug.value);
  }
  closeModal();
};
</script>

<style lang="scss" scoped>
.ccb-moveto-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ccb-moveto-modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  cursor: pointer;
}

.ccb-moveto-modal-content {
  position: relative;
  z-index: 1;
  max-width: 360px;
  width: 100%;
  height: max-content;
  border-radius: 16px;
  background: var(--ccb-bgr-overlay, #ffffff);
  box-shadow: 0 0 32px 0 rgba(0, 0, 0, 0.08);
  padding: 24px;
  min-height: 200px;
  max-height: 500px;
  top: -50px;
  display: flex;
  flex-direction: column;
  row-gap: 16px;

  &-header {
    display: flex;
    align-items: center;
    padding: 0 8px;
  }

  &-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 350px;
    overflow-y: auto;
    flex: 1;
  }

  &-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
  }
}

.ccb-moveto-modal__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  &.is-selected {
    background: var(--ccb-blue-bg-dull-normal, rgba(0, 122, 198, 0.1));
  }

  &-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &-label {
    color: var(--ccb-font-labels, rgba(0, 0, 0, 0.8));
    font-size: 16px;
    font-weight: 500;
    line-height: 20px;
    letter-spacing: 0.2px;
    white-space: nowrap;
  }

  &-check {
    font-size: 16px;
    color: var(--ccb-blue-fg-normal, #007ac6);
  }

  &.is-current &-label {
    color: var(--ccb-font-comment, rgba(0, 0, 0, 0.4));
  }
}
</style>
