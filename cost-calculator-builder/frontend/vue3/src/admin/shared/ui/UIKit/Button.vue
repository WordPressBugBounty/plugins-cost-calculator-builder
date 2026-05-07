<template>
  <button class="ccb-button" :class="classes">
    <i :class="iconLeft" v-if="iconLeft"></i>
    <Text
      class="ccb-button__label"
      v-if="label"
      :text="label"
      :size="textSize ? textSize : 'm'"
      :weight="textWeight ? textWeight : 'medium'"
      :showOriginal="showOriginal"
    />
    <i :class="iconRight" v-if="iconRight"></i>
    <span class="ccb-button__counter" v-if="counter">{{ counter }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import Text from "@/admin/shared/ui/UIKit/Text.vue";
import { IButton } from "@/admin/shared/types/uikit.type";

const props = defineProps<IButton>();

const {
  label,
  size,
  type,
  iconLeft,
  iconRight,
  counter,
  active,
  disabled,
  textSize,
  textWeight,
  showOriginal,
} = toRefs(props);

const classes = computed(() => {
  return [
    `ccb-button-${size.value}`,
    `ccb-text-${size.value}`,
    `ccb-button-${type.value ? type.value : "inherit"}`,
    active.value ? "ccb-button-active" : "",
    disabled.value ? "ccb-button-disabled" : "",
  ];
});
</script>

<style lang="scss" scoped>
.ccb-button {
  border: none;
  cursor: pointer;
  background-color: transparent;
  border-radius: 99px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: var(--ccb-transition-normal);
  color: var(--ccb-font-labels);
  height: 40px;
  white-space: nowrap;
  border: 1px solid transparent;

  column-gap: 8px;

  &.ccb-button-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  &.ccb-button-active {
    border-color: var(--ccb-green-bg-normal);
    color: var(--ccb-green-bg-normal);
  }

  i {
    font-size: 16px;
  }

  &:hover {
    border-color: var(--ccb-border-hover);
  }
}

.ccb-button-inherit {
  border: 1px solid var(--ccb-border-normal);
}

.ccb-button-default {
  border-color: transparent;
  background-color: var(--ccb-bw-dull-normal);
  color: var(--ccb-button-bw-normal);
  &:hover {
    border-color: transparent;
    color: var(--ccb-button-bw-hover);
    background-color: var(--ccb-bw-dull-hover);
  }
}

.ccb-button-black {
  background-color: #2d2d2d;
  color: var(--ccb-w-normal);
  &:hover {
    background-color: var(--ccb-bw-hover);
    color: var(--ccb-w-hover);
  }
}

.ccb-button-red-ghost {
  background-color: var(--ccb-red-bg-dull-normal);
  color: var(--ccb-red-bg-normal);

  &:hover {
    background-color: var(--ccb-red-bg-dull-hover);
  }
}

.ccb-button-red {
  background-color: var(--ccb-red-bg-normal);
  color: var(--ccb-wb-normal);

  &:hover {
    background-color: var(--ccb-red-bg-dull-hover);
    border: 1px solid var(--ccb-red-bg-normal);
    color: var(--ccb-red-bg-normal);
  }
}

.ccb-button-yellow-ghost {
  background-color: var(--ccb-yellow-bg-dull-normal);
  color: var(--ccb-yellow-fg-normal);
}

.ccb-button-green-ghost {
  color: var(--ccb-green-fg-normal);
  background-color: var(--ccb-green-bg-dull-normal);

  &:hover {
    background-color: var(--ccb-green-bg-dull-hover);
    color: var(--ccb-green-fg-hover);
  }
}

.ccb-button-error {
  background-color: var(--ccb-button-red);
  color: #ffffffcc;
}

.ccb-button-warning {
  background-color: var(--ccb-button-orange-bg-normal);
  color: #ffffffcc;
}

.ccb-button-primary {
  background-color: var(--ccb-button-green-bg-normal);
  color: #ffffffcc;
}

.ccb-button-blue {
  background-color: var(--ccb-blue-bg-normal);
  color: var(--ccb-button-w-normal);

  &:hover {
    background-color: var(--ccb-blue-bg-hover);
    color: var(--ccb-button-w-hover);
  }
}

.ccb-button-dark-blue {
  background-color: var(--ccb-ultra-bg-normal);
  color: var(--ccb-button-w-normal);

  &:hover {
    background-color: var(--ccb-ultra-bg-normal-hover);
    color: var(--ccb-button-w-hover);
  }
}

.ccb-button-green {
  background-color: var(--ccb-green-bg-normal);
  color: var(--ccb-button-w-normal);
  border-color: transparent;

  &:hover {
    background-color: var(--ccb-green-bg-hover);
    color: var(--ccb-button-w-hover);
  }
}

.ccb-button-blue-ghost {
  background-color: var(--ccb-blue-bg-dull-normal);
  color: var(--ccb-blue-fg-normal);

  &:hover {
    background-color: var(--ccb-blue-bg-dull-hover);
    color: var(--ccb-blue-fg-hover);
  }
}

.ccb-button-xl,
.ccb-button-l {
  padding: 12px 24px;
}

.ccb-button-m {
  padding: 10px 16px;
  gap: 8px;
}

.ccb-button-s {
  padding: 8px 12px;
}

.ccb-button-xs {
  padding: 4px 8px;
  gap: 4px;
}

.ccb-custom-btn {
  height: 24px;
  padding: 0 8px;
}

.ccb-normal-btn {
  height: 32px;
  padding: 0 16px;
}

.ccb-appearance-preset-btn {
  height: 20px;
  padding: 0 8px;
  min-height: unset !important;
}
</style>
