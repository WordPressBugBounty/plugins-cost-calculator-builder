<template>
  <div class="ccb-order-form-edit-field-sidebar-container">
    <div class="ccb-order-form-edit-field-sidebar ccb-sidebar">
      <div class="ccb-order-form-edit-field-sidebar__back" @click="goBack">
        <i class="ccb-icon-ic_back"></i>
        <Text text="Back to Fields" size="s" weight="medium" />
      </div>
      <div class="ccb-order-form-edit-field-sidebar__header">
        <Text text="Edit Field" size="mx" weight="bold" />
      </div>
      <div class="ccb-order-form-edit-field-sidebar__body">
        <component :is="activeEditorComponent" v-if="activeEditorComponent" />
        <Text
          v-else
          text="No editor available for this field type."
          size="s"
          weight="regular"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { Text } from "@/admin/shared/ui/UIKit";
import { useOrderFormFieldBindings } from "@/admin/features/builder/order-form/composables/useOrderFormFieldBindings";
import "@/styles/admin/builder/sidebar.scss";
const { selectedField, closeSelectedField } = useOrderFormFieldBindings();

const goBack = () => {
  closeSelectedField();
};

const fieldEditors = {
  name: defineAsyncComponent(
    () => import("./OrderFormFields/OrderFormName.vue"),
  ),
  email: defineAsyncComponent(
    () => import("./OrderFormFields/OrderFormEmail.vue"),
  ),
  phone: defineAsyncComponent(
    () => import("./OrderFormFields/OrderFormPhone.vue"),
  ),
  textarea: defineAsyncComponent(
    () => import("./OrderFormFields/OrderFormTextarea.vue"),
  ),
  number: defineAsyncComponent(
    () => import("./OrderFormFields/OrderFormNumber.vue"),
  ),
  dropdown: defineAsyncComponent(
    () => import("./OrderFormFields/OrderFormDropdown.vue"),
  ),
  radio: defineAsyncComponent(
    () => import("./OrderFormFields/OrderFormRadio.vue"),
  ),
  checkbox: defineAsyncComponent(
    () => import("./OrderFormFields/OrderFormCheckbox.vue"),
  ),
  "formatted-text": defineAsyncComponent(
    () => import("./OrderFormFields/OrderFormFormattedText.vue"),
  ),
  "input-textbox": defineAsyncComponent(
    () => import("./OrderFormFields/OrderFormInputTextbox.vue"),
  ),
  "date-picker": defineAsyncComponent(
    () => import("./OrderFormFields/OrderFormDatePicker.vue"),
  ),
  "time-picker": defineAsyncComponent(
    () => import("./OrderFormFields/OrderFormTimePicker.vue"),
  ),
  space: defineAsyncComponent(
    () => import("./OrderFormFields/OrderFormSpace.vue"),
  ),
} as const;

const activeEditorComponent = computed(() => {
  const type = selectedField.value?.type;
  if (!type) return null;
  return fieldEditors[type as keyof typeof fieldEditors] || null;
});
</script>

<style scoped lang="scss">
.ccb-order-form-edit-field-sidebar-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.ccb-order-form-edit-field-sidebar {
  width: 100%;
  border-radius: 16px;
  background: var(--ccb-bgr-sidebar);
  padding: 24px 16px;
  color: var(--ccb-font-labels);

  &__back {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: var(--ccb-font-comment);
    padding-bottom: 20px;
    transition: color 0.15s ease;

    i {
      font-size: 14px;
    }

    &:hover {
      color: var(--ccb-font-title);
    }
  }

  &__header {
    color: var(--ccb-font-labels);
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__body {
    padding-top: 16px;
  }
}
</style>
