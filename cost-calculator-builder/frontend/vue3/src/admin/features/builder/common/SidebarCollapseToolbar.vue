<template>
  <div class="ccb-sidebar-collapse-toolbar">
    <button
      class="ccb-sidebar-collapse-toolbar__toggle"
      :class="{ 'is-collapsed': isCollapsed }"
      type="button"
      :aria-label="translations.toggleSidebar"
      @click="toggleSidebar"
    >
      <i class="ccb-icon-ic_next"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";

const builderStore = useBuilderStore();
const translationsStore = useBuilderTranslationsStore();

const isCollapsed = computed(() => builderStore.getSidebarCollapse);
const translations = computed(() => translationsStore.getTranslations);

function toggleSidebar(): void {
  builderStore.setSidebarCollapse(!builderStore.getSidebarCollapse);
}
</script>

<style scoped lang="scss">
.ccb-sidebar-collapse-toolbar {
  width: 40px;
  display: flex;
  justify-content: center;
}

.ccb-sidebar-collapse-toolbar__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--ccb-transition-normal);
  background: var(--ccb-wb-normal);

  i {
    font-size: 12px;
    color: var(--ccb-font-labels);
    transition:
      transform 0.3s ease,
      color 0.2s ease;
  }

  &:hover {
    i {
      color: #6b7280;
    }
  }

  &.is-collapsed {
    i {
      transform: rotate(180deg);
    }
  }
}
</style>
