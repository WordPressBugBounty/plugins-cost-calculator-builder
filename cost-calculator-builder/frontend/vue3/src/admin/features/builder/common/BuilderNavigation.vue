<template>
  <div
    class="ccb-builder-navigation"
    @dragover="onDragOver"
    @dragleave="onWrapperDragLeave"
    @drop.prevent="onDrop"
  >
    <div
      class="ccb-builder-navigation-list"
      style="max-width: 60%; flex-wrap: wrap"
    >
      <div
        v-for="(page, index) in builderStore.getBuilderFields"
        :key="page._id"
        class="ccb-builder-navigation-list-item"
        :class="{ active: isPageActive(index) }"
        :data-page-index="index"
        @click="handlePageClick(index)"
      >
        <Text
          :text="page.label || `Page ${index + 1}`"
          :show-original="Boolean(page.label)"
          size="s"
          weight="medium"
        />
      </div>
      <div
        class="ccb-builder-navigation-list-item add-page"
        @click="handleAddPage"
        :class="{
          'active-add-page':
            activeContent === 'calculator' && appStore.getIsPro,
        }"
      >
        <i class="ccb-icon-ic_plus_small"></i>
        <Text text="Add Page" size="s" weight="medium" />
        <Badge v-if="!appStore.getIsPro" label="PRO" :type="'blue'" />
      </div>
    </div>
    <div class="ccb-builder-navigation-separator"></div>
    <div class="ccb-builder-navigation-list">
      <div
        class="ccb-builder-navigation-list-item"
        @click="handleTotalSummary"
        :class="{ active: activeContent === 'total-summary' }"
      >
        <Text text="Total Summary" size="s" weight="medium" />
      </div>
      <div
        class="ccb-builder-navigation-list-item"
        @click="handleOrderForm"
        :class="{ active: activeContent === 'order-form' }"
      >
        <Text text="Contact Form" size="s" weight="medium" />
      </div>
      <div
        class="ccb-builder-navigation-list-item"
        @click="handleConfirmation"
        :class="{ active: activeContent === 'confirmation' }"
      >
        <Text text="Confirmation" size="s" weight="medium" />
      </div>
    </div>

    <ConfirmDialog
      :visible="confirmVisible"
      title="Unsaved Changes"
      message="You have unsaved changes. Would you like to save them before leaving?"
      confirm-text="Save"
      cancel-text="Discard"
      confirm-type="blue"
      cancel-type="default"
      @update:visible="confirmVisible = $event"
      @confirm="resolveConfirm(true)"
      @cancel="resolveConfirm(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useOrderFormStore } from "@/admin/app/providers/stores/useOrderFormStore";
import { Text, ConfirmDialog, Badge } from "@/admin/shared/ui/UIKit";
import { useCalculatorStore } from "@/admin/app/providers/stores/useCalculatorStore";
import type { builderContentType } from "@/admin/shared/types/builder.type";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";

const builderStore = useBuilderStore();
const orderFormStore = useOrderFormStore();
const calculatorStore = useCalculatorStore();
const appStore = useAppStore();

const activeContent = computed(() => {
  return builderStore.getBuilderContent.content;
});

const confirmVisible = ref(false);
let confirmResolver: ((value: boolean) => void) | null = null;

function resolveConfirm(value: boolean) {
  confirmResolver?.(value);
  confirmResolver = null;
}

function askConfirmation(): Promise<boolean> {
  confirmVisible.value = true;
  return new Promise((resolve) => {
    confirmResolver = resolve;
  });
}

function isPageActive(index: number): boolean {
  return (
    activeContent.value === "calculator" && builderStore.getActivePage === index
  );
}

async function handlePageClick(index: number) {
  const canLeave = await beforeLeaveOrderForm("calculator");
  if (!canLeave) return;
  builderStore.setActivePage(index);
  builderStore.setBuilderContent("calculator");
}

async function handleAddPage() {
  const canLeave = await beforeLeaveOrderForm("calculator");
  if (!canLeave) return;
  builderStore.addPage();
}

async function handleTotalSummary() {
  const canLeave = await beforeLeaveOrderForm("total-summary");
  if (!canLeave) return;
  builderStore.setBuilderContent("total-summary");
  builderStore.setSelectedField(null);
  builderStore.setPageNavigationSelected(false);
}

function handleOrderForm() {
  builderStore.setBuilderContent("order-form");
}

async function handleConfirmation() {
  const canLeave = await beforeLeaveOrderForm("confirmation");
  if (!canLeave) return;
  builderStore.setBuilderContent("confirmation");
}

async function beforeLeaveOrderForm(
  targetContent: builderContentType,
): Promise<boolean> {
  if (
    activeContent.value !== "order-form" ||
    targetContent === "order-form" ||
    !orderFormStore.getDirty
  ) {
    return true;
  }

  const shouldSave = await askConfirmation();

  if (shouldSave) {
    const wasDraft = orderFormStore.getIsDraftActiveForm;
    const success = await orderFormStore.updateForm();
    if (!success) return false;

    if (wasDraft) {
      const calcId = calculatorStore.getId;
      const createdFormId = orderFormStore.getActiveFormId;
      if (calcId && createdFormId) {
        await orderFormStore.applyFormToCalculator(
          Number(createdFormId),
          Number(calcId),
        );
      }
    }
    return true;
  }

  await orderFormStore.discardActiveChanges();
  return true;
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
    pageIndex !== builderStore.getActivePage
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
      builderStore.setBuilderContent("calculator");
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

<style scoped lang="scss">
.ccb-builder-navigation {
  display: flex;
  align-items: center;

  &-list {
    display: flex;

    &-item {
      cursor: pointer;
      padding: 8px;
      color: var(--ccb-font-labels);
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;

      &:hover {
        color: var(--ccb-blue-bg-normal);
      }

      &.active {
        color: var(--ccb-blue-bg-normal);
        border-bottom: 3px solid var(--ccb-blue-bg-normal);
      }

      &.add-page {
        i {
          font-size: 8px;
        }
        color: var(--ccb-green-bg-normal);
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;

        &.active-add-page {
          opacity: 1;
          cursor: pointer;
          pointer-events: auto;
        }
      }

      &.disable {
        color: var(--ccb-font-labels);
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }
    }
  }

  &-separator {
    width: 1px;
    height: 16px;
    background-color: var(--ccb-border-normal);
  }
}

[data-page-index].ccb-drag-page-hover {
  outline: 2px solid var(--ccb-blue-bg-normal, #3b82f6);
  outline-offset: 2px;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.12);
  transition: all 0.15s ease;
}
</style>
