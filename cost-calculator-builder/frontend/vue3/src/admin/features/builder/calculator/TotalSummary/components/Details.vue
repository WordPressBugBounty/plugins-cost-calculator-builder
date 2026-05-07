<template>
  <div
    class="ccb-summary-details"
    :class="{ 'ccb-summary-details--open': true }"
  >
    <div class="ccb-summary-details__header">
      <div class="ccb-summary-details__header__label">
        {{ translations.name }}
      </div>
      <div class="ccb-summary-details__header__value">
        {{ translations.total }}
      </div>
    </div>

    <template v-for="detail in getDetails(details)">
      <div
        v-if="detail.options"
        :key="`${detail.alias}_group`"
        class="ccb-summary-details__group"
      >
        <div class="ccb-summary-details__row ccb-summary-details__row--parent">
          <span class="ccb-details__label ccb-details__label--bold">{{
            detail.label
          }}</span>
          <span
            v-if="detail.summaryView === 'show_value'"
            class="ccb-details__value ccb-details__value--bold"
          >
            {{ formatCurrencyValue(detail.optionsTotal, detail) }}
          </span>
        </div>

        <template v-if="detail.summaryView === 'show_value'">
          <div
            class="ccb-summary-details__row ccb-summary-details__row--child"
            v-for="(option, idx) in detail.options.slice(0, 1)"
            :key="`${detail.alias}_opt_${idx}`"
          >
            <span class="ccb-details__label">{{ option.label }}</span>
            <span class="ccb-details__value">{{
              formatCurrencyValue(option.value, detail)
            }}</span>
          </div>
        </template>

        <template
          v-else-if="
            detail.summaryView === 'show_label_not_calculable' ||
            detail.summaryView === 'show_label_calculable'
          "
        >
          <div
            class="ccb-summary-details__row ccb-summary-details__row--child"
            v-for="(option, idx) in detail.options.slice(0, 1)"
            :key="`${detail.alias}_opt_${idx}`"
          >
            <span class="ccb-details__label">{{ option.label }}</span>
          </div>
        </template>
      </div>

      <div v-else :key="detail.alias" class="ccb-summary-details__row">
        <span class="ccb-summary-details__label">{{ detail.label }}</span>
        <span class="ccb-summary-details__value">{{
          formatCurrencyValue(detail.value, detail)
        }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import type {
  IField,
  IFieldCurrencySettings,
  IGroupField,
  IOptions,
  SummaryView,
} from "@/admin/shared/types/fields.type";
import type { ICurrency } from "@/admin/shared/types/settings.type";
import { useAppearanceTypography } from "@/admin/shared/utils/useAppearanceTypography";

interface CurrencyConfig {
  currency: string;
  numAfterInteger: number;
  decimalSeparator: string;
  thousandsSeparator: string;
  currencyPosition: string;
}

interface DetailOption {
  label: string;
  value: number;
}

interface DetailItem {
  alias: string;
  label: string;
  type: string;
  value: number;
  options?: DetailOption[];
  optionsTotal: number;
  allowCurrency: boolean;
  fieldCurrency: boolean;
  fieldCurrencySettings?: IFieldCurrencySettings;
  summaryView: SummaryView;
  field_type?: string;
}

defineProps<{
  isOpen: boolean;
}>();

const appearanceStore = useAppearanceStore();
const translationsStore = useBuilderTranslationsStore();
const builderStore = useBuilderStore();
const settingsStore = useSettingsStore();
const appStore = useAppStore();
const {
  summaryHeaderFontSize,
  summaryHeaderFontWeight,
  summaryFieldFontSize,
  summaryFieldFontWeight,
  summaryOptionsFontSize,
} = useAppearanceTypography();
const EXCLUDED_TYPES = ["total", "html", "line"];

function hasOptions(field: IField): field is IField & { options: IOptions[] } {
  return "options" in field && Array.isArray((field as any).options);
}

function getFieldValue(field: IField): number {
  const raw = field as any;
  if (typeof raw.default !== "undefined" && raw.default) return raw.default;
  if (typeof raw.maxValue === "number") return raw.maxValue;
  if (typeof raw.max === "number") return raw.max;
  return 0;
}

function getCurrencyConfigFromSettings(
  settingsCurrency: ICurrency,
): CurrencyConfig {
  return {
    currency: settingsCurrency.currency || "$",
    numAfterInteger: settingsCurrency.num_after_integer ?? 2,
    decimalSeparator: settingsCurrency.decimal_separator || ".",
    thousandsSeparator: settingsCurrency.thousands_separator || ",",
    currencyPosition: settingsCurrency.currencyPosition || "left",
  };
}

function getCurrencyConfigFromField(
  fcs: IFieldCurrencySettings,
): CurrencyConfig {
  return {
    currency: fcs.currency || "$",
    numAfterInteger: fcs.num_after_integer ?? 2,
    decimalSeparator: fcs.decimal_separator || ".",
    thousandsSeparator: fcs.thousands_separator || ",",
    currencyPosition: fcs.currencyPosition || "left",
  };
}

function resolveCurrencyConfig(detail: DetailItem): CurrencyConfig | null {
  if (detail.fieldCurrency && detail.fieldCurrencySettings) {
    return getCurrencyConfigFromField(detail.fieldCurrencySettings);
  }

  if (detail.allowCurrency) {
    const settingsCurrency = settingsStore.getSettings?.currency;
    if (settingsCurrency) {
      return getCurrencyConfigFromSettings(settingsCurrency);
    }
  }

  return null;
}

function applyThousandsSeparator(intPart: string, sep: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

function positionCurrency(
  formatted: string,
  symbol: string,
  position: string,
): string {
  switch (position) {
    case "right":
      return `${formatted}${symbol}`;
    case "left_with_space":
      return `${symbol} ${formatted}`;
    case "right_with_space":
      return `${formatted} ${symbol}`;
    default:
      return `${symbol}${formatted}`;
  }
}

function formatWithCurrency(value: number, config: CurrencyConfig): string {
  const fixed = Number(value).toFixed(config.numAfterInteger);
  const [intPart, decPart] = fixed.split(".");
  const intFormatted = applyThousandsSeparator(
    intPart,
    config.thousandsSeparator,
  );
  const formatted = decPart
    ? intFormatted + config.decimalSeparator + decPart
    : intFormatted;
  return positionCurrency(formatted, config.currency, config.currencyPosition);
}

function formatCurrencyValue(value: number, detail: DetailItem): string {
  const config = resolveCurrencyConfig(detail);
  if (config) return formatWithCurrency(value, config);

  if (detail.type === "text-area") {
    return "Some text";
  }

  if (detail.type === "validated-form") {
    const values = {
      email: "john@doe.com",
      name: "John Doe",
      phone: "1234567890",
      website_url: "https://www.example.com",
    };
    return (
      values[detail.field_type as keyof typeof values] || "Validation form"
    );
  }

  return value.toString();
}

function buildDetailItem(field: IField): DetailItem {
  const raw = field as any;

  const base: DetailItem = {
    alias: field.alias,
    label: field.label,
    type: field.type,
    value: getFieldValue(field),
    optionsTotal: 0,
    allowCurrency: !!raw.allowCurrency,
    fieldCurrency: !!raw.fieldCurrency,
    fieldCurrencySettings: raw.fieldCurrencySettings,
    summaryView: raw.summary_view || "show_value",
    field_type: raw.field_type || "",
  };

  if (hasOptions(field)) {
    base.options = raw.options.map((opt: IOptions) => ({
      label: opt.optionText,
      value: parseFloat(opt.optionValue) || 0,
    }));
    base.optionsTotal = base.options!.reduce((s, o) => s + o.value, 0);
  }

  return base;
}

const details = computed((): DetailItem[] => {
  const items: DetailItem[] = [];

  const pages = builderStore.getBuilderFields;
  const activePageIndex = builderStore.getActivePage;
  const pagesUpToActive = pages.slice(0, activePageIndex + 1);

  for (const page of pagesUpToActive) {
    for (const section of page.groupElements) {
      for (const field of section.fields) {
        if (EXCLUDED_TYPES.includes(field.type)) continue;

        if (
          "groupElements" in field &&
          Array.isArray((field as IGroupField).groupElements)
        ) {
          for (const child of (field as IGroupField).groupElements) {
            if (EXCLUDED_TYPES.includes(child.type)) continue;
            items.push(buildDetailItem(child));
          }
        } else {
          items.push(buildDetailItem(field));
        }
      }
    }
  }

  return items;
});

const translations = computed(() => translationsStore.getTranslations);
const bgrColor = computed(
  () =>
    `${appearanceStore.getActivePreset?.desktop?.colors?.data?.primary_color?.value || "#000000"}1D`,
);
const borderRadius = computed(() => {
  const buttonBorderData = (appearanceStore.getActivePreset?.desktop as any)
    ?.borders?.data?.button_border?.data;
  return `${buttonBorderData?.border_radius?.value || 12}px`;
});

const getDetails = computed(() => {
  const proFieldsMap: Record<string, boolean> = {
    geolocation: true,
    "multi-range": true,
    "date-picker": true,
    "time-picker": true,
    repeater: true,
    "validated-form": true,
    "group-field": true,
    "file-upload": true,
    "drop-down-with-image": true,
    "checkbox-with-image": true,
    "radio-with-image": true,
    group: true,
  };
  return (fields: DetailItem[]): DetailItem[] => {
    if (appStore.getIsPro) return fields;
    return fields.filter((field) => {
      return !proFieldsMap[field.type];
    });
  };
});
</script>

<style scoped lang="scss">
.ccb-summary-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  max-height: 0;
  overflow: hidden;
  transition:
    max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;

  &__label,
  &__value {
    font-weight: 700;
  }

  &__label {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 8px;
  }

  &__value {
    flex: 0 0 auto;
    max-width: 50%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &--open {
    max-height: 100%;
    overflow: visible;
    opacity: 1;
  }

  &__header {
    font-size: v-bind(summaryHeaderFontSize);
    font-weight: v-bind(summaryHeaderFontWeight);
    line-height: normal;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 4px 10px;
    background-color: v-bind(bgrColor);
    border-radius: v-bind(borderRadius);
    margin-bottom: 5px;
  }

  &__group {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    border-bottom: 1px dashed #e0e0e0;
    padding: 4px 0;
    min-width: 0;
    font-size: v-bind(summaryFieldFontSize);
    font-weight: v-bind(summaryFieldFontWeight);
    line-height: normal;

    &--child {
      padding-left: 12px;
      border-bottom: none;
      color: #999;
      font-size: v-bind(summaryOptionsFontSize);
    }
  }
}

.ccb-details {
  &__label,
  &__value {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__label {
    padding-right: 8px;
  }

  &__value {
    flex: 0 0 auto;
    max-width: 50%;
    text-align: right;
  }
}
</style>
