<template>
  <div
    class="ccb-spaces ccb-custom-scrollbar"
    :class="{ 'ccb-spaces-collapsed': conditionsStore.getSidebarCollapse }"
  >
    <div
      v-for="space in spaces"
      :key="space.slug"
      class="ccb-spaces__item"
      :class="{
        'space-active': conditionsStore.getCurrentSpace === space.slug,
      }"
      @click.stop="conditionsStore.setCurrentSpace(space.slug)"
    >
      <span class="ccb-spaces__item-title">{{ space.label }}</span>
    </div>

    <div class="ccb-spaces__item add-space" @click="openSpaceModal">
      <i class="ccb-icon-ic_edit"></i>
    </div>
  </div>
  <SpaceModal v-if="showSpaceModal" @close="closeSpaceModal" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useConditionsStore } from "@/admin/app/providers/stores/useConditionsStore";
import { SpaceModal } from "@/admin/features/conditions";

const conditionsStore = useConditionsStore();

const showSpaceModal = ref<boolean>(false);

const spaces = computed(() => conditionsStore.getSpaces);

const openSpaceModal = () => {
  showSpaceModal.value = true;
};

const closeSpaceModal = () => {
  showSpaceModal.value = false;
};
</script>

<style lang="scss" scoped>
.ccb-spaces {
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding-left: 24px;
  transition: all 0.3s linear;
  column-gap: 4px;
  width: 72%;
  overflow-y: hidden;
  overflow-x: auto;
  padding-bottom: 5px;

  &__item {
    display: flex;
    align-items: center;
    justify-content: start;
    cursor: pointer;
    height: 35px;
    padding: 0 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    border-bottom: 3px solid transparent;

    .ccb-remove-space {
      cursor: pointer;
      font-size: 14px;
      color: #e33030;
      opacity: 0;
    }

    span {
      color: var(--ccb-font-labels);
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
    }

    &.space-active {
      border-bottom: 3px solid #007ac6;

      span {
        color: #007ac6;
      }

      .ccb-remove-space {
        opacity: 1;
      }
    }

    &.add-space {
      color: #008f3c;
      border: 1px solid none !important;
      border-radius: 4px;
      margin-left: 16px;
      height: unset;
      padding: unset;

      span {
        color: #008f3c !important;
      }

      i {
        font-size: 18px;
      }
    }

    &:hover {
      .ccb-remove-space {
        opacity: 1;
      }
    }
  }
}
</style>
