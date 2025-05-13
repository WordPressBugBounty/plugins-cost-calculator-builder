<template>
  <div
    class="ccb-field ccb-range-field"
    :class="{
      required: isRequired,
      'ccb-field-disabled': field.disabled,
      [additionalClasses]: true,
    }"
  >
    <div class="ccb-field__label">
      <RequiredHint
        v-if="isRequired"
        :text="translationsStore.getTranslations.requiredField"
      />
      <div class="ccb-field__title">
        <span class="ccb-field__title--title-box">
          <span
            >{{ field.label
            }}<span v-if="field.required" class="ccb-field-required-mark"
              >*</span
            ></span
          >
          <span>
            {{ getSignValue }}
          </span>
        </span>
      </div>
    </div>

    <div
      v-if="appearanceStore.getAppearanceDescriptionPosition === 'before'"
      class="ccb-field__descriptions ccb-before"
    >
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>

    <div class="ccb-field-input__wrapper">
      <Slider
        style="margin: 10px 0"
        v-model="rawInput"
        :format="getFormatValue"
        :min="field.min"
        :max="field.max"
        :step="field.step"
        :disabled="field.disabled"
        @change="updateValue"
        show-tooltip="focus"
      ></Slider>
    </div>

    <div
      v-if="appearanceStore.getAppearanceDescriptionPosition === 'after'"
      class="ccb-field__descriptions ccb-after"
    >
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed, ref } from "vue";
import { IRangeField } from "@/widget/shared/types/fields";
import Slider from "@vueform/slider";

import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import { useConditionsStore } from "@/widget/app/providers/stores/conditionsStore.ts";
import { useSingleField } from "@/widget/actions/fields/composable/useSingleField.ts";
import { useCallbackStore } from "@/widget/app/providers/stores/callbackStore.ts";
import { useCurrency } from "@/widget/actions/fields/composable/useCurrency.ts";
import RequiredHint from "@/widget/shared/ui/components/Required-hint/RequiredHint.vue";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore";
import { useFields } from "@/widget/actions/fields/composable/useFields.ts";
import { usePageConditions } from "@/widget/actions/conditions/composable/usePageConditions.ts";

const fieldsInstance = useFields();
const pageConditions = usePageConditions();

type Props = {
  field: IRangeField;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const fieldStore = useFieldsStore();
const appearanceStore = useAppearanceStore();
const conditionsStore = useConditionsStore();
const singleFieldMixins = useSingleField();
const callbackStore = useCallbackStore();
const currencyInstance = useCurrency();
const translationsStore = useTranslationsStore();
const rawInput = ref<number>(field.value.value);

const updateValue = (value: number, alias?: string) => {
  if (alias && alias !== field.value.alias) {
    return;
  }

  rawInput.value = value;

  if (field.value.multiply) {
    value = value * field.value.unit;
  }

  field.value.value = field.value.round ? Math.round(value || 0) : value || 0;

  field.value.displayValue = singleFieldMixins.getCommonFieldDisplayView(
    field.value,
    rawInput.value.toString(),
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

const getSignValue = computed(() => {
  if (field.value.multipliedTotal) {
    return field.value.useCurrency || field.value.fieldCurrency
      ? currencyInstance.formatCurrency(
          field.value.value,
          currencyInstance.getCurrencyOptions(field.value),
        )
      : singleFieldMixins.parseCommonFieldSign(
          field.value.value.toString(),
          field.value.sign,
          field.value.unitPosition,
        );
  }

  if (field.value.useCurrency || field.value.fieldCurrency) {
    return field.value.displayValue;
  }

  if (field.value.unitPosition === "left") {
    return `${field.value.sign} ${rawInput.value}`;
  }

  return `${rawInput.value} ${field.value.sign}`;
});

const isRequired = computed(() => {
  return fieldStore.checkFieldRequired(field.value);
});

const additionalClasses = computed(() => {
  return field.value?.additionalStyles || "";
});

const getFormatValue = (num: number): string => {
  const rounded = num.toFixed(2);
  return parseFloat(rounded).toString();
};

callbackStore.add("updateRange", updateValue);
</script>

<style lang="scss">
.ccb-range-field {
  display: flex;
  flex-direction: column;

  .slider-base {
    background-color: var(--ccb-fields-border-color) !important;
  }

  .slider-tooltip,
  .slider-handle,
  .slider-connect {
    background-color: var(--ccb-accent-color) !important;
  }

  .slider-connects {
    cursor: pointer;
  }

  .slider-tooltip {
    color: var(--ccb-fields-color) !important;
    border-color: var(--ccb-accent-color) !important;
  }

  .slider-handle:focus {
    box-shadow: none !important;
  }
}

.ccb-field__title {
  &--title-box {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}

:root {
  --slider-tooltip-min-width: 30px;
  --slider-connect-bg: var(--ccb-accent-color);
  --slider-bg: var();
  --slider-tooltip-bg: var(--ccb-accent-color);
  --slider-tooltip-color: var(--ccb-fields-text-color);
}
</style>
