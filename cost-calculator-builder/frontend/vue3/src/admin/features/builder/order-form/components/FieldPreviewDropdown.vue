<template>
  <div class="ccb-field-preview">
    <label class="ccb-field-preview__label">
      {{ field.attributes?.label || "Dropdown" }}
      <span
        v-if="field.attributes?.required === '1'"
        class="ccb-field-preview__required"
        >*</span
      >
    </label>
    <div class="ccb-field-preview__dropdown">
      <div class="ccb-field-preview__select">
        <span class="ccb-field-preview__select-placeholder">
          {{ String(field.attributes?.placeholder || "Select option") }}
        </span>
        <i class="ccb-icon-ic_arrow_down ccb-field-preview__dropdown-arrow"></i>
      </div>
      <div v-if="false" class="ccb-field-preview__dropdown-menu">
        <div
          v-for="(option, index) in options"
          :key="index"
          class="ccb-field-preview__dropdown-item"
          :class="{ 'ccb-field-preview__dropdown-item--first': index === 0 }"
        >
          {{ option.optionText || `Option ${index + 1}` }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type {
  IOrderFormBuilderField,
  IOrderFormFieldOption,
} from "@/admin/shared/types/order-form.type";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const { formFieldsColor, textColor, borderColor } = useAppearanceColors();

const props = defineProps<{ field: IOrderFormBuilderField }>();

const options = computed<IOrderFormFieldOption[]>(() => {
  const opts = props.field.attributes?.options;
  return Array.isArray(opts) ? (opts as IOrderFormFieldOption[]) : [];
});
</script>

<style scoped lang="scss">
.ccb-field-preview {
  &__dropdown {
    position: relative;
    width: 100%;
  }

  &__dropdown-arrow {
    transition: transform 0.2s ease;
  }

  &__dropdown-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: v-bind(formFieldsColor);
    border: 1px solid v-bind(borderColor);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    z-index: 10;
    overflow: hidden;
  }

  &__dropdown-item {
    padding: 9px 12px;
    font-size: 14px;
    color: v-bind(textColor);
    cursor: default;
    border-top: 1px solid v-bind(borderColor);

    &--first {
      border-top: none;
      background: var(--ccb-bgr-sidebar, #f9f9fb);
      color: var(--ccb-font-title, #1a1a1a);
      font-weight: 500;
    }
  }

  &__select {
    width: 100%;
    height: 40px;
    border: 1px solid v-bind(borderColor);
    border-radius: 8px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: v-bind(formFieldsColor);
    cursor: default;

    &-placeholder {
      font-size: 14px;
      color: var(--ccb-font-comment, #aaa);
    }

    i {
      font-size: 12px;
      color: var(--ccb-font-comment, #aaa);
    }
  }
}
</style>
