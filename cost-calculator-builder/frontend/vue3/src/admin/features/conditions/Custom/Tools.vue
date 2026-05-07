<template>
  <div class="ccb-tools__container">
    <div class="ccb-solo-tool" @click="conditionsStore.toggleSidebarCollapse()">
      <i
        class="ccb-icon-ic_next ccb-toggle-sidebar"
        :class="{
          'ccb-toggle-sidebar-collapsed': conditionsStore.getSidebarCollapse,
        }"
      ></i>
    </div>
    <div class="ccb-solo-tool" style="position: relative">
      <div class="ccb-tools-icon-box" @click.stop="toggleSearchToolbar">
        <i class="ccb-icon-Search-Magnifier ccb-tools-search"></i>
      </div>
      <SearchToolbar :show="showSearchToolbar" @toggle="toggleSearchToolbar" />
    </div>
    <div class="ccb-tools">
      <div class="ccb-control-tools-group">
        <i class="ccb-icon-circle-plus" @click="zoomIn()"></i>
        <i class="ccb-icon-ic_minus" @click="zoomOut()"></i>
        <i class="ccb-icon-ic_radius" @click="resetTransform()"></i>
      </div>
      <div class="ccb-control-tools-group">
        <i class="ccb-icon-arrows-h" @click="emits('layoutGraph', 'LR')"></i>
        <i class="ccb-icon-arrows-v" @click="emits('layoutGraph', 'TB')"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useVueFlow } from "@vue-flow/core";
import { useConditionsStore } from "@/admin/app/providers/stores/useConditionsStore";
const { setViewport, zoomIn, zoomOut } = useVueFlow();
import { type Direction } from "@/admin/shared/types/conditions.type";
import { SearchToolbar } from "@/admin/features/conditions";

const emits = defineEmits<{
  (e: "layoutGraph", direction: Direction): void;
}>();

const resetTransform = (): void => {
  setViewport({ x: 0, y: 0, zoom: 1 });
};

const conditionsStore = useConditionsStore();

const showSearchToolbar = ref<boolean>(false);

const toggleSearchToolbar = (): void => {
  showSearchToolbar.value = !showSearchToolbar.value;
};
</script>

<style lang="scss" scoped>
.ccb-tools__container {
  display: flex;
  flex-direction: column;
  row-gap: 8px;
}

.ccb-solo-tool {
  width: 40px;
  height: 40px;
  background-color: var(--ccb-wb-normal);
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid transparent;
  box-sizing: border-box;
  box-shadow: none;
  transition: all 0.3s ease;
  color: var(--ccb-font-labels);

  .ccb-tools-icon-box {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .ccb-tools-search {
    font-size: 15px;
  }

  .ccb-toggle-sidebar {
    transform: rotate(0);
    transition: all 0.2s linear;
  }

  .ccb-toggle-sidebar-collapsed {
    transform: rotate(180deg);
  }

  i {
    font-size: 14px;
    color: var(--ccb-font-text);
  }

  &:hover {
    border-color: var(--ccb-input-border);
  }
}

.ccb-tools {
  width: 40px;
  background-color: var(--ccb-wb-normal);
  border-radius: 100px;
  display: flex;
  flex-direction: column;

  .ccb-control-tools-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    row-gap: 24px;
    padding: 24px 0;

    &:last-child {
      border-bottom: none;
    }

    i {
      font-size: 16px;
      color: var(--ccb-font-text);
      cursor: pointer;
    }
  }
}
</style>
