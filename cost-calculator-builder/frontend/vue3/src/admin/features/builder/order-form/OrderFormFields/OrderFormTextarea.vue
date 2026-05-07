<template>
  <div class="ccb-order-form-field-editor">
    <div class="ccb-field-sidebar__body">
      <div class="ccb-field-sidebar__item">
        <Toggle
          label="Make this field required"
          :modelValue="booleanAttribute('required')"
          @change="(_, value) => updateAttribute('required', value ? '1' : '0')"
          size="m"
          weight="medium"
        />
      </div>
      <div class="ccb-field-sidebar__item">
        <Input
          label="Label"
          placeholder="Enter label"
          :modelValue="stringAttribute('label')"
          @change="(_, value) => updateAttribute('label', String(value || ''))"
        />
      </div>
      <div class="ccb-field-sidebar__item">
        <Input
          label="Placeholder"
          placeholder="Enter placeholder"
          :modelValue="stringAttribute('placeholder')"
          @change="
            (_, value) => updateAttribute('placeholder', String(value || ''))
          "
        />
      </div>
      <div class="ccb-field-sidebar__item">
        <Input
          label="Character Limit"
          placeholder="400"
          :modelValue="numberAttribute('character_limit')"
          @change="
            (_, value) => updateAttribute('character_limit', Number(value || 0))
          "
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
import { Input, Toggle } from "@/admin/shared/ui/UIKit";
import { useOrderFormFieldBindings } from "@/admin/features/builder/order-form/composables/useOrderFormFieldBindings";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import { ORDER_FORM_FIELD_WIDTHS } from "@/admin/features/builder/calculator/CalculatorFieldsSettings/field-settings.constants";

const {
  stringAttribute,
  numberAttribute,
  booleanAttribute,
  updateAttribute,
  fieldWidth,
  updateFieldWidth,
} = useOrderFormFieldBindings();
</script>
