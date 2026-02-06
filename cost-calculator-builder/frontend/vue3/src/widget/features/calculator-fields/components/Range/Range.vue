<template>
  <div
    class="ccb-field ccb-range-field"
    :class="{
      required: isRequired,
      'ccb-field-disabled': field.disabled,
      [additionalClasses]: true,
      [field.styles?.style]: true,
      'has-badge': !!getSavedAmount,
    }"
  >
    <div class="ccb-field__label">
      <RequiredHint v-if="isRequired" :text="requiredWarningText" />
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
      <component
        :is="currentComponents"
        :field="field"
        @update:modelValue="updateValue"
        v-model="rawInput"
      />
    </div>

    <div
      v-if="
        appearanceStore.getAppearanceDescriptionPosition === 'after' &&
        field.description &&
        field.description.length > 0
      "
      class="ccb-field__descriptions ccb-after"
    >
      <div class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>
    <div
      class="ccb-field__badge"
      :class="field.badgeVariant"
      v-if="getSavedAmount && !field.multiply"
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
import { IRangeField } from "@/widget/shared/types/fields";

import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import { useConditionsStore } from "@/widget/app/providers/stores/conditionsStore.ts";
import { useSingleField } from "@/widget/actions/fields/composable/useSingleField.ts";
import { useCallbackStore } from "@/widget/app/providers/stores/callbackStore.ts";
import { useCurrency } from "@/widget/actions/fields/composable/useCurrency.ts";
import RequiredHint from "@/widget/shared/ui/components/Required-hint/RequiredHint.vue";
import { usePageBreakerStore } from "@/widget/app/providers/stores/pageBreakerStore.ts";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";

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
const rawInput = ref<number>(0);
const pageBreakerStore = usePageBreakerStore();

onMounted(() => {
  rawInput.value = field.value.originalValue
    ? field.value.originalValue
    : field.value.min;

  updateValue(rawInput.value, undefined, true);
});

const requiredWarningText = computed(() => {
  const settingStore = useSettingsStore();
  return settingStore.getWarningTexts?.requiredMsg || "";
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

const currentComponents = computed(() => {
  const style = field.value?.styles?.style || "default";
  if (style === "default") {
    return defineAsyncComponent(() => import("./styles/Default.vue"));
  } else if (style === "small") {
    return defineAsyncComponent(() => import("./styles/Small.vue"));
  } else if (style === "flat-minimal") {
    return defineAsyncComponent(() => import("./styles/Flat.vue"));
  } else if (style === "modern") {
    return defineAsyncComponent(() => import("./styles/Modern.vue"));
  } else if (style === "input") {
    return defineAsyncComponent(() => import("./styles/Input.vue"));
  } else if (style === "multi-point") {
    return defineAsyncComponent(() => import("./styles/MultiPoint.vue"));
  }

  return "";
});

const updateValue = (
  value: number,
  alias?: string,
  fromCondition?: boolean,
) => {
  if (alias && alias !== field.value.alias) {
    return;
  }

  if (!alias || fromCondition) {
    rawInput.value = value;
    field.value.originalValue = value;
  }

  const structure = field.value.pricingStructure;
  if (
    (structure === "tiered_discounts" ||
      structure === "cumulative_discounts" ||
      structure === "flat_rate_discounts") &&
    Array.isArray((field.value as any).pricingRanges)
  ) {
    const qty = Number(field.value.originalValue ?? rawInput.value) || 0;
    const ranges = ((field.value as any).pricingRanges as any[]) || [];
    let computed = 0;
    let breakdown: string[] = [];
    const options = currencyInstance.getCurrencyOptions(field.value);

    if (structure === "tiered_discounts") {
      const matched = ranges.find((r) => {
        const min = Number(r.minQty) || 0;
        const max = Number(r.maxQty) || 0;
        return qty >= min && qty <= max;
      });
      const unitPrice = Number(matched?.unitPrice ?? field.value.unit) || 0;
      computed = qty * unitPrice;
      const left = singleFieldMixins.parseCommonFieldSign(
        qty.toString(),
        field.value.sign,
        field.value.unitPosition,
      );
      const right = currencyInstance.formatCurrency(unitPrice, options);
      breakdown.push(`${left} x ${right}`);
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
        const fixedPrice = Number(matched?.unitPrice ?? field.value.unit) || 0;
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
    }

    field.value.value = field.value.round ? Math.round(computed) : computed;
    field.value.displayValue = currencyInstance.formatCurrency(
      field.value.value || 0,
      options,
    );
    (field.value as any).extraDisplayView =
      qty > 0 && breakdown.length ? breakdown.join(" + ") : "";
  } else {
    if (field.value.multiply) {
      value = value * field.value.unit;
    }

    field.value.value = field.value.round ? Math.round(value || 0) : value || 0;

    field.value.displayValue = singleFieldMixins.getCommonFieldDisplayView(
      field.value,
      rawInput.value.toString(),
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
    if (field.value.unitPosition === "left") {
      return `${field.value.sign} ${rawInput.value}`;
    }

    return `${rawInput.value} ${field.value.sign}`;
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

callbackStore.add("updateRange", updateValue);
</script>

<style lang="scss">
.ccb-field {
  @media (min-width: 1025px) {
    &.field-width-25 {
      .ccb-range-field {
        .ccb-input-range-field {
          flex-direction: column;
          padding: 6px 0;
          gap: 25px;
          align-items: flex-start;
          .custom-slider {
            width: 100%;
            padding-left: 0;
            .slider-handle {
              width: 20px !important;
              height: 20px !important;
              top: calc(
                (
                    var(--slider-handle-height, 16px) - var(
                        --slider-height,
                        6px
                      )
                  ) /
                  2 * -1 - 1px
              ) !important;
              box-shadow: 0px 5px 15px 0px rgba(0, 0, 0, 0.1);
            }
          }
        }
        .ccb-field__title--title-box {
          flex-direction: column;
        }
        .slider-wrapper {
          &.ccb-multi-point-range-field {
            .slider-base {
              .slider-handle {
                right: calc(var(--slider-handle-width, 16px) / 2 * -1);
              }
            }
          }
          &.ccb-modern-range-field {
            .slider-base {
              .slider-handle {
                right: calc(var(--slider-handle-width, 24px) / 2 * -1);
              }
            }
          }
          &.ccb-flat-range-field {
            .slider-base {
              .slider-handle {
                right: calc(var(--slider-handle-width, 32px) / 2 * -1);
              }
            }
          }
        }
      }
    }
  }
}
.ccb-range-field {
  display: flex;
  flex-direction: column;

  .slider-base {
    background-color: var(--ccb-fields-border-color) !important;
  }

  .slider-tooltip,
  .slider-handle,
  .slider-connect {
    background-color: var(--ccb-accent-color);
  }

  .slider-connects {
    cursor: pointer;
  }

  .slider-tooltip {
    color: var(--ccb-fields-color) !important;
    border-color: var(--ccb-accent-color) !important;
  }

  @media (max-width: 1024px) {
    .slider-tooltip {
      display: none !important;
    }

    .slider-handle.slider-active .slider-tooltip {
      display: block !important;
    }
  }

  .slider-handle:focus {
    box-shadow: none !important;
  }
  &.default {
    .ccb-field__descriptions.ccb-after {
      margin-top: 22px;
    }
  }
  &.has-badge {
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
