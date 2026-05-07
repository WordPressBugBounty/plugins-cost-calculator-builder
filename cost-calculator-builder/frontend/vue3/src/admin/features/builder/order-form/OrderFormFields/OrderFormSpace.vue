<template>
  <div class="ccb-order-form-field-editor">
    <div class="ccb-field-sidebar__body">
      <div class="ccb-field-sidebar__item">
        <Tab
          :items="ORDER_FORM_FIELD_WIDTHS"
          :modelValue="fieldWidth"
          title="Width (columns)"
          @change="(_, value) => updateFieldWidth(value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrderFormFieldBindings } from "@/admin/features/builder/order-form/composables/useOrderFormFieldBindings";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import { ORDER_FORM_FIELD_WIDTHS } from "@/admin/features/builder/calculator/CalculatorFieldsSettings/field-settings.constants";

const { fieldWidth, updateFieldWidth } = useOrderFormFieldBindings();
</script>
