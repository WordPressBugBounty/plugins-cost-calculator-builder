<template>
  <div class="ccb-order-form-content ccb-custom-scrollbar">
    <div class="ccb-order-form-content__header">
      <div class="ccb-order-form-content__header-title">
        <template v-if="!isEditingFormName">
          <Text
            v-if="activeForm"
            :text="activeForm.name"
            size="lx"
            weight="bold"
          />
          <i class="ccb-icon-ic_edit" @click="startEditFormName"></i>
        </template>
        <div v-else class="ccb-order-form-content__header-editor" @click.stop>
          <input
            :ref="setFormNameInputRef"
            v-model="editableFormName"
            type="text"
            class="ccb-order-form-content__header-editor-input"
            @keyup.enter="saveFormName"
            @keyup.esc="cancelEditFormName"
          />
          <Button
            label="Update"
            size="xs"
            type="blue"
            textSize="xs"
            textWeight="regular"
            @click="saveFormName"
          />
          <Button
            label="Cancel"
            size="xs"
            type="blue-ghost"
            textSize="xs"
            textWeight="regular"
            @click="cancelEditFormName"
          />
        </div>
      </div>
      <div class="ccb-order-form-content__header-actions">
        <Button
          label="Discard"
          size="s"
          type="default"
          textSize="s"
          textWeight="regular"
          class="ccb-normal-btn"
          :disabled="!isDirty"
          @click="discardFormChanges"
        />
        <Button
          label="Apply"
          size="s"
          type="blue-ghost"
          textSize="s"
          textWeight="regular"
          class="ccb-normal-btn"
          :disabled="!isDirty"
          @click="applyFormChanges"
        />
      </div>
    </div>

    <div
      v-if="isEditingFormName"
      class="ccb-order-form-content__overlay"
      @click="cancelEditFormName"
    ></div>

    <div
      class="ccb-order-form-content__body"
      ref="fieldListRef"
      :class="{
        'ccb-order-form-content__body--drag-empty':
          dragOverIndex !== null && !fields.length,
      }"
      @dragenter="onBodyDragEnter"
      @dragleave="onBodyDragLeave"
      @dragover.prevent
      @drop="onRawFieldDrop"
    >
      <VueDraggable
        :modelValue="fields"
        @update:modelValue="onFieldsReorder"
        :animation="200"
        handle=".ccb-order-form-field__handle"
        ghostClass="ccb-order-form-field--ghost"
        class="ccb-order-form-content__list"
      >
        <div
          class="ccb-order-form-field"
          :class="{
            'ccb-order-form-field--selected': isSelected(field),
            'ccb-order-form-field--drop-after': dragOverIndex === index,
            'ccb-order-form-field--resizing':
              resizingFieldId ===
              (field.id !== undefined ? field.id : field.tempId),
          }"
          :style="{ gridColumn: 'span ' + (field.field_width || 12) }"
          v-for="(field, index) in fields"
          :key="field.id || field.tempId"
          @click="selectField(field)"
          @dragenter.stop="onFieldDragEnter(index, $event)"
          @dragover.prevent
          @drop.stop="onRawFieldDropAfter(index, $event)"
        >
          <component :is="getPreviewComponent(field.type)" :field="field" />
          <div class="ccb-order-form-field__toolbar">
            <div class="ccb-order-form-field__handle">
              <i class="ccb-icon-ic_drag"></i>
            </div>
            <div class="ccb-order-form-field__actions">
              <i
                class="ccb-icon-ic_duplicate"
                @click.stop="duplicateField(field)"
              ></i>
              <i
                class="ccb-icon-ic_delete"
                @click.stop="deleteField(field)"
              ></i>
            </div>
          </div>
          <div
            class="ccb-order-form-field__resize-handle"
            @mousedown.stop="onResizeStart($event, field)"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </VueDraggable>
      <div class="ccb-order-form-content__empty" v-if="!fields.length">
        <Text
          text="Add fields from the sidebar to begin."
          size="m"
          weight="regular"
        />
      </div>

      <div class="ccb-order-form-content__submit" v-if="fields.length">
        <button class="ccb-order-form-content__submit-btn" disabled>
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { defineAsyncComponent } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { Button, Text } from "@/admin/shared/ui/UIKit";
import { useOrderFormContent } from "@/admin/features/builder/order-form/composables/useOrderFormContent";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const fieldPreviews: Record<string, Component> = {
  name: defineAsyncComponent(() => import("./components/FieldPreviewName.vue")),
  email: defineAsyncComponent(
    () => import("./components/FieldPreviewEmail.vue"),
  ),
  phone: defineAsyncComponent(
    () => import("./components/FieldPreviewPhone.vue"),
  ),
  "input-textbox": defineAsyncComponent(
    () => import("./components/FieldPreviewInputTextbox.vue"),
  ),
  textarea: defineAsyncComponent(
    () => import("./components/FieldPreviewTextarea.vue"),
  ),
  number: defineAsyncComponent(
    () => import("./components/FieldPreviewNumber.vue"),
  ),
  dropdown: defineAsyncComponent(
    () => import("./components/FieldPreviewDropdown.vue"),
  ),
  radio: defineAsyncComponent(
    () => import("./components/FieldPreviewRadio.vue"),
  ),
  checkbox: defineAsyncComponent(
    () => import("./components/FieldPreviewCheckbox.vue"),
  ),
  "time-picker": defineAsyncComponent(
    () => import("./components/FieldPreviewTimePicker.vue"),
  ),
  "date-picker": defineAsyncComponent(
    () => import("./components/FieldPreviewDatePicker.vue"),
  ),
  "formatted-text": defineAsyncComponent(
    () => import("./components/FieldPreviewFormattedText.vue"),
  ),
  space: defineAsyncComponent(
    () => import("./components/FieldPreviewSpace.vue"),
  ),
};

const getPreviewComponent = (type: string): Component | null => {
  return fieldPreviews[type] || null;
};

const { containerColor, formFieldsColor, textColor, borderColor } =
  useAppearanceColors();

const {
  activeForm,
  fields,
  isDirty,
  isEditingFormName,
  editableFormName,
  dragOverIndex,
  fieldListRef,
  resizingFieldId,
  setFormNameInputRef,
  startEditFormName,
  cancelEditFormName,
  saveFormName,
  applyFormChanges,
  discardFormChanges,
  onRawFieldDrop,
  onRawFieldDropAfter,
  onFieldDragEnter,
  onBodyDragEnter,
  onBodyDragLeave,
  onFieldsReorder,
  selectField,
  isSelected,
  duplicateField,
  deleteField,
  onResizeStart,
} = useOrderFormContent();
</script>

<style lang="scss">
.ccb-order-form-content {
  width: 100%;
  height: calc(100vh - 200px);
  border-radius: 16px;
  overflow-y: auto;
  padding: 0px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;

  &__header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    height: 64px;

    &-title {
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
      z-index: 3;
      color: var(--ccb-font-labels);
    }

    &-editor {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--ccb-bgr-sidebar);
      padding: 8px;
      border-radius: 10px;
      border: 1px solid var(--ccb-border-normal);
      min-width: 360px;

      &-input {
        flex: 1;
        min-width: 180px;
        height: 32px;
        border: 1px solid var(--ccb-border-normal);
        border-radius: 8px;
        padding: 0 10px;
        color: var(--ccb-font-title);
        background: #ffffff;
        outline: none;

        &:focus {
          border-color: var(--ccb-blue-bg-normal);
        }
      }
    }

    &-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    i {
      font-size: 16px;
      color: var(--ccb-font-comment);
      cursor: pointer;
      transition: var(--ccb-transition-normal);

      &:hover {
        color: var(--ccb-font-title);
      }
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: transparent;
  }

  &__body {
    flex: 1;
    border-radius: 16px;
    background: v-bind(containerColor);
    padding: 24px;
    padding-top: 40px;
    position: relative;

    &--drag-empty {
      .ccb-order-form-content__empty {
        border: 2px dashed var(--ccb-blue-bg-normal);
        border-radius: 12px;
        background: var(--ccb-blue-bg-dull-normal, rgba(0, 122, 198, 0.04));
        color: var(--ccb-blue-bg-normal);
      }
    }
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 32px 16px;
  }

  &__empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ccb-font-comment);
  }

  &__submit {
    padding: 8px 16px;

    &-btn {
      background: var(--ccb-green-bg-normal, #008f3c);
      color: rgba(255, 255, 255, 0.8);
      border: none;
      border-radius: 99px;
      height: 40px;
      width: 120px;
      font-size: 16px;
      font-weight: 500;
      cursor: default;
    }
  }
}

.ccb-order-form-field {
  position: relative;
  cursor: pointer;
  transition: var(--ccb-transition-normal);
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 8px;

  &__toolbar {
    position: absolute;
    top: -32px;
    right: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    height: 28px;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  &__handle {
    cursor: grab;
    color: var(--ccb-font-comment);
    user-select: none;
    letter-spacing: -2px;
    font-size: 16px;
    display: flex;
    align-items: center;
    width: 16px;
    height: 16px;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--ccb-font-title, rgba(0, 0, 0, 0.8));
    border-radius: 99px;
    height: 28px;
    padding: 0 16px;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);

    i {
      color: #ffffff;
      font-size: 14px;
      cursor: pointer;
      transition: opacity 0.15s ease;

      &:hover {
        opacity: 0.7;
      }
    }
  }

  &__resize-handle {
    position: absolute;
    top: 50%;
    right: -4px;
    transform: translateY(-50%);
    width: 8px;
    height: 32px;
    cursor: col-resize;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 10;
    background: var(--ccb-blue-bg-normal);
    color: #fff;
    border-radius: 4px;

    span {
      width: 2px;
      height: 2px;
      background: #fff;
    }
  }

  &--ghost {
    opacity: 0.4;
  }

  &--drop-after {
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: -17px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--ccb-blue-bg-normal);
      border-radius: 2px;
      z-index: 10;
      pointer-events: none;
    }
  }

  &:hover {
    border-color: var(--ccb-blue-bg-normal);
    border-style: dashed;
    background: var(--ccb-blue-bg-dull-normal, rgba(0, 122, 198, 0.03));

    .ccb-order-form-field__toolbar {
      opacity: 1;
    }

    .ccb-order-form-field__resize-handle {
      opacity: 1;
    }
  }

  &--selected {
    border-color: var(--ccb-blue-bg-normal);
    border-style: dashed;
    background: var(--ccb-blue-bg-dull-normal, rgba(0, 122, 198, 0.03));

    .ccb-order-form-field__toolbar {
      opacity: 1;
    }

    .ccb-order-form-field__resize-handle {
      opacity: 1;
    }
  }

  &:hover {
    .ccb-order-form-field__toolbar {
      opacity: 1;
    }

    .ccb-order-form-field__resize-handle {
      opacity: 1;
    }
  }

  &--resizing {
    .ccb-order-form-field__resize-handle {
      opacity: 1;
    }

    cursor: col-resize;
  }
}

.ccb-field-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: var(--ccb-font-labels);
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: v-bind(textColor);
  }

  &__required {
    color: #e74c3c;
    margin-left: 2px;
  }

  &__badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--ccb-font-comment, #888);

    &-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--ccb-font-title, #1a1a1a);
      display: inline-block;
    }
  }

  &__input {
    width: 100%;
    height: 40px;
    border: 1px solid v-bind(borderColor) !important;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 14px;
    color: v-bind(textColor) !important;
    background: v-bind(formFieldsColor) !important;
    outline: none;

    &::placeholder {
      color: var(--ccb-font-comment, #aaa);
    }
  }
}
</style>
