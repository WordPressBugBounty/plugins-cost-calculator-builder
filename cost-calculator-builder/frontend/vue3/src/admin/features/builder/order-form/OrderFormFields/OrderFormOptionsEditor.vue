<template>
  <div class="ccb-of-options">
    <transition-group
      name="of-option-row"
      tag="div"
      class="ccb-of-options__list"
    >
      <div
        v-for="(option, index) in optionsList"
        :key="`option_${index}`"
        class="ccb-of-options__row"
        :class="{
          'is-dragging': isDragging && index === draggedIndex,
          'is-drop-before': isDragging && dropTarget === index,
          'is-drop-after': isDragging && dropTarget === index + 1,
        }"
        @dragover.prevent="onDragOver(index, $event)"
        @drop.prevent="onDrop"
      >
        <button
          class="ccb-of-options__drag"
          type="button"
          tabindex="-1"
          draggable="true"
          :aria-label="translations.dragOption"
          @dragstart="onDragStart(index, $event)"
          @dragend="onDragEnd"
        >
          <i class="ccb-icon-drag-dots"></i>
        </button>

        <div class="ccb-of-options__input-wrap">
          <input
            class="ccb-of-options__input"
            type="text"
            :placeholder="'Option ' + (index + 1)"
            :value="option.optionText"
            @input="
              (e) => updateOption(index, (e.target as HTMLInputElement).value)
            "
          />
        </div>

        <button
          class="ccb-of-options__remove"
          type="button"
          :aria-label="translations.removeOption"
          @click="removeOption(index)"
        >
          <i class="ccb-icon-close-x"></i>
        </button>
      </div>
    </transition-group>

    <Button
      label="Add Option"
      type="green-ghost"
      size="xs"
      iconLeft="ccb-icon-ic_plus_big"
      @click="addOption"
      style="width: 124px"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Button } from "@/admin/shared/ui/UIKit";
import { useOrderFormFieldBindings } from "@/admin/features/builder/order-form/composables/useOrderFormFieldBindings";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";

const { optionsList, updateOption, removeOption, addOption, reorderOptions } =
  useOrderFormFieldBindings();
const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);

const isDragging = ref(false);
const draggedIndex = ref<number | null>(null);
const dropTarget = ref<number | null>(null);

const onDragStart = (index: number, event: DragEvent) => {
  isDragging.value = true;
  draggedIndex.value = index;
  dropTarget.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  }
};

const onDragOver = (index: number, event: DragEvent) => {
  if (draggedIndex.value === null) return;
  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const isAfterHalf = event.clientY > rect.top + rect.height / 2;
  let next = index + (isAfterHalf ? 1 : 0);
  next = Math.max(0, Math.min(next, optionsList.value.length));
  dropTarget.value = next;
};

const onDragEnd = () => {
  isDragging.value = false;
  dropTarget.value = null;
  draggedIndex.value = null;
};

const onDrop = () => {
  if (draggedIndex.value !== null && dropTarget.value !== null) {
    const from = draggedIndex.value;
    let to = dropTarget.value;
    if (to > from) to -= 1;
    if (to !== from) reorderOptions(from, to);
  }
  isDragging.value = false;
  dropTarget.value = null;
  draggedIndex.value = null;
};
</script>

<style scoped lang="scss">
.ccb-of-options {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px 4px 4px;
    background: var(--ccb-blue-bg-dull-disabled);
    border-radius: 12px;
    min-height: 48px;
    transition: var(--ccb-transition-normal);

    &.is-dragging {
      opacity: 0.8;
      transform: scale(0.99);
    }

    &.is-drop-before {
      box-shadow: inset 0 2px 0 var(--ccb-blue-bg-normal);
    }

    &.is-drop-after {
      box-shadow: inset 0 -2px 0 var(--ccb-blue-bg-normal);
    }
  }

  &__drag {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    color: var(--ccb-font-comment);
    transition: var(--ccb-transition-normal);

    i {
      font-size: 16px;
    }

    &:active {
      cursor: grabbing;
    }

    &:hover {
      color: var(--ccb-font-labels);
    }
  }

  &__input-wrap {
    flex: 1;
    min-width: 0;
  }

  &__input {
    width: 100%;
    height: 40px;
    border: none;
    outline: none;
    background: var(--ccb-input-normal);
    border-radius: 10px;
    padding: 8px 12px;
    color: var(--ccb-font-labels);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.2;
    transition: var(--ccb-transition-normal);

    &::placeholder {
      color: var(--ccb-font-comment);
      font-weight: 400;
    }

    &:focus {
      outline: none;
      box-shadow: none;
    }
  }

  &__remove {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--ccb-font-comment);
    transition: var(--ccb-transition-normal);

    i {
      font-size: 11px;
    }

    &:hover {
      color: var(--ccb-red-bg-normal);
    }
  }
}

.of-option-row-move {
  transition: transform 200ms ease;
}

.of-option-row-enter-active,
.of-option-row-leave-active {
  transition: all 160ms ease;
}

.of-option-row-enter-from,
.of-option-row-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
