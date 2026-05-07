<template>
  <div
    class="ccb-sidebar ccb-custom-scrollbar"
    :class="{ 'ccb-sidebar-collapsed': conditionsStore.getSidebarCollapse }"
  >
    <div class="ccb-sidebar__title">
      <Text text="Elements" size="mx" weight="bold" />
    </div>

    <div class="ccb-sidebar__pages" v-if="pages.length > 1">
      <div class="ccb-sidebar__pages_title">
        {{ translations.pages || "Pages" }}
      </div>
      <div
        v-if="hasSlider"
        class="ccb-sidebar__pages_arrow"
        :class="{ 'is-disabled': sliderOffset === 0 }"
        @click="slideLeft"
      >
        <i class="ccb-icon-ic_caret_left"></i>
      </div>
      <TransitionGroup
        :name="slideDirection === 'right' ? 'slide-right' : 'slide-left'"
        tag="div"
        class="ccb-sidebar__pages_list"
      >
        <div
          class="ccb-sidebar__pages_item"
          v-for="page in visiblePages"
          :key="page"
          :class="{ 'page-active': page === activePage }"
          @click="activePage = page"
        >
          {{ pages.indexOf(page) + 1 }}
        </div>
      </TransitionGroup>
      <div
        v-if="hasSlider"
        class="ccb-sidebar__pages_arrow"
        :class="{ 'is-disabled': sliderOffset >= pages.length - maxVisible }"
        @click="slideRight"
      >
        <i class="ccb-icon-ic_caret_right"></i>
      </div>
    </div>

    <div class="ccb-sidebar__nodes" v-if="getPageElements.length">
      <div
        v-for="element in getPageElements"
        :key="element.alias"
        class="ccb-sidebar__node vue-flow__node-input"
        :draggable="true"
        @dragstart="onDragStart($event, 'input', element)"
      >
        <div class="ccb-sidebar__node_icon">
          <i :class="element.icon"></i>
        </div>
        <div class="ccb-sidebar__node_title-box">
          <div class="ccb-sidebar__node_title">{{ element.label }}</div>
          <div class="ccb-sidebar__node_title-description">
            [{{ element.alias }}]
          </div>
        </div>
      </div>
    </div>

    <div class="ccb-sidebar__empty" v-else>
      <div class="ccb-sidebar__empty_icon">
        <i class="ccb-icon-warning"></i>
      </div>
      <div class="ccb-sidebar__empty_text">
        {{
          translations.no_elements ||
          "No elements on this page. Add fields in the calculator builder to use them in conditions."
        }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useConditionsStore } from "@/admin/app/providers/stores/useConditionsStore";
import useDragAndDrop from "@/admin/features/conditions/composable/useDnD";
import { Text } from "@/admin/shared/ui/UIKit";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";

const conditionsStore = useConditionsStore();
const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);

const { onDragStart } = useDragAndDrop();

const activePage = ref<number | null>(null);
const sliderOffset = ref(0);
const maxVisible = 6;
const slideDirection = ref<"left" | "right">("right");

const pages = computed(() => {
  const builderStore = useBuilderStore();
  const pageNumbers = builderStore.getPages;

  if (
    (!activePage.value ||
      (activePage.value && !pageNumbers.includes(activePage.value))) &&
    pageNumbers.length > 0
  ) {
    activePage.value = pageNumbers[0];
  }

  return pageNumbers;
});

const hasSlider = computed(() => pages.value.length >= 7);

const visiblePages = computed(() => {
  if (!hasSlider.value) {
    return pages.value;
  }
  return pages.value.slice(sliderOffset.value, sliderOffset.value + maxVisible);
});

function slideLeft() {
  if (sliderOffset.value > 0) {
    slideDirection.value = "left";
    sliderOffset.value--;
  }
}

function slideRight() {
  if (sliderOffset.value < pages.value.length - maxVisible) {
    slideDirection.value = "right";
    sliderOffset.value++;
  }
}

watch(pages, () => {
  if (sliderOffset.value > pages.value.length - maxVisible) {
    sliderOffset.value = Math.max(0, pages.value.length - maxVisible);
  }
});

const HIDDEN_ALIASES = ["repeater"];

const getPageElements = computed(() => {
  const builderStore = useBuilderStore();
  if (!activePage.value) {
    return [];
  }
  return builderStore.getPageElementsById(activePage.value).filter((el) => {
    const prefix = el.alias.replace(/_field_id.*/, "");
    return !HIDDEN_ALIASES.includes(prefix);
  });
});
</script>

<style lang="scss" scoped>
.ccb-sidebar {
  min-width: 320px;
  border-radius: 16px;
  background: var(--ccb-bgr-sidebar);
  color: #fff;
  font-weight: 700;
  padding: 24px 16px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  transition: all 200ms linear;
  position: absolute;
  right: 0;
  width: auto;
  height: calc(100vh - 175px);
  overflow-y: auto;
  align-items: flex-start;
  transition: all 200ms linear;

  &.ccb-sidebar-collapsed {
    margin-right: -320px;
    opacity: 0;
    pointer-events: none;
    display: none;
  }

  &__title {
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 1;
    color: var(--ccb-font-heads);
  }

  &__pages {
    display: flex;
    flex-direction: row;
    column-gap: 2px;
    width: 100%;
    height: 40px;
    align-items: center;
    border-radius: 99px;
    border: 1px solid var(--ccb-input-border);
    background: var(--ccb-input-normal);
    padding: 8px 4px;

    &_title {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      color: var(--ccb-font-comment);
      font-size: 15px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      padding: 0 10px;
    }

    &_arrow {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      border-radius: 99px;
      overflow: hidden;

      i {
        font-size: 9px;
        color: var(--ccb-font-labels);
      }

      &:hover {
        background: rgba(0, 0, 0, 0.06);
      }

      &.is-disabled {
        opacity: 0.3;
        pointer-events: none;
      }
    }

    &_list {
      display: flex;
      flex-direction: row;
      column-gap: 2px;
      overflow: hidden;
      position: relative;
    }

    &_item {
      cursor: pointer;
      display: flex;
      width: 24px;
      height: 24px;
      align-items: center;
      justify-content: center;
      row-gap: 2px;
      border-radius: 99px;
      border: 1px solid transparent;
      color: var(--ccb-font-labels);
      font-size: 15px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;

      &:hover {
        background: rgba(0, 0, 0, 0.06);
      }

      &.page-active {
        color: var(--ccb-blue-fg-normal);
        background-color: var(--ccb-blue-bg-dull-normal);
      }
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: 12px;
    width: 100%;
    padding: 32px 16px;
    border-radius: 12px;
    border: 1px dashed var(--ccb-input-border);
    text-align: center;

    &_icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 99px;
      background-color: rgba(0, 0, 0, 0.04);

      i {
        font-size: 18px;
        color: var(--ccb-font-comment);
      }
    }

    &_text {
      color: var(--ccb-font-comment);
      font-size: 13px;
      font-weight: 400;
      line-height: 18px;
      max-width: 240px;
    }
  }

  &__nodes {
    display: flex;
    flex-direction: column;
    row-gap: 4px;
    width: 100%;
  }

  &__node {
    cursor: grab;
    display: flex;
    align-items: center;
    column-gap: 16px;
    width: 100%;
    height: 58px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: var(--ccb-input-normal);

    &_icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      background-color: var(--ccb-blue-bg-dull-normal);

      i {
        color: var(--ccb-blue-fg-normal);
        font-size: 14px;
      }
    }

    &_title-box {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    &_title {
      overflow: hidden;
      color: var(--ccb-font-heads);
      white-space: nowrap;
      overflow: hidden;
      max-width: 200px;
      text-overflow: ellipsis;

      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
      letter-spacing: 0.2px;
    }

    &_title-description {
      overflow: hidden;
      color: var(--ccb-font-comment);

      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 16px;
      letter-spacing: 0.2px;
      text-indent: 2px;
      white-space: nowrap;
      overflow: hidden;
      max-width: 200px;
      text-overflow: ellipsis;
    }
  }
}

.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s ease;
}

.slide-right-enter-active,
.slide-left-enter-active {
  transition-delay: 0.05s;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(8px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.slide-right-leave-active,
.slide-left-leave-active {
  position: absolute;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

.slide-right-move,
.slide-left-move {
  transition: transform 0.2s ease;
}
</style>
