<template>
  <div class="ccb-builder-container">
    <div class="ccb-builder-container__body">
      <slot name="body"></slot>
    </div>
    <div v-if="hasToolbar" class="ccb-builder-container__toolbar">
      <slot name="toolbar"></slot>
    </div>
    <div
      class="ccb-builder-container__sidebar"
      :class="{ collapsed: isCollapsed }"
    >
      <slot name="sidebar"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const builderStore = useBuilderStore();
const slots = useSlots();

const isCollapsed = computed(() => builderStore.getSidebarCollapse);
const hasToolbar = computed(() => !!slots.toolbar);
</script>

<style lang="scss">
.ccb-builder-container {
  width: 100%;
  height: 100%;
  display: flex;
  padding-top: 20px;
  overflow-x: hidden;

  &__body {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    height: fit-content;
    transition: flex 0.2s linear;
  }

  &__toolbar {
    margin-top: 30px;
    width: 72px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    height: fit-content;
    max-height: calc(100vh - 130px);
  }

  &__sidebar {
    margin-top: 30px;
    width: 320px;
    min-width: 320px;
    height: fit-content;
    max-height: calc(100vh - 130px);
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
    gap: 20px;
    transition:
      margin-right 0.2s linear,
      opacity 0.2s linear;
    opacity: 1;

    &.collapsed {
      margin-right: -320px;
      opacity: 0;
    }
  }
}
</style>
