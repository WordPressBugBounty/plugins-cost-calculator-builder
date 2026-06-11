<template>
  <div
    class="ccb-page-navigation-wrapper"
    :class="{ active: isActive }"
    @dragover="onDragOver"
    @dragleave="onWrapperDragLeave"
    @drop.prevent="onDrop"
    v-if="paginationType !== 'hidden'"
  >
    <div class="ccb-page-controls" @click.stop="onSelectNavigation">
      <i class="ccb-icon-ic_edit"></i>
      <div class="ccb-page-controls__title">Edit</div>
    </div>
    <Transition name="ccb-nav-switch" mode="out-in">
      <component
        :is="pageNavigationComponent"
        :key="paginationType"
        :pages="pages"
        :active-page="activePage"
        :page-labels="pageLabels"
        @change-page="onChangePage"
        @select="onSelectNavigation"
        :hide-title="hidePaginationTitle"
        :is-active="isActive"
        class="ccb-page-navigation-component"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount } from "vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";

import { useAppearanceSpacing } from "@/admin/shared/utils/useAppearanceSpacing";

const builderStore = useBuilderStore();
const settingsStore = useSettingsStore();

const {
  containerMarginTop,
  containerMarginRight,
  containerMarginBottom,
  containerMarginLeft,
} = useAppearanceSpacing();

const isActive = computed(() => {
  return builderStore.getPageNavigationSelected;
});

const hidePaginationTitle = computed(
  () => settingsStore.getSettings?.page_break?.hide_pagination_title ?? false,
);

const summaryLastPage = computed(() => {
  return (
    settingsStore.getSettings?.page_break?.summary_after_last_page ?? false
  );
});

const pages = computed(() => {
  if (!summaryLastPage.value) {
    return builderStore.getPages;
  }

  const lastPage = builderStore.getPages[builderStore.getPages.length - 1] || 0;
  return [...builderStore.getPages, lastPage + 1];
});

const activePage = computed(() => builderStore.getActivePage);
const pageLabels = computed(() =>
  summaryLastPage.value
    ? [
        ...builderStore.getBuilderFields.map(
          (page, i) => page.label || `Page ${i + 1}`,
        ),
        "Summary",
      ]
    : builderStore.getBuilderFields.map(
        (page, i) => page.label || `Page ${i + 1}`,
      ),
);

const pageBreak = computed(() => settingsStore.getSettings?.page_break);
const paginationType = computed(
  () => pageBreak.value?.pagination_type || "circle_with_line",
);

const pageNavigationComponent = computed(() => {
  if (paginationType.value === "circle_with_line") {
    return defineAsyncComponent(() => import("./styles/CircleWithLine.vue"));
  } else if (paginationType.value === "rectangle_steps_with_line") {
    return defineAsyncComponent(() => import("./styles/RectangleWithLine.vue"));
  } else if (paginationType.value === "circle_tabs") {
    return defineAsyncComponent(() => import("./styles/CircleTabs.vue"));
  } else if (paginationType.value === "rectangle_tabs") {
    return defineAsyncComponent(() => import("./styles/RectangleTabs.vue"));
  } else if (paginationType.value === "progress_with_circle") {
    return defineAsyncComponent(
      () => import("./styles/ProgressWithCircle.vue"),
    );
  } else if (paginationType.value === "progress_with_bar") {
    return defineAsyncComponent(() => import("./styles/ProgressWithBar.vue"));
  }
  return defineAsyncComponent(() => import("./styles/CircleWithLine.vue"));
});

function onChangePage(index: number) {
  if (builderStore.getBuilderContent.content === "total-summary") {
    return;
  }
  builderStore.setActivePage(index);
}

function onSelectNavigation() {
  builderStore.setSelectedField(null);
  builderStore.setPageNavigationSelected(true);
  builderStore.setSidebarContent("builder");
  builderStore.setBuilderContent("calculator");
  if (builderStore.getSidebarCollapse) {
    builderStore.setSidebarCollapse(false);
  }
}

// ── Drag-hover page switching ──────────────────────────────────────────

let dragPageTimer: ReturnType<typeof setTimeout> | null = null;
let hoveredPageIndex: number | null = null;
let hoveredStepEl: Element | null = null;

function findPageStep(target: EventTarget | null): Element | null {
  if (!(target instanceof HTMLElement)) return null;
  return target.closest("[data-page-index]");
}

function clearDragTimer() {
  if (dragPageTimer) {
    clearTimeout(dragPageTimer);
    dragPageTimer = null;
  }
  if (hoveredStepEl) {
    hoveredStepEl.classList.remove("ccb-drag-page-hover");
    hoveredStepEl = null;
  }
  hoveredPageIndex = null;
}

function onDragOver(e: DragEvent) {
  e.preventDefault();

  if (!builderStore.isDragging) return;

  const stepEl = findPageStep(e.target);
  const pageIndex = stepEl
    ? parseInt(stepEl.getAttribute("data-page-index") || "", 10)
    : null;

  const validPageIndex =
    pageIndex !== null &&
    !isNaN(pageIndex) &&
    pageIndex !== activePage.value &&
    pageIndex < builderStore.builderFields.length
      ? pageIndex
      : null;

  if (validPageIndex === hoveredPageIndex) return;

  clearDragTimer();

  if (validPageIndex === null) return;

  hoveredPageIndex = validPageIndex;
  hoveredStepEl = stepEl;
  stepEl!.classList.add("ccb-drag-page-hover");

  dragPageTimer = setTimeout(() => {
    const targetPage = hoveredPageIndex;
    clearDragTimer();
    if (targetPage !== null) {
      builderStore.setActivePage(targetPage);
    }
  }, 400);
}

function onWrapperDragLeave(e: DragEvent) {
  const wrapper = e.currentTarget as HTMLElement;
  const related = e.relatedTarget as HTMLElement | null;
  if (!related || !wrapper.contains(related)) {
    clearDragTimer();
  }
}

function onDrop() {
  clearDragTimer();
}

onBeforeUnmount(() => {
  clearDragTimer();
});
</script>

<style lang="scss">
.ccb-page-controls {
  position: absolute;
  top: -14px;
  right: -1px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  height: 28px;
  padding: 0 16px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 99px;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
  z-index: 5;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.ccb-page-navigation-wrapper {
  position: relative;
  margin: v-bind(containerMarginTop) v-bind(containerMarginRight)
    v-bind(containerMarginBottom) v-bind(containerMarginLeft);

  &:hover,
  &.active {
    > .ccb-page-controls {
      opacity: 1;
    }
  }

  :deep([data-page-index].ccb-drag-page-hover) {
    outline: 2px solid var(--ccb-blue-bg-normal, #3b82f6);
    outline-offset: 2px;
    border-radius: 8px;
    background: rgba(59, 130, 246, 0.12) !important;
    transition: all 0.15s ease;
  }
}

.ccb-nav-switch-enter-active,
.ccb-nav-switch-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.ccb-nav-switch-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.ccb-nav-switch-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
