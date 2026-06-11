<template>
  <BuilderContainer>
    <template #body>
      <div class="ccb-calculator-module__body">
        <BuilderNavigation />
        <CalculatorContent />
      </div>
    </template>
    <template #toolbar>
      <SidebarCollapseToolbar />
    </template>
    <template #sidebar>
      <Transition name="sidebar-mode-switch" mode="out-in">
        <div
          v-if="isTotalSummaryMode"
          key="summary-sidebar"
          class="ccb-sidebar-mode-wrapper"
        >
          <TotalSummarySidebar />
        </div>
        <div
          v-else
          key="calculator-sidebar"
          class="ccb-sidebar-mode-wrapper ccb-calculator-sidebar-wrapper"
        >
          <div class="ccb-calculator-sidebar-tabs">
            <div
              v-for="tab in sidebarTabs"
              :key="tab.id"
              class="ccb-calculator-sidebar-tabs__item"
              :class="{ 'is-active': activeSidebar === tab.id }"
              @click="setSidebarContent(tab.id)"
            >
              <i :class="tab.icon"></i>
              <span>{{ tab.label }}</span>
            </div>
          </div>
          <Transition name="sidebar-switch" mode="out-in">
            <component :is="activeSidebarComponent" :key="activeSidebar" />
          </Transition>
        </div>
      </Transition>
    </template>
  </BuilderContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue";
import BuilderContainer from "@/admin/shared/ui/components/Builder/BuilderContainer.vue";
import BuilderNavigation from "@/admin/features/builder/common/BuilderNavigation.vue";
import SidebarCollapseToolbar from "@/admin/features/builder/common/SidebarCollapseToolbar.vue";
import CalculatorContent from "./CalculatorContent.vue";
import CalculatorSidebar from "./CalculatorSidebar.vue";
import LayoutSidebar from "./LayoutSidebar.vue";
import ThemesSidebar from "./ThemesSidebar.vue";
import TotalSummarySidebar from "@/admin/features/builder/total-summary/TotalSummarySidebar.vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import type { builderSidebarContentType } from "@/admin/shared/types/builder.type";

const builderStore = useBuilderStore();

function onWindowClick(e: MouseEvent) {
  if (!builderStore.getSelectedFieldAlias) return;
  const target = e.target as HTMLElement;
  if (
    target.closest(".ccb-field-item") ||
    target.closest(".ccb-section--selected") ||
    target.closest(".ccb-builder-container__sidebar")
  )
    return;
  builderStore.setSelectedField(null);
}

onMounted(() => window.addEventListener("click", onWindowClick));
onBeforeUnmount(() => window.removeEventListener("click", onWindowClick));

const sidebarTabs = [
  { id: "builder" as const, label: "Fields", icon: "ccb-icon-ic_elements" },
  { id: "layout" as const, label: "Layout", icon: "ccb-icon-ic_layout" },
  { id: "themes" as const, label: "Theme", icon: "ccb-icon-ic_collor" },
];

const activeSidebar = computed(
  () => builderStore.getBuilderContent.sidebarContent,
);
const isTotalSummaryMode = computed(
  () => builderStore.getBuilderContent.content === "total-summary",
);

const setSidebarContent = (tab: builderSidebarContentType) => {
  builderStore.setSidebarContent(tab);
};

const sidebarComponents = {
  builder: CalculatorSidebar,
  layout: LayoutSidebar,
  themes: ThemesSidebar,
} as const;

const activeSidebarComponent = computed(() => {
  if (!activeSidebar.value) return null;
  return (
    sidebarComponents[activeSidebar.value as keyof typeof sidebarComponents] ??
    null
  );
});
</script>

<style scoped lang="scss">
.ccb-calculator-module__body {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  row-gap: 20px;
}

.ccb-calculator-sidebar-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 16px;
  border-radius: 16px;
  background: var(--ccb-bgr-sidebar);
}

.ccb-sidebar-mode-wrapper {
  width: 100%;
}

.ccb-calculator-sidebar-tabs {
  display: flex;
  gap: 2px;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 12px;
    flex: 1 1 0;
    min-width: 0;
    cursor: pointer;
    background-color: var(--ccb-bw-dull-disabled);
    color: var(--ccb-button-bw-disabled);
    font-size: 14px;
    font-weight: 500;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;

    i {
      font-size: 16px;
    }

    &:first-child {
      padding-left: 16px;
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
    }

    &:last-child {
      padding-right: 16px;
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
    }

    &:hover:not(.is-active) {
      background-color: var(--ccb-bw-dull-hover, #e5e7eb);
    }

    &.is-active {
      color: var(--ccb-blue-fg-normal);
      background-color: var(--ccb-blue-bg-dull-normal);
    }
  }
}

.sidebar-switch-enter-active,
.sidebar-switch-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.sidebar-switch-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.sidebar-switch-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.sidebar-mode-switch-enter-active,
.sidebar-mode-switch-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.sidebar-mode-switch-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.sidebar-mode-switch-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
