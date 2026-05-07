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
        <OrderFormOptionsEditor />
      </div>
      <div class="ccb-field-sidebar__item">
        <MultiSelect
          label="Default Value"
          :items="optionItems"
          :modelValue="defaultValueList"
          @change="(_, value) => updateDefaultValue(value)"
        />
      </div>
      <div class="ccb-field-sidebar__item">
        <Tab
          :items="ORDER_FORM_FIELD_WIDTHS"
          :modelValue="fieldWidth"
          @change="(_, value) => updateFieldWidth(value)"
        />
      </div>
      <div class="ccb-field-sidebar__item">
        <Tab
          title="Layout"
          :items="ORDER_FORM_BOX_STYLES"
          :modelValue="fieldBoxStyle"
          @change="
            (_, value) => updateAttribute('display', String(value || ''))
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input, Toggle, MultiSelect } from "@/admin/shared/ui/UIKit";
import { useOrderFormFieldBindings } from "@/admin/features/builder/order-form/composables/useOrderFormFieldBindings";
import OrderFormOptionsEditor from "./OrderFormOptionsEditor.vue";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import {
  ORDER_FORM_FIELD_WIDTHS,
  ORDER_FORM_BOX_STYLES,
} from "@/admin/features/builder/calculator/CalculatorFieldsSettings/field-settings.constants";

const {
  stringAttribute,
  booleanAttribute,
  updateAttribute,
  fieldWidth,
  updateFieldWidth,
  fieldBoxStyle,
  optionItems,
  defaultValueList,
  updateDefaultValue,
} = useOrderFormFieldBindings();
</script>
