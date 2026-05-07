<template>
  <div class="ccb-preset" :class="{ active, selected }" @click="emit('apply')">
    <div class="ccb-preset__wrapper">
      <div class="ccb-preset__colors">
        <div
          v-for="color in colors"
          :key="color"
          class="ccb-preset__color"
          :style="{ backgroundColor: color }"
        ></div>
      </div>
      <div class="ccb-preset__selected">
        <i class="ccb-icon-ic_check"></i>
      </div>
      <div class="ccb-preset__actions">
        <Button
          v-if="showUse"
          :label="actionLabel || (selected ? 'Applied' : 'Apply')"
          size="s"
          type="blue"
          textSize="xs"
          textWeight="regular"
          class="ccb-appearance-preset-btn"
          :disabled="!actionLabel && selected"
          @click.stop="emit('use')"
        />
        <div
          v-if="showDelete"
          class="ccb-preset__action delete"
          @click.stop="emit('delete')"
        >
          <i class="ccb-icon-ic_delete"></i>
        </div>
        <div
          v-if="showDuplicate"
          class="ccb-preset__action"
          @click.stop="emit('duplicate')"
        >
          <i class="ccb-icon-ic_duplicate"></i>
        </div>
        <div
          v-if="showEdit"
          class="ccb-preset__action"
          @click.stop="emit('edit')"
        >
          <i class="ccb-icon-ic_edit"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/admin/shared/ui/UIKit";

withDefaults(
  defineProps<{
    colors: string[];
    active?: boolean;
    selected?: boolean;
    showDelete?: boolean;
    showDuplicate?: boolean;
    showEdit?: boolean;
    showUse?: boolean;
    actionLabel?: string;
  }>(),
  {
    active: false,
    selected: false,
    showDelete: false,
    showDuplicate: false,
    showEdit: false,
    showUse: false,
    actionLabel: "",
  },
);

const emit = defineEmits<{
  (event: "apply"): void;
  (event: "use"): void;
  (event: "delete"): void;
  (event: "duplicate"): void;
  (event: "edit"): void;
}>();
</script>

<style scoped lang="scss">
.ccb-preset {
  width: 100%;
  cursor: pointer;

  &__wrapper {
    width: 100%;
    padding: 10px 16px;
    border-radius: 12px;
    background-color: var(--ccb-input-normal);
    border: 1px solid var(--ccb-input-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__colors {
    display: flex;
  }

  &__color {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid var(--ccb-input-border);
    margin-left: -5px;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: var(--ccb-font-labels);
    gap: 12px;
    display: none;
  }

  &__apply-btn {
    :deep(.ccb-button) {
      min-width: 68px;
    }
  }

  &__action {
    font-size: 16px;

    &.delete {
      color: var(--ccb-red-bg-normal);
    }
  }

  &__selected {
    display: none;
  }

  &.active {
    .ccb-preset__wrapper {
      background-color: var(--ccb-blue-bg-dull-normal);
      border-color: var(--ccb-blue-bg-dull-normal);
    }
  }

  &.selected {
    .ccb-preset__selected {
      display: block;
    }
  }

  &__selected {
    font-size: 16px;
    color: var(--ccb-blue-fg-normal);
  }

  &:hover {
    .ccb-preset__actions {
      display: flex;
    }

    .ccb-preset__selected {
      display: none;
    }
  }
}
</style>
