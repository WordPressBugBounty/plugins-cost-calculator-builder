<template>
  <div class="ccb-field ccb-repeater-field">
    <div class="ccb-repeater-field__header">
      <div class="ccb-repeater-field__actions">
        <button
          class="ccb-repeater-field__collapse"
          :class="{ 'is-collapsed': isCollapsed }"
          @click.stop="$emit('toggle-collapse')"
        >
          <i class="ccb-icon-Path-3514"></i>
        </button>
      </div>
      <span class="ccb-repeater-field__title">
        {{ field.label }}
        <span class="ccb-repeater-field__number">#1</span>
      </span>
    </div>

    <div v-show="!isCollapsed" class="ccb-repeater-field__body">
      <slot />
    </div>

    <div v-show="!isCollapsed" class="ccb-repeater-field__footer">
      <button class="ccb-repeater-field__btn-remove" @click.stop>
        <i class="ccb-icon-ic_delete"></i>
        <span>{{ field.removeButtonLabel }}</span>
      </button>
      <button class="ccb-repeater-field__btn-add" @click.stop>
        <i class="ccb-icon-ic_plus_small"></i>
        <span> {{ field.addButtonLabel }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import type { IRepeaterField } from "@/admin/shared/types/fields.type";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const {
  containerColor,
  textColor,
  borderColor,
  containerDarkColor,
  accentColor,
  errorColor,
} = useAppearanceColors();

const props = defineProps<{
  field: IRepeaterField;
  isCollapsed?: boolean;
}>();

const { field } = toRefs(props);

defineEmits<{
  (e: "toggle-collapse"): void;
}>();
</script>

<style lang="scss">
.ccb-repeater-field {
  width: 100%;
  border-left: 4px solid v-bind(containerDarkColor);
  border-radius: 8px;
  background: v-bind(containerColor);
  overflow: hidden;
  color: v-bind(textColor);

  &__header {
    display: flex;
    align-items: center;
    padding: 14px 16px;
  }

  &__title {
    font-size: 14px;
    font-weight: 700;
    color: v-bind(textColor);
  }

  &__number {
    font-weight: 500;
    color: v-bind(textColor);
    margin-left: 4px;
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
    background: v-bind(containerColor);
    color: v-bind(textColor);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    pointer-events: auto;

    i {
      font-size: 10px;
      transition: transform 0.2s ease;
    }

    &.is-collapsed i {
      transform: rotate(180deg);
    }

    &:hover {
      background: var(--ccb-blue-bg-hover, #2563eb);
    }
  }

  &__body {
    padding: 0 16px;
    position: relative;
  }

  &__drop-zone {
    display: flex;
    flex-wrap: wrap;
    min-height: 80px;
    padding: 16px;
    border: 2px dashed v-bind(borderColor);
    border-radius: 8px;
    background: v-bind(containerColor);
  }

  &__placeholder {
    position: absolute;
    top: 0;
    left: 16px;
    right: 16px;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: v-bind(textColor);
    font-size: 13px;
    pointer-events: none;
    user-select: none;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px 14px;
  }

  &__btn-remove {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 8px;
    color: v-bind(errorColor);
    border: 1px solid v-bind(errorColor);
    background: v-bind(containerColor);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    i {
      font-size: 14px;
      color: var(--ccb-red-fg-normal, #ef4444);
    }

    &:hover {
      background: var(--ccb-red-bg-dull-normal, #fef2f2);
      border-color: var(--ccb-red-fg-normal, #ef4444);
    }
  }

  &__btn-add {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    border: none;
    border-radius: 8px;
    color: v-bind(accentColor);
    background: v-bind(containerColor);
    border: 1px solid v-bind(accentColor);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    i {
      font-size: 10px;
    }

    &:hover {
      background: var(--ccb-green-bg-dull-hover, #bbf7d0);
    }
  }
}
</style>
