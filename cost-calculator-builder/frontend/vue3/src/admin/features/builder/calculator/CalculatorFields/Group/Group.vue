<template>
  <div class="ccb-field ccb-group">
    <div class="ccb-group__header">
      <div class="ccb-group__actions">
        <button
          class="ccb-group__collapse"
          :class="{ 'is-collapsed': isCollapsed }"
          @click.stop="$emit('toggle-collapse')"
        >
          <i class="ccb-icon-Path-3514"></i>
        </button>
      </div>
      <span class="ccb-group__title">
        {{ field.label }}
      </span>
    </div>

    <div v-show="!isCollapsed" class="ccb-group__body">
      <slot />
    </div>

    <div class="ccb-group__divider"></div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import type { IGroupField } from "@/admin/shared/types/fields.type";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const { containerColor, textColor, borderColor } = useAppearanceColors();

const props = defineProps<{
  field: IGroupField;
  isCollapsed?: boolean;
}>();

const { field } = toRefs(props);

defineEmits<{
  (e: "toggle-collapse"): void;
}>();
</script>

<style lang="scss">
.ccb-group {
  width: 100%;
  border-radius: 8px;
  background: v-bind(containerColor);
  overflow: hidden;
  color: v-bind(textColor);

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 14px;
    font-weight: 700;
    color: v-bind(textColor);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__collapse {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    pointer-events: auto;
    background: v-bind(containerColor);

    i {
      font-size: 10px;
      transition: transform 0.2s ease;
      color: v-bind(textColor);
    }

    &.is-collapsed i {
      transform: rotate(180deg);
    }
  }

  &__body {
    position: relative;
  }

  &__fields {
    display: flex;
    flex-wrap: wrap;
    min-height: 60px;
    padding: 16px;
    border: 2px dashed v-bind(borderColor);
    border-radius: 8px;
    background: v-bind(containerColor);
    min-height: 144px;

    &.not-empty {
      border: none;
      padding: 0 2px;
      background: transparent;
    }

    .ccb-field-item {
      pointer-events: auto;
      cursor: default;

      &:deep(.ccb-field) {
        pointer-events: none;
        user-select: none;
      }
    }
  }

  &__placeholder {
    position: absolute;
    top: 16px;
    left: 16px;
    right: 16px;
    bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: v-bind(textColor);
    font-size: 13px;
    pointer-events: none;
    user-select: none;
  }

  &__divider {
    height: 2px;
    background: var(--ccb-border-normal, #e5e7eb);
    margin: 20px 16px 10px;
    border-radius: 1px;
  }
}
</style>
