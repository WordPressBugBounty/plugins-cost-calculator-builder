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
          v-if="booleanAttribute('multiselect')"
          label="Default Value"
          :items="optionItems"
          :modelValue="defaultValueList"
          @change="(_, value) => updateDefaultValue(value)"
        />
        <Dropdown
          v-else
          label="Default Value"
          :items="optionItems"
          :modelValue="defaultValue"
          @change="(_, value) => updateDefaultValue(value)"
        />
      </div>
      <div class="ccb-field-sidebar__item">
        <Toggle
          label="Multiselect"
          :modelValue="booleanAttribute('multiselect')"
          @change="
            (_, value) => updateAttribute('multiselect', value ? '1' : '0')
          "
          size="m"
          weight="medium"
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
import { Input, Toggle, MultiSelect, Dropdown } from "@/admin/shared/ui/UIKit";
import { useOrderFormFieldBindings } from "@/admin/features/builder/order-form/composables/useOrderFormFieldBindings";
import OrderFormOptionsEditor from "./OrderFormOptionsEditor.vue";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import { ORDER_FORM_FIELD_WIDTHS } from "@/admin/features/builder/calculator/CalculatorFieldsSettings/field-settings.constants";

const {
  stringAttribute,
  booleanAttribute,
  updateAttribute,
  fieldWidth,
  updateFieldWidth,
  optionItems,
  defaultValue,
  defaultValueList,
  updateDefaultValue,
} = useOrderFormFieldBindings();
</script>
