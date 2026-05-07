<template>
  <div
    class="ccb-page-nav-rect-tabs"
    @click.stop="$emit('select')"
    :class="{ active: isActive }"
  >
    <div class="ccb-page-nav-rect-tabs__steps">
      <div
        v-for="(page, index) in pages"
        :key="page"
        class="ccb-page-nav-rect-tabs__step"
        :class="{
          'is-active': index === activePage,
          'is-done': index < activePage,
        }"
        :data-page-index="index"
        @click.stop="$emit('change-page', index)"
      >
        <span class="ccb-page-nav-rect-tabs__rect">
          <i v-if="index < activePage" class="ccb-icon-radius-check"></i>
          <span v-else>{{ index + 1 }}</span>
        </span>
        <span class="ccb-page-nav-rect-tabs__label" v-if="!hideTitle">
          {{ pageLabels[index] }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
import type {
  PageNavigationProps,
  PageNavigationEmits,
} from "@/admin/shared/types/appearance.type";

defineProps<PageNavigationProps>();
defineEmits<PageNavigationEmits>();

const {
  containerColor,
  accentColor,
  textColor,
  formFieldsColor,
  textDefaultColor,
  circleDoneColor,
  containerShadow,
  containerBorder,
  containerBorderRadius,
} = useAppearanceColors();
</script>

<style scoped lang="scss">
.ccb-page-nav-rect-tabs {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  padding: 8px 20px;
  background: v-bind(containerColor);
  border: 1px solid transparent;
  border-radius: 16px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: border-color 0.2s ease;
  position: relative;
  box-shadow: v-bind(containerShadow);
  border: v-bind(containerBorder);
  border-radius: v-bind(containerBorderRadius);
  overflow: hidden;

  &:hover {
    border-color: var(--ccb-blue-bg-normal, #0b79d0);
  }

  &.active {
    border-color: var(--ccb-blue-bg-normal, #0b79d0);
  }

  &__steps {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  &__step {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    cursor: pointer;
    padding: 4px 8px 4px 4px;
    border-radius: 8px;
    transition: background 0.2s ease;

    &:hover {
      background: var(--ccb-wb-hover, #f3f4f6);
    }
  }

  &__rect {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
    background: v-bind(formFieldsColor);
    color: v-bind(textDefaultColor);
    transition: all 0.25s ease;

    i {
      font-size: 14px;
    }
  }

  &__label {
    font-size: 13px;
    font-weight: 500;
    line-height: 16px;
    color: v-bind(textDefaultColor);
    white-space: nowrap;
    transition: all 0.25s ease;
  }

  &__step.is-active &__rect {
    background: v-bind(accentColor);
    color: v-bind(containerColor);
  }

  &__step.is-active &__label {
    color: v-bind(textColor);
    font-weight: 600;
  }

  &__step.is-done &__rect {
    background-color: v-bind(circleDoneColor);
    color: v-bind(accentColor);
  }

  &__step.is-done &__label {
    color: v-bind(textColor);
  }
}
</style>
