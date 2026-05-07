<template>
  <div class="ccb-order-form-field-editor">
    <div class="ccb-field-sidebar__body">
      <div class="ccb-field-sidebar__item">
        <Input
          label="Title"
          placeholder="Enter title"
          :modelValue="stringAttribute('label')"
          @change="(_, value) => updateAttribute('label', String(value || ''))"
        />
      </div>
      <div class="ccb-field-sidebar__item">
        <RichTextEditor
          label="Text"
          placeholder="Type here..."
          :modelValue="stringAttribute('text')"
          @change="(_, value) => updateAttribute('text', String(value || ''))"
        />
      </div>
      <div class="ccb-field-sidebar__item">
        <Tab
          :items="ORDER_FORM_FIELD_WIDTHS"
          :modelValue="fieldWidth"
          @change="(_, value) => updateFieldWidth(value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from "@/admin/shared/ui/UIKit";
import RichTextEditor from "@/admin/shared/ui/UIKit/RichTextEditor.vue";
import { useOrderFormFieldBindings } from "@/admin/features/builder/order-form/composables/useOrderFormFieldBindings";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import { ORDER_FORM_FIELD_WIDTHS } from "@/admin/features/builder/calculator/CalculatorFieldsSettings/field-settings.constants";

const { stringAttribute, updateAttribute, fieldWidth, updateFieldWidth } =
  useOrderFormFieldBindings();
</script>
