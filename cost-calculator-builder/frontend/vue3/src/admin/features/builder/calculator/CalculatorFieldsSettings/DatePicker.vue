<template>
  <div class="ccb-fields-settings-container">
    <div class="ccb-fields-settings__content ccb-custom-scrollbar">
      <div class="ccb-fields-settings ccb-field-sidebar">
        <div
          class="ccb-fields-settings-back"
          @click="builderStore.setSelectedField(null)"
        >
          <i class="ccb-icon-ic_back"></i>
          <Text text="Back to Fields" size="s" weight="medium" />
        </div>
        <div class="ccb-field-sidebar__header">
          <Text
            :text="field.label"
            size="m"
            weight="bold"
            class="ccb-field-sidebar__label"
          />
          <Text
            :text="field.alias"
            size="m"
            weight="medium"
            class="ccb-field-sidebar__alias"
          />
        </div>
        <div class="ccb-field-sidebar__tabs">
          <div class="ccb-field-sidebar__row">
            <Tab :items="fieldTabs" v-model="activeTab" type="regular" />
          </div>
        </div>

        <div class="ccb-field-sidebar__body" v-if="activeTab === 'element'">
          <div class="ccb-field-sidebar__item">
            <Input
              label="Element name"
              placeholder="Field label"
              v-model="draft.label"
            />
          </div>
          <div class="ccb-field-sidebar__item">
            <Input
              label="Placeholder"
              placeholder="Select Date"
              v-model="draft.placeholder"
            />
          </div>
          <div class="ccb-field-sidebar__item">
            <Input
              label="Description"
              placeholder="Description"
              v-model="draft.description"
            />
          </div>
          <div class="ccb-field-sidebar__item">
            <Range
              v-model="draft.width"
              :min="10"
              :max="100"
              :step="1"
              label="Element Width (%)"
              suffix="%"
            />
          </div>
        </div>

        <div class="ccb-field-sidebar__body" v-if="activeTab === 'settings'">
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Required"
              size="m"
              weight="medium"
              v-model="draft.required"
            />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Hidden by Default"
              size="m"
              weight="medium"
              v-model="draft.hidden"
            />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Calculate hidden by default"
              size="m"
              weight="medium"
              v-model="draft.calculateHidden"
            />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Show in Grand Total"
              size="m"
              weight="medium"
              v-model="draft.addToSummary"
            />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Auto-close"
              size="m"
              weight="medium"
              v-model="draft.autoclose_enabled"
            />
          </div>
        </div>
      </div>

      <div
        class="ccb-fields-settings ccb-field-sidebar"
        v-if="activeTab === 'element'"
      >
        <div class="ccb-field-sidebar__body" style="margin-bottom: 26px">
          <div class="ccb-field-sidebar__item">
            <Toggle
              label="Date Range"
              size="m"
              weight="medium"
              v-model="draft.range"
            />
          </div>
          <div class="ccb-field-sidebar__item">
            <Toggle
              label="Calculate cost by Day"
              size="m"
              weight="medium"
              v-model="draft.day_price_enabled"
            />
          </div>
          <template v-if="draft.day_price_enabled">
            <div class="ccb-field-sidebar__item">
              <Input
                label="Cost per Day"
                placeholder="Enter cost per Day"
                v-model="draft.day_price"
              />
            </div>
            <div class="ccb-field-sidebar__item">
              <Toggle
                label="Calculate disabled days"
                size="m"
                weight="medium"
                v-model="draft.calculateUnselectableDays"
              />
            </div>
          </template>
        </div>
      </div>

      <div
        class="ccb-fields-settings ccb-field-sidebar"
        v-if="activeTab === 'element'"
      >
        <div class="ccb-field-sidebar__header">
          <Text text="Specific Days" size="m" weight="bold" />
        </div>
        <div class="ccb-field-sidebar__body" style="margin-bottom: 26px">
          <div class="ccb-field-sidebar__item">
            <Toggle
              label="Disable Specific Days"
              size="m"
              weight="medium"
              v-model="draft.is_have_unselectable"
            />
          </div>
        </div>
        <div class="ccb-field-sidebar__body" v-if="draft.is_have_unselectable">
          <div class="ccb-field-sidebar__item" style="margin-bottom: 26px">
            <Checkbox
              v-model="draft.notAllowedWeekDays"
              :options="weekDayItems"
              template="rows"
            />
          </div>
          <div class="ccb-field-sidebar__item">
            <Text text="Block from today" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__item">
            <Checkbox
              v-model="draft.not_allowed_dates.all_past"
              :options="allPreviousItems"
              template="rows"
            />
          </div>
          <div class="ccb-field-sidebar__item">
            <Checkbox
              v-model="draft.not_allowed_dates.current"
              :options="currentDayItems"
              template="rows"
            />
          </div>
          <div class="ccb-field-sidebar__item">
            <div class="ccb-date-input">
              <Text
                text="Next"
                size="xs"
                weight="medium"
                class="ccb-date-input__label"
              />
              <input
                type="number"
                class="ccb-date-input__input"
                min="0"
                v-model="draft.days_from_current"
                @input="normalizeDaysFromCurrent"
                @wheel="preventNumberInputWheel"
              />
              <Text
                text="days from current day"
                size="m"
                weight="medium"
                class="ccb-date-input__placeholder"
              />
            </div>
          </div>
          <div class="ccb-field-sidebar__item">
            <RepeaterDate
              v-model="draft.not_allowed_dates.period"
              add-button-label="Add Period"
              :min-rows="1"
              :clear-on-min-rows-remove="true"
            />
          </div>
        </div>
      </div>

      <div
        class="ccb-fields-settings ccb-field-sidebar"
        v-if="activeTab === 'element'"
      >
        <div class="ccb-field-sidebar__header">
          <Text text="Measurement Unit" size="m" weight="bold" />
        </div>
        <div class="ccb-field-sidebar__body">
          <div class="ccb-field-sidebar__item">
            <Toggle
              label="Currency Sign"
              size="m"
              weight="medium"
              v-model="draft.allowCurrency"
              @change="() => updateToggle('allowCurrency')"
            />
          </div>
          <div class="ccb-field-sidebar__item">
            <Toggle
              label="Set measurement unit"
              size="m"
              weight="medium"
              v-model="draft.fieldCurrency"
              @change="() => updateToggle('fieldCurrency')"
            />
          </div>
        </div>

        <div
          class="ccb-field-sidebar__body"
          style="margin-top: 26px"
          v-if="draft.fieldCurrency && activeTab === 'element'"
        >
          <div class="ccb-field-sidebar__row">
            <div class="ccb-field-sidebar__col">
              <Input
                label="Unit Symbol"
                placeholder="Enter prefix"
                v-model="draft.fieldCurrencySettings.currency"
              />
            </div>
            <div class="ccb-field-sidebar__col">
              <Dropdown
                label="Position"
                :items="CURRENCY_POSITION_ITEMS"
                v-model="draft.fieldCurrencySettings.currencyPosition"
              />
            </div>
          </div>
          <div class="ccb-field-sidebar_row">
            <Dropdown
              label="Thousands Separator"
              :items="THOUSANDS_SEPARATOR_ITEMS"
              v-model="draft.fieldCurrencySettings.thousands_separator"
            />
          </div>
          <div class="ccb-field-sidebar_row">
            <Input
              label="Number of Decimals"
              placeholder="Enter number of decimals"
              v-model="draft.fieldCurrencySettings.num_after_integer"
            />
          </div>
          <div class="ccb-field-sidebar_row">
            <Dropdown
              label="Decimal Separator"
              :items="DECIMAL_SEPARATOR_ITEMS"
              v-model="draft.fieldCurrencySettings.decimal_separator"
            />
          </div>
        </div>
      </div>

      <div
        class="ccb-fields-settings ccb-field-sidebar"
        v-if="activeTab === 'settings'"
      >
        <div class="ccb-field-sidebar__header">
          <Text text="Additional Classes" size="m" weight="bold" />
        </div>
        <div class="ccb-field-sidebar__body">
          <div class="ccb-field-sidebar__row">
            <Textarea
              height="120px"
              placeholder="Enter additional classes"
              v-model="draft.additionalStyles"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from "vue";
import {
  Text,
  Input,
  Toggle,
  Checkbox,
  Textarea,
  Dropdown,
  Range,
} from "@/admin/shared/ui/UIKit";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import RepeaterDate from "@/admin/shared/ui/components/FieldsSettings/RepeaterDate.vue";
import type { IField } from "@/admin/shared/types/fields.type";
import {
  CURRENCY_POSITION_ITEMS,
  DECIMAL_SEPARATOR_ITEMS,
  THOUSANDS_SEPARATOR_ITEMS,
  clampWidth,
  syncCurrencySettings,
} from "./field-settings.constants";
import { useFieldWidthSync } from "./useFieldWidthSync";
import { useAutoSyncDraft } from "./useAutoSyncDraft";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();

interface IDatePickerDraft {
  label: string;
  placeholder: string;
  description: string;
  width: number;
  range: boolean;
  addToSummary: boolean;
  allowCurrency: boolean;
  calculateHidden: boolean;
  hidden: boolean;
  fieldCurrency: boolean;
  hasUnselectable: boolean;
  notAllowedWeekDays: number[];
  autocloseEnabled: boolean;
  calculateUnselectableDays: boolean;
  is_have_unselectable: boolean;
  days_from_current: number;
  day_price_enabled: boolean;
  day_price: number;
  not_allowed_dates: {
    period: Array<{ start: string | null; end: string | null }>;
    all_past: boolean;
    current: boolean;
  };
  required: boolean;
  autoclose_enabled: boolean;
  additionalStyles: string;
  fieldCurrencySettings: {
    currency: string;
    currencyPosition: string;
    decimal_separator: string;
    num_after_integer: number;
    seperateCurrency: boolean;
    thousands_separator: string;
  };
}

const draft = reactive<IDatePickerDraft>({
  label: "",
  placeholder: "",
  description: "",
  width: 100,
  range: false,
  addToSummary: true,
  day_price_enabled: false,
  day_price: 0,
  calculateUnselectableDays: false,
  allowCurrency: false,
  calculateHidden: false,
  hidden: false,
  fieldCurrency: false,
  hasUnselectable: false,
  notAllowedWeekDays: [],
  autocloseEnabled: false,
  is_have_unselectable: false,
  not_allowed_dates: {
    period: [{ start: null, end: null }],
    all_past: false,
    current: false,
  },
  days_from_current: 0,
  required: false,
  autoclose_enabled: false,
  fieldCurrencySettings: {
    currency: "",
    currencyPosition: "",
    decimal_separator: "",
    num_after_integer: 0,
    seperateCurrency: false,
    thousands_separator: "",
  },
  additionalStyles: "",
});

const fieldTabs = [
  { id: "element", label: "Element" },
  { id: "settings", label: "Settings" },
];

const activeTab = ref<string>("element");
useFieldWidthSync(() => props.field, draft);
const { suppressAutoSync, restoredVersion } = useAutoSyncDraft(
  () => props.field,
  draft,
  {
    notAllowedWeekDays: "not_allowed_week_days",
    autocloseEnabled: "autoclose_enabled",
  },
);

const allPreviousItems = [{ value: true, label: "All previous" }];

const currentDayItems = [{ value: true, label: "Current day" }];

const weekDayItems = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

const normalizeWeekDays = (values: unknown): number[] => {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 7);
};

const normalizeDaysFromCurrent = (): void => {
  draft.days_from_current = Math.max(0, Number(draft.days_from_current) || 0);
};

const preventNumberInputWheel = (event: WheelEvent): void => {
  event.preventDefault();
};

const syncDraftFromField = (): void => {
  const source = props.field as IField & {
    placeholder?: string;
    range?: string | boolean;
    addToSummary?: boolean;
    allowCurrency?: boolean;
    calculateHidden?: boolean;
    fieldCurrency?: boolean;
    hasUnselectable?: boolean;
    is_have_unselectable?: boolean;
    not_allowed_week_days?: number[];
    day_price_enabled?: boolean;
    day_price?: number;
    not_allowed_dates?: {
      period?: Array<{ start?: string | null; end?: string | null }>;
      all_past?: boolean;
      current?: boolean;
    };
    autoclose_enabled?: boolean;
    calculateUnselectableDays?: boolean;
    days_from_current?: number;
    required?: boolean;
    additionalClasses?: string;
    fieldCurrencySettings?: {
      currency?: string;
      currencyPosition?: string;
      decimal_separator?: string;
      num_after_integer?: number;
      seperateCurrency?: boolean;
      thousands_separator?: string;
    };
  };

  draft.label = String(source.label || "");
  draft.placeholder = String(source.placeholder || "");
  draft.description = String(source.description || "");
  draft.width = clampWidth(source.width);
  const r = source.range;
  draft.range = r === true || String(r) === "1";
  draft.addToSummary = Boolean(source.addToSummary);
  draft.allowCurrency = Boolean(source.allowCurrency);
  draft.calculateHidden = Boolean(source.calculateHidden);
  draft.hidden = Boolean(source.hidden);
  draft.fieldCurrency = Boolean(source.fieldCurrency);
  draft.hasUnselectable = Boolean(
    source.hasUnselectable ?? source.is_have_unselectable,
  );
  draft.notAllowedWeekDays = normalizeWeekDays(source.not_allowed_week_days);
  draft.autocloseEnabled = Boolean(source.autoclose_enabled);
  draft.calculateUnselectableDays = Boolean(source.calculateUnselectableDays);
  draft.is_have_unselectable = Boolean(source.is_have_unselectable);
  draft.day_price_enabled = Boolean(source.day_price_enabled);
  draft.day_price = Math.max(0, Number(source.day_price));
  draft.not_allowed_dates = {
    period:
      source.not_allowed_dates?.period && source.not_allowed_dates.period.length
        ? source.not_allowed_dates.period.map(
            (item: { start?: string | null; end?: string | null }) => ({
              start: item?.start ? String(item.start) : null,
              end: item?.end ? String(item.end) : null,
            }),
          )
        : [{ start: null, end: null }],
    all_past: Boolean(source.not_allowed_dates?.all_past),
    current: Boolean(source.not_allowed_dates?.current),
  };
  draft.days_from_current = Math.max(0, Number(source.days_from_current));
  draft.required = Boolean(source.required);
  draft.autoclose_enabled = Boolean(source.autoclose_enabled);
  draft.additionalStyles = String(source.additionalStyles || "");
  draft.fieldCurrencySettings = {
    ...syncCurrencySettings(source.fieldCurrencySettings),
    seperateCurrency: Boolean(source.fieldCurrencySettings?.seperateCurrency),
  };
};

watch(
  () => [props.field.alias, restoredVersion.value],
  () => {
    suppressAutoSync(() => syncDraftFromField());
  },
  { immediate: true },
);

const updateToggle = (key: string): void => {
  if (key === "allowCurrency" && draft.allowCurrency && draft.fieldCurrency) {
    draft.fieldCurrency = false;
  }

  if (key === "fieldCurrency" && draft.fieldCurrency && draft.allowCurrency) {
    draft.allowCurrency = false;
  }
};
</script>

<style scoped lang="scss">
@use "@/admin/features/builder/field-settings";

.ccb-date-input {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: var(--ccb-blue-bg-dull-normal);
  border-radius: 12px;
  padding: 6px 4px 4px 4px;
  position: relative;

  &__label {
    margin-left: 12px;
    color: var(--ccb-font-labels);
    margin-bottom: 4px;
  }

  &__input {
    width: 100%;
    background-color: var(--ccb-input-normal);
    border: none;
    outline: none;
    color: var(--ccb-font-labels);
    font-size: 14px;
    font-weight: 500;
    border-radius: 12px;
    padding: 16px 168px 16px 16px;
    height: 48px;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &[type="number"] {
      -moz-appearance: textfield;
    }

    &:focus {
      outline: none;
      box-shadow: none;
    }
  }

  &__placeholder {
    color: var(--ccb-font-comment);
    position: absolute;
    bottom: 18px;
    right: 12px;
  }
}
</style>
