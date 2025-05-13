<template>
  <div
    class="ccb-field ccb-field-quantity"
    :class="{
      required: isRequired,
      'ccb-field-disabled': field.disabled,
      [field.additionalStyles || '']: !!field.additionalStyles,
    }"
  >
    <div class="ccb-field__label">
      <div v-if="isRequired" class="ccb-required-tooltip">
        <RequiredHint
          v-if="requiredType === 'value_range'"
          :field="field"
          :text="getRangeRequiredText"
        />
        <RequiredHint
          v-else
          :field="field"
          :text="translationsStore.getTranslations.requiredField"
        />
      </div>
      <div class="ccb-field__title">
        <span>{{ field.label }}</span>
        <span v-if="field.required" class="ccb-field-required-mark">*</span>
      </div>
    </div>

    <div
      v-if="appearanceStore.getAppearanceDescriptionPosition === 'before'"
      class="ccb-field__descriptions ccb-before"
    >
      <div v-if="!field.hideMinMax" class="ccb-field__description">
        {{ translationsStore.getTranslations.min }}: {{ field.min }} -
        {{ translationsStore.getTranslations.max }}: {{ field.max }}
      </div>
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>

    <div class="ccb-field__input-wrapper">
      <input
        type="text"
        :value="formattedValue"
        :placeholder="field.placeholder"
        @input="onInput"
        @focus="onFocus"
        @focusout="parseField"
        @blur="onBlur"
        @keypress="intValueFilter"
      />
      <div class="ccb-input-counter up" @click="increment">
        <i class="ccb-icon-Path-3486"></i>
      </div>
      <div class="ccb-input-counter down" @click="decrement">
        <i class="ccb-icon-Path-3485"></i>
      </div>
    </div>

    <div
      v-if="appearanceStore.getAppearanceDescriptionPosition === 'after'"
      class="ccb-field__descriptions ccb-after"
    >
      <div v-if="!field.hideMinMax" class="ccb-field__description">
        {{ translationsStore.getTranslations.min }}: {{ field.min }} -
        {{ translationsStore.getTranslations.max }}: {{ field.max }}
      </div>
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed, ref } from "vue";
import { IQuantityField } from "@/widget/shared/types/fields";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";
import { useConditionsStore } from "@/widget/app/providers/stores/conditionsStore.ts";
import { useCurrency } from "@/widget/actions/fields/composable/useCurrency.ts";
import { useSingleField } from "@/widget/actions/fields/composable/useSingleField.ts";
import { useCallbackStore } from "@/widget/app/providers/stores/callbackStore.ts";
import RequiredHint from "@/widget/shared/ui/components/Required-hint/RequiredHint.vue";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { isFloat } from "@/widget/shared/utils/is-float.utils";
import { usePageConditions } from "@/widget/actions/conditions/composable/usePageConditions.ts";
import { useFields } from "@/widget/actions/fields/composable/useFields.ts";

type Props = {
  field: IQuantityField;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const requiredType = ref<string>("required");

const callbackStore = useCallbackStore();
const currencyInstance = useCurrency();
const appearanceStore = useAppearanceStore();
const fieldStore = useFieldsStore();
const conditionsStore = useConditionsStore();
const singleFieldMixins = useSingleField();
const translationsStore = useTranslationsStore();

const fieldsInstance = useFields();
const pageConditions = usePageConditions();

const rawInput = ref<string>(field.value.value.toString());
const isEditing = ref<boolean>(false);

const formattedValue = computed(() => {
  if (isEditing.value) return rawInput.value;

  rawInput.value = parseFormattedValue(rawInput.value).toString();

  let value = field.value.round ? Math.round(+rawInput.value) : +rawInput.value;

  return parseQuantityValue(value.toString());
});

const updateValue = (
  updateWithValue = false,
  numericValue: number,
  alias?: string,
) => {
  if (alias && alias !== field.value.alias) {
    return;
  }

  rawInput.value = numericValue.toString();
  checkMinMaxRequired();

  if (updateWithValue && typeof numericValue !== "undefined") {
    field.value.value = numericValue;
  }

  if (field.value.multiply) {
    field.value.value = field.value.value * field.value.unit;
  }

  field.value.displayValue = singleFieldMixins.getCommonFieldDisplayView(
    field.value,
    rawInput.value,
  );

  fieldStore.updateField(field.value.alias, field.value);
  conditionsStore.applyConditionForField(field.value.alias);
  if (
    fieldsInstance.getPageBreakEnabled() &&
    fieldsInstance.getActivePage().action === "not_skip"
  ) {
    pageConditions.checkPageFieldsConditions();
  }
};

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;

  let value = field.value.round
    ? Math.round(parseFloat(target.value))
    : parseFloat(target.value);

  if (isNaN(value)) {
    return;
  }

  let numericValue = currencyInstance.parseCurrency(
    value.toString(),
    currencyInstance.getCurrencyOptions(field.value),
  );

  updateValue(true, numericValue);
};

const onFocus = (e: Event) => {
  const target = e.target as HTMLInputElement;
  isEditing.value = true;
  rawInput.value = target.value;
};

const onBlur = () => {
  isEditing.value = false;
};

const parseField = () => {
  rawInput.value = parseQuantityValue(rawInput.value);
};

const increment = () => {
  let newValue =
    Math.round((Number(rawInput.value) + Number(field.value.step)) * 100) / 100;

  updateValue(true, newValue);
};

const decrement = () => {
  let newValue =
    Math.round((Number(rawInput.value) - Number(field.value.step)) * 100) / 100;

  if (newValue < 0) {
    return;
  }

  updateValue(true, newValue);
};

const checkMinMaxRequired = () => {
  const lessThenExpected = Number(rawInput.value) < +field.value.min;
  const moreThenExpected = Number(rawInput.value) > +field.value.max;

  if (lessThenExpected || moreThenExpected) {
    requiredType.value = "value_range";
  } else {
    requiredType.value = "required";
  }
};

const toFixedCount = computed(() => {
  let count = 0;
  if (
    isFloat(field.value.defaultValue.toString()) ||
    isFloat(field.value.step.toString())
  ) {
    let toFixedCountDefault = field.value.defaultValue.toString().split(".")[1]
      ? field.value.defaultValue.toString().split(".")[1].length
      : 0;
    let toFixedCountStep = field.value.step.toString().split(".")[1]
      ? field.value.step.toString().split(".")[1].length
      : 0;
    count = Math.max(toFixedCountDefault, toFixedCountStep);
  }

  return count;
});

const parseQuantityValue = (value: number | string): string => {
  if (typeof value === "number" && value < 0) {
    value = 0;
  }

  value = value.toString().replace(",", ".");

  if (!field.value.enabledCurrencySettings) {
    const floatVal = parseFloat(value);
    return floatVal.toFixed(toFixedCount.value);
  }

  if (isNaN(Number(value)) || value.length === 0) {
    value = "0";
  }

  let numericValue = parseFloat(value);

  const settings = useSettingsStore();

  let numAfterInteger: number =
    settings.getCurrencySettings?.numAfterInteger || 0;

  let decimalSeparator: string =
    settings.getCurrencySettings?.decimalSeparator || ".";

  let thousandsSeparator: string =
    settings.getCurrencySettings?.thousandsSeparator || ",";

  if (field.value.fieldCurrency) {
    numAfterInteger = field.value?.fieldCurrencySettings?.numAfterInteger || 0;
    decimalSeparator =
      field.value?.fieldCurrencySettings?.decimalSeparator || ".";
    thousandsSeparator =
      field.value?.fieldCurrencySettings?.thousandsSeparator || ",";
  }

  if (numAfterInteger > 0) {
    numericValue = parseFloat(
      numericValue.toFixed(parseInt(numAfterInteger.toString())),
    );

    value = numericValue.toFixed(numAfterInteger);

    // Set decimal separator
    value = value.toString().replace(".", decimalSeparator);

    // Set thousand separator
    const parts = value.split(decimalSeparator);

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    value = parts.join(decimalSeparator);
  } else {
    value = numericValue
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  }

  return value;
};

const parseFormattedValue = (value: string) => {
  const settings = useSettingsStore();

  let numAfterInteger: number =
    settings.getCurrencySettings?.numAfterInteger || 0;

  let decimalSeparator: string =
    settings.getCurrencySettings?.decimalSeparator || ".";

  let thousandsSeparator: string =
    settings.getCurrencySettings?.thousandsSeparator || ",";

  if (field.value.fieldCurrency) {
    numAfterInteger = field.value?.fieldCurrencySettings?.numAfterInteger || 0;
    decimalSeparator =
      field.value?.fieldCurrencySettings?.decimalSeparator || ".";
    thousandsSeparator =
      field.value?.fieldCurrencySettings?.thousandsSeparator || ",";
  }

  let parts;
  if (value.includes(".") && value.includes(",")) {
    parts = value.split(decimalSeparator);
  } else if (value.includes(",")) {
    parts = value.split(",");
  } else if (value.includes(".")) {
    parts = value.split(".");
  } else {
    parts = [value];
  }

  parts[0] = parts[0].split(thousandsSeparator).join("");

  let sanitizedValue = parts.join(".");

  let result = parseFloat(sanitizedValue) || 0;

  if (numAfterInteger !== undefined) {
    let factor = Math.pow(10, numAfterInteger);
    result = Math.round(result * factor) / factor;
  }

  return result;
};

const intValueFilter = (event: KeyboardEvent): void => {
  const settings = useSettingsStore();

  let decimalSeparator: string =
    settings.getCurrencySettings?.decimalSeparator || ".";

  if (field.value.fieldCurrency) {
    decimalSeparator =
      field.value?.fieldCurrencySettings?.decimalSeparator || ".";
  }

  let keyCode = event.keyCode ? event.keyCode : event.which;
  let separatorCode = 46;
  if (decimalSeparator === ",") {
    separatorCode = 44;
  }

  if ((keyCode < 48 || keyCode > 57) && keyCode !== separatorCode) {
    // 46 is dot 44 is comma
    event.preventDefault();
  }
};

const isRequired = computed(() => {
  const lessThenExpected = Number(rawInput.value) < field.value.min;
  const moreThenExpected = Number(rawInput.value) > field.value.max;

  if (lessThenExpected || moreThenExpected) {
    return true;
  }

  return fieldStore.checkFieldRequired(field.value);
});

const getRangeRequiredText = computed(() => {
  return `
    ${translationsStore.getTranslations.valueMustBeBetween} ${field.value.min} ${translationsStore.getTranslations.and} ${field.value.max}
  `;
});

callbackStore.add("updateQuantity", updateValue);
</script>

<style lang="scss" scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
}
</style>
