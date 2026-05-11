<template>
  <div class="ccb-builder-toolbar">
    <div class="ccb-builder-toolbar__top">
      <div
        class="ccb-builder-toolbar__toggle"
        :class="{ 'is-collapsed': isCollapsed }"
        @click="toggleSidebar"
      >
        <i class="ccb-icon-ic_next"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const builderStore = useBuilderStore();

const isCollapsed = computed(() => builderStore.getSidebarCollapse);

function toggleSidebar() {
  builderStore.setSidebarCollapse(!builderStore.getSidebarCollapse);
}
</script>

<style scoped lang="scss">
.ccb-builder-toolbar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 40px;
  border-radius: 100px;
  padding: 8px 6px 12px;
  gap: 8px;

  &__top {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  &__bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
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

  &__group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    background: var(--ccb-wb-normal);
    border-radius: 100px;
    padding: 6px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;

    i {
      font-size: 16px;
      color: var(--ccb-font-labels);
      transition: color 0.2s ease;
    }

    &:hover {
      background: #f3f4f6;

      i {
        color: #6b7280;
      }
    }

    &.is-active {
      i {
        color: var(--ccb-blue-fg-normal);
      }
    }
  }

  &__share {
    background: var(--ccb-wb-normal);
    border-radius: 50%;
    width: 40px;
    height: 40px;

    i {
      color: var(--ccb-magenta-fg-normal);
    }

    &:hover {
      background: var(--ccb-magenta-bg-dull-normal);

      i {
        color: var(--ccb-magenta-fg-hover);
      }
    }
  }
}
</style>
