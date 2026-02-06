<template>
  <div
    class="ccb-field ccb-field-quantity"
    :class="{
      required: isRequired,
      'ccb-field-disabled': field.disabled,
      [field.additionalStyles || '']: !!field.additionalStyles,
      'has-badge': !!getSavedAmount,
    }"
  >
    <div class="ccb-field__label">
      <div v-if="isRequired" class="ccb-required-tooltip">
        <RequiredHint
          v-if="requiredType === 'value_range'"
          :field="field"
          :text="getRangeRequiredText"
        />
        <RequiredHint v-else :field="field" :text="requiredWarningText" />
      </div>
      <div class="ccb-field__title">
        <span :id="labelId">{{ field.label }}</span>
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

    <component
      :is="getStyleComponent"
      :field="field"
      :value="formattedValue"
      :input-id="inputId"
      :aria-labelledby="labelId"
      @input="onInput"
      @focus="onFocus"
      @focusout="parseField"
      @blur="onBlur"
      @keypress="intValueFilter"
      :key="forceUpdateKey"
      @increment="onIncrement"
      @decrement="onDecrement"
    />

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
    <div
      class="ccb-field__badge"
      :class="field.badgeVariant"
      v-if="getSavedAmount && !field.multiply && !isRequired"
    >
      <div class="ccb-field__badge-content">
        <i
          class="ccb-icon-price-tag"
          v-if="field.badgeVariant === 'primary'"
        ></i>
        <div class="ccb-field__badge-text">{{ field.badgeText }}:</div>
        <div class="ccb-field__badge-value">
          {{ getSavedAmount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed, ref, onMounted, defineAsyncComponent } from "vue";
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
import { usePageBreakerStore } from "@/widget/app/providers/stores/pageBreakerStore.ts";

type Props = {
  field: IQuantityField;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const requiredType = ref<string>("required");
const inputId = computed(() => `ccb_quantity_${field.value.alias}`);
const labelId = computed(() => `ccb_label_${field.value.alias}`);

const callbackStore = useCallbackStore();
const currencyInstance = useCurrency();
const appearanceStore = useAppearanceStore();
const fieldStore = useFieldsStore();
const conditionsStore = useConditionsStore();
const singleFieldMixins = useSingleField();
const translationsStore = useTranslationsStore();
const pageBreakerStore = usePageBreakerStore();

const backupValue = ref<string>("");
const rawInput = ref<string>(field.value.originalValue.toString());
const isEditing = ref<boolean>(false);
const forceUpdateKey = ref<number>(0);

const requiredWarningText = computed(() => {
  const settingStore = useSettingsStore();
  return settingStore.getWarningTexts?.requiredMsg || "";
});

const formattedValue = computed(() => {
  if (isEditing.value) {
    return rawInput.value;
  }

  const numericString = backupValue.value.toString();
  let rawDisplay = numericString;

  if (field.value.enabledCurrencySettings || field.value.fieldCurrency) {
    const options = currencyInstance.getCurrencyOptions(field.value);
    const separator = options?.decimalSeparator || ".";

    if (separator !== "." && rawDisplay.includes(".")) {
      rawDisplay = rawDisplay.replace(".", separator);
    }
  }

  rawInput.value = rawDisplay;

  const numericValue = field.value.round
    ? Math.round(+numericString)
    : +numericString;

  return parseQuantityValue(numericValue.toString());
});

const getSavedAmount = computed(() => {
  const structure = field.value.pricingStructure;
  if (!structure || structure === "no_discounts") return "";
  const ranges = ((field.value as any).pricingRanges as any[]) || [];
  if (!ranges.length) return "";

  const qty = Number(rawInput.value) || 0;
  if (qty <= 0) return "";

  const highestUnit = Math.max(
    ...ranges.map((r: any) => Number(r.unitPrice) || 0),
    Number(field.value.unit) || 0,
  );
  const baseTotal = highestUnit * qty;

  let currentTotal = 0;
  if (structure === "tiered_discounts") {
    const matched = ranges.find((r: any) => {
      const min = Number(r.minQty) || 0;
      const max = Number(r.maxQty) || 0;
      return qty >= min && qty <= max;
    });
    const currentUnit = Number(matched?.unitPrice ?? field.value.unit) || 0;
    currentTotal = currentUnit * qty;
  } else if (structure === "cumulative_discounts") {
    const sorted = [...ranges].sort(
      (a: any, b: any) => (Number(a.minQty) || 0) - (Number(b.minQty) || 0),
    );
    let rest = qty;
    for (const r of sorted) {
      const rawMin = Number(r.minQty);
      const min = Number.isFinite(rawMin) ? rawMin : 0;
      const bracketStart = Math.max(1, min);
      const maxRaw = Number(r.maxQty);
      const max = Number.isFinite(maxRaw) && maxRaw > 0 ? maxRaw : Infinity;
      const span = isFinite(max) ? Math.max(0, max - bracketStart + 1) : rest;
      const take = Math.max(0, Math.min(rest, span));
      if (take > 0) {
        currentTotal += take * (Number(r.unitPrice) || 0);
        rest -= take;
      }
      if (rest <= 0) break;
    }
    if (rest > 0) currentTotal += rest * highestUnit;
  } else if (structure === "flat_rate_discounts") {
    const matched = ranges.find((r: any) => {
      const min = Number(r.minQty) || 0;
      const max = Number(r.maxQty) || 0;
      return qty >= min && qty <= max;
    });
    const fixedPrice = Number(matched?.unitPrice ?? field.value.unit) || 0;
    currentTotal = fixedPrice;
  }

  let saved = 0;
  let savedPercent = 0;
  if (structure === "flat_rate_discounts") {
    const matched = ranges.find((r: any) => {
      const min = Number(r.minQty) || 0;
      const max = Number(r.maxQty) || 0;
      return qty >= min && qty <= max;
    });
    const currentUnit = Number(matched?.unitPrice ?? field.value.unit) || 0;
    saved = Math.max(0, highestUnit - currentUnit);
    savedPercent =
      highestUnit > 0 ? Math.round((saved / highestUnit) * 100) : 0;
  } else {
    saved = Math.max(0, baseTotal - currentTotal);
    savedPercent = baseTotal > 0 ? Math.round((saved / baseTotal) * 100) : 0;
  }

  if (saved <= 0) return "";

  const options = currencyInstance.getCurrencyOptions(field.value);
  const savedCurrency = currencyInstance.formatCurrency(saved, options);

  const priceFormat = (field.value as any)?.badgeFormat || "$";
  if (priceFormat === "symbol") {
    return `${savedCurrency}`;
  }
  if (priceFormat === "percent") return `${savedPercent}%`;
  if (priceFormat === "symbol_and_percent") {
    return `${savedCurrency} (${savedPercent}%)`;
  }
  return "";
});

const getStyleComponent = computed(() => {
  if (field.value.styles.style === "default") {
    return defineAsyncComponent(() => import(`./styles/Default.vue`));
  }

  if (field.value.styles.style === "buttons") {
    return defineAsyncComponent(() => import(`./styles/Buttons.vue`));
  }
});

const updateValue = (
  updateWithValue = false,
  numericValue: number,
  alias?: string,
  fromCondition?: boolean,
) => {
  if (alias && alias !== field.value.alias) {
    return;
  }

  const numericString = numericValue.toString();

  if (!alias || fromCondition) {
    backupValue.value = numericString;
  }

  if (!isEditing.value && (!alias || fromCondition)) {
    const options = currencyInstance.getCurrencyOptions(field.value);
    let displayString = numericString;

    const separator = options?.decimalSeparator;

    if (
      (field.value.enabledCurrencySettings || field.value.fieldCurrency) &&
      separator &&
      separator !== "." &&
      displayString.includes(".")
    ) {
      displayString = displayString.replace(".", separator);
    }

    rawInput.value = displayString;
  }
  checkMinMaxRequired();

  if (updateWithValue && typeof numericValue !== "undefined") {
    field.value.value = numericValue;
    field.value.originalValue = numericValue;
  } else if (!alias) {
    field.value.originalValue = numericValue;
  }

  // Pricing structure calculation (mirrors Range.updateValue)
  const structure = (field.value as any).pricingStructure as
    | "tiered_discounts"
    | "cumulative_discounts"
    | "flat_rate_discounts"
    | "no_discounts"
    | undefined;
  const ranges = ((field.value as any).pricingRanges as any[]) || [];

  if (
    !field.value.multiply &&
    structure &&
    structure !== "no_discounts" &&
    Array.isArray(ranges) &&
    ranges.length > 0
  ) {
    const qty = Number(field.value.originalValue) || 0;
    let computed = 0;
    let breakdown: string[] = [];
    const options = currencyInstance.getCurrencyOptions(field.value);

    if (structure === "tiered_discounts") {
      const matched = ranges.find((r: any) => {
        const min = Number(r.minQty) || 0;
        const max = Number(r.maxQty) || 0;
        return qty >= min && qty <= max;
      });
      const unitPrice = Number(matched?.unitPrice ?? field.value.unit) || 0;
      computed = qty * unitPrice;
      if (qty > 0) {
        const left = singleFieldMixins.parseCommonFieldSign(
          qty.toString(),
          field.value.sign,
          field.value.unitPosition,
        );
        const right = currencyInstance.formatCurrency(unitPrice, options);
        breakdown.push(`${left} x ${right}`);
      }
    } else if (structure === "cumulative_discounts") {
      const sorted = [...ranges].sort(
        (a: any, b: any) => (Number(a.minQty) || 0) - (Number(b.minQty) || 0),
      );
      let rest = qty;
      for (const r of sorted) {
        const rawMin = Number(r.minQty);
        const min = Number.isFinite(rawMin) ? rawMin : 0;
        const bracketStart = Math.max(1, min);
        const maxRaw = Number(r.maxQty);
        const max = Number.isFinite(maxRaw) && maxRaw > 0 ? maxRaw : Infinity;
        const span = isFinite(max) ? Math.max(0, max - bracketStart + 1) : rest;
        const take = Math.max(0, Math.min(rest, span));
        if (take > 0) {
          const unitPrice = Number(r.unitPrice) || 0;
          computed += take * unitPrice;
          const left = singleFieldMixins.parseCommonFieldSign(
            take.toString(),
            field.value.sign,
            field.value.unitPosition,
          );
          const right = currencyInstance.formatCurrency(unitPrice, options);
          breakdown.push(`${left} x ${right}`);
          rest -= take;
        }
        if (rest <= 0) break;
      }
      if (rest > 0) {
        const unitPrice = Number(field.value.unit) || 0;
        computed += rest * unitPrice;
        const left = singleFieldMixins.parseCommonFieldSign(
          rest.toString(),
          field.value.sign,
          field.value.unitPosition,
        );
        const right = currencyInstance.formatCurrency(unitPrice, options);
        breakdown.push(`${left} x ${right}`);
      }
    } else if (structure === "flat_rate_discounts") {
      if (qty > 0) {
        const matched = ranges.find((r: any) => {
          const min = Number(r.minQty) || 0;
          const max = Number(r.maxQty) || 0;
          return qty >= min && qty <= max;
        });
        if (matched) {
          const fixedPrice =
            Number(matched?.unitPrice ?? field.value.unit) || 0;
          computed = fixedPrice;
          const left = singleFieldMixins.parseCommonFieldSign(
            qty.toString(),
            field.value.sign,
            field.value.unitPosition,
          );
          const right = currencyInstance.formatCurrency(fixedPrice, options);
          breakdown.push(`${left} → ${right}`);
        } else {
          computed = 0;
        }
      } else {
        computed = 0;
      }
    }

    field.value.value = field.value.round ? Math.round(computed) : computed;
    field.value.displayValue = currencyInstance.formatCurrency(
      field.value.value || 0,
      options,
    );
    (field.value as any).extraDisplayView =
      qty > 0 && breakdown.length ? breakdown.join(" + ") : "";
  } else {
    if (
      field.value.multiply &&
      field.value.originalValue * field.value.unit !== field.value.value
    ) {
      field.value.value = field.value.value * field.value.unit;
    }

    field.value.displayValue = singleFieldMixins.getCommonFieldDisplayView(
      field.value,
      rawInput.value,
    );
  }

  fieldStore.updateField(field.value.alias, field.value, fromCondition);
  conditionsStore.applyConditionForField(field.value.alias);
  if (
    fieldStore.getPageBreakEnabled &&
    fieldStore.getActivePage.action === "not_skip"
  ) {
    pageBreakerStore.checkPageFieldsConditions();
  }
};

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;

  if (isEditing.value) {
    changeHandler(target.value);
  }
};

const onIncrement = () => {
  if (Number(backupValue.value) < field.value.max) {
    backupValue.value = (
      Number(backupValue.value) + Number(field.value.step)
    ).toString();
  }

  changeHandler(backupValue.value);
};

const onDecrement = () => {
  if (Number(backupValue.value) > field.value.min) {
    backupValue.value = (
      Number(backupValue.value) - Number(field.value.step)
    ).toString();
  }

  changeHandler(backupValue.value);
};

const changeHandler = (value: string) => {
  rawInput.value = value;

  const options = currencyInstance.getCurrencyOptions(field.value);

  const numericValue = currencyInstance.parseCurrency(
    value.toString(),
    options,
  );

  if (isNaN(numericValue)) {
    return;
  }

  updateValue(true, numericValue);
  backupValue.value = numericValue.toString();
};

const onFocus = (e: Event) => {
  const target = e.target as HTMLInputElement;
  isEditing.value = true;
  rawInput.value = parseFormattedValue(target.value || "0");
};

const onBlur = () => {
  isEditing.value = false;
};

const parseField = () => {
  const parsedValue = parseQuantityValue(backupValue.value);
  rawInput.value = parsedValue;
};

const checkMinMaxRequired = () => {
  const numericValue = currencyInstance.parseCurrency(
    rawInput.value.toString(),
    currencyInstance.getCurrencyOptions(field.value),
  );

  if (isNaN(numericValue)) {
    requiredType.value = "required";
    return;
  }

  const lessThenExpected = numericValue < +field.value.min;
  const moreThenExpected = numericValue > +field.value.max;

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

const toFixedNoRound = (num: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.floor(num * factor) / factor;
};

const parseQuantityValue = (value: number | string): string => {
  if (typeof value === "number" && value < 0) {
    value = 0;
  }

  value = value.toString().replace(",", ".");

  if (!field.value.enabledCurrencySettings && !field.value.fieldCurrency) {
    const floatVal = parseFloat(value);
    return toFixedNoRound(floatVal, toFixedCount.value).toString();
  }

  if (isNaN(Number(value.replace(/,/g, "."))) || value.length === 0) {
    value = "0";
  }

  let numericValue = parseFloat(value.replace(/,/g, "."));

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
    numericValue = toFixedNoRound(
      numericValue,
      parseInt(numAfterInteger.toString()),
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

  let sanitizedValue = parts.join(decimalSeparator);

  const options = currencyInstance.getCurrencyOptions(field.value);

  let result = currencyInstance.parseCurrency(sanitizedValue, options);

  if (isNaN(result)) {
    return sanitizedValue;
  }

  const decimalsRaw =
    options?.numAfterInteger ??
    numAfterInteger ??
    settings.getCurrencySettings?.numAfterInteger ??
    0;

  const decimals = Number(decimalsRaw);

  if (Number.isFinite(decimals) && decimals >= 0) {
    result = Number(result.toFixed(decimals));
  }

  let resultString = result.toString();

  const separator = options?.decimalSeparator || decimalSeparator;

  if (separator && separator !== "." && resultString.includes(".")) {
    resultString = resultString.replace(".", separator);
  }

  return resultString;
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
  const numericValue = currencyInstance.parseCurrency(
    rawInput.value.toString(),
    currencyInstance.getCurrencyOptions(field.value),
  );

  if (!isNaN(numericValue)) {
    const lessThenExpected = numericValue < field.value.min;
    const moreThenExpected = numericValue > field.value.max;

    if (lessThenExpected || moreThenExpected) {
      return true;
    }
  }

  return fieldStore.checkFieldRequired(field.value);
});

const getRangeRequiredText = computed(() => {
  return `
    ${translationsStore.getTranslations.valueMustBeBetween} ${field.value.min} ${translationsStore.getTranslations.and} ${field.value.max}
  `;
});

callbackStore.add("updateQuantity", updateValue);

onMounted(() => {
  rawInput.value = field.value.originalValue.toString();
  backupValue.value = rawInput.value;
  updateValue(false, field.value.originalValue, undefined, true);
});
</script>
<style lang="scss">
.ccb-field {
  @media (min-width: 1025px) {
    &.field-width-25 {
      .ccb-quantity-buttons {
        flex-wrap: wrap;
        &.ccb-quantity-buttons--right {
          &.ccb-quantity-buttons--separation {
            input {
              margin-right: 0;
            }
          }
        }
        &.ccb-quantity-buttons--both {
          &.ccb-quantity-buttons--separation {
            gap: 0;
          }
          .ccb-quantity-buttons__item {
            &.down {
              order: 2;
            }
            &.up {
              order: 3;
            }
          }
          input {
            border: var(--ccb-fields-border) var(--ccb-fields-border-style)
              var(--ccb-fields-border-color);
            order: 1;
          }
        }
        input {
          border-radius: var(--ccb-fields-border-radius)
            var(--ccb-fields-border-radius) 0 0;
          border-right: var(--ccb-fields-border) var(--ccb-fields-border-style)
            var(--ccb-fields-border-color);
        }
        .ccb-quantity-buttons__item {
          min-width: 40px;
          border-top: none;
          flex-basis: 50%;
          &.down {
            border-radius: 0 0 0 var(--ccb-fields-border-radius);
          }
          &.up {
            border-radius: 0 0 var(--ccb-fields-border-radius) 0;
          }
        }
      }
    }
  }
  &.has-badge {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-end;

    .ccb-field__label,
    .ccb-field-input__wrapper {
      flex: 0 0 100%;
    }

    .ccb-field__descriptions.ccb-before,
    .ccb-field__descriptions.ccb-after {
      flex: 1 1 auto;
    }

    .ccb-field__badge {
      margin-top: 22px;
      flex: 1 1 auto;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 600;
      line-height: 1;
      color: var(--ccb-text-color);
      &.outlined {
        .ccb-field__badge-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .ccb-field__badge-value {
          padding-right: 6px;
          border-right: 3px solid var(--ccb-accent-color);
        }
      }
      &.solid {
        .ccb-field__badge-content {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 12px;
          color: var(--ccb-container-color);
          background-color: var(--ccb-accent-color);
          gap: 6px;
          border-radius: 16px;
        }
      }
      &.primary {
        .ccb-field__badge-content {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 28px;
          background-color: var(--ccb-accent-color);
          gap: 6px;
          border-radius: 4px;
          color: var(--ccb-container-color);
        }
        .ccb-field__badge-value {
          padding-right: 8px;
        }
        i {
          padding-left: 8px;
          font-size: 15px;
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
}
</style>
