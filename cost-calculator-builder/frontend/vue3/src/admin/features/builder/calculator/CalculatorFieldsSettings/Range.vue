<template>
  <div class="ccb-fields-settings-container ccb-custom-scrollbar">
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

        <div class="ccb-field-sidebar__body" v-if="activeTab === 'variants'">
          <div
            class="ccb-field-sidebar__row"
            v-for="style in styleItems"
            :key="style.value"
          >
            <div
              class="ccb-field-variant"
              :class="{ active: draft.style === style.value }"
              @click="draft.style = style.value"
            >
              <div class="ccb-field-variant__check">
                <i class="ccb-icon-ic_check"></i>
              </div>
              <div class="ccb-field-variant__title">
                <Text :text="style.label" size="s" weight="medium" />
              </div>
              <div class="ccb-field-variant__view">
                <img :src="style.image" :alt="style.label" />
              </div>
            </div>
          </div>
        </div>

        <div class="ccb-field-sidebar__body" v-if="activeTab === 'settings'">
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Round Value"
              size="m"
              weight="medium"
              v-model="draft.allowRound"
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
              label="Required"
              size="m"
              weight="medium"
              v-model="draft.required"
            />
          </div>
        </div>
      </div>

      <template v-if="activeTab === 'element'">
        <div class="ccb-fields-settings ccb-field-sidebar">
          <div class="ccb-field-sidebar__header">
            <Text text="Properties" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__row">
              <div class="ccb-field-sidebar__col">
                <Input
                  label="Min Value"
                  placeholder="0"
                  v-model="draft.minValue"
                />
              </div>
              <div class="ccb-field-sidebar__col">
                <Input
                  label="Max Value"
                  placeholder="100"
                  v-model="draft.maxValue"
                />
              </div>
            </div>
            <div class="ccb-field-sidebar__row">
              <div class="ccb-field-sidebar__col">
                <Input
                  label="Range Step"
                  placeholder="1"
                  v-model="draft.step"
                />
              </div>
              <div class="ccb-field-sidebar__col">
                <Input
                  label="Default Value"
                  placeholder="0"
                  v-model="draft.defaultValue"
                />
              </div>
            </div>
            <div class="ccb-field-sidebar__row">
              <div class="ccb-field-sidebar__col">
                <Input
                  label="Unit Name"
                  placeholder="kg"
                  v-model="draft.sign"
                />
              </div>
              <div class="ccb-field-sidebar__col">
                <Dropdown
                  label="Position"
                  :items="UNIT_POSITION_ITEMS"
                  v-model="draft.unitPosition"
                />
              </div>
            </div>
            <div class="ccb-field-sidebar__row">
              <Toggle
                label="Multiply by Unit Price"
                size="m"
                weight="medium"
                v-model="draft.multiply"
              />
            </div>
            <div class="ccb-field-sidebar__row" v-if="draft.multiply">
              <div class="ccb-quantity-selected-value">
                <Text
                  text="Selected value"
                  style="margin-left: 12px"
                  size="s"
                  weight="medium"
                />
                <div class="ccb-quantity-selected-value__content">
                  <div
                    class="ccb-quantity-selected-value__cell ccb-quantity-selected-value__cell--value"
                  >
                    <i
                      class="ccb-icon-ic_cross_small"
                      aria-hidden="true"
                      @click="draft.unit = '0'"
                    ></i>
                    <input
                      v-model="draft.unit"
                      type="number"
                      class="ccb-quantity-selected-value__input ccb-quantity-selected-value__input--value"
                    />
                  </div>
                  <div
                    class="ccb-quantity-selected-value__cell ccb-quantity-selected-value__cell--unit"
                  >
                    <span class="ccb-quantity-selected-value__unit-title"
                      >Unit</span
                    >
                    <input
                      v-model="draft.unitSymbol"
                      type="text"
                      placeholder="kg, cm, ..."
                      class="ccb-quantity-selected-value__input ccb-quantity-selected-value__input--unit"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="ccb-field-sidebar__row" v-if="draft.multiply">
              <Toggle
                label="Replace Subtotal with Multiplied Value"
                size="m"
                weight="medium"
                v-model="draft.multipliedTotal"
              />
            </div>
          </div>
        </div>

        <div class="ccb-fields-settings ccb-field-sidebar">
          <div class="ccb-field-sidebar__header">
            <Text text="Measurement Unit" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__item">
              <Toggle
                label="Use currency sign"
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
                placeholder="Kg"
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

        <div class="ccb-fields-settings ccb-field-sidebar">
          <div class="ccb-field-sidebar__header">
            <Text text="Pricing Structure" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__row">
              <Dropdown
                label="Pricing Type"
                :items="PRICING_STRUCTURE_ITEMS"
                v-model="draft.pricingStructure"
                :disabled="draft.multiply || !isProActive"
                :style="{ width: '100%' }"
              />
            </div>
          </div>
        </div>

        <div
          v-if="showPricingRanges"
          class="ccb-fields-settings ccb-field-sidebar"
        >
          <div class="ccb-field-sidebar__header">
            <Text text="Pricing Ranges" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <template v-for="(range, idx) in draft.pricingRanges" :key="idx">
              <div class="ccb-field-sidebar__row ccb-pricing-range__header">
                <Text
                  :text="`Range ${idx + 1} — from ${idx === 0 ? draft.minValue : range.minQty}`"
                  size="s"
                  weight="medium"
                />
                <button
                  v-if="idx > 0 && idx === draft.pricingRanges.length - 1"
                  class="ccb-pricing-range__remove"
                  type="button"
                  @click="removePricingRange(idx)"
                >
                  <i class="ccb-icon-ic_delete"></i>
                </button>
              </div>
              <div class="ccb-field-sidebar__row">
                <div class="ccb-field-sidebar__col">
                  <Input
                    label="Max Qty"
                    placeholder="0"
                    :modelValue="String(range.maxQty)"
                    @update:modelValue="
                      (v: string) => {
                        range.maxQty = parseFloat(v) || 0;
                      }
                    "
                    @blur="
                      (e: FocusEvent) => clampPricingRange(idx, 'maxQty', e)
                    "
                    type="number"
                  />
                </div>
                <div class="ccb-field-sidebar__col">
                  <Input
                    :label="`Unit Price (${currentCurrency})`"
                    placeholder="0"
                    :modelValue="String(range.unitPrice)"
                    @update:modelValue="
                      (v: string) => {
                        range.unitPrice = parseFloat(v) || 0;
                      }
                    "
                    @blur="
                      (e: FocusEvent) => clampPricingRange(idx, 'unitPrice', e)
                    "
                    type="number"
                  />
                </div>
              </div>
            </template>
            <div class="ccb-field-sidebar__row">
              <Button
                label="Add another range"
                size="s"
                type="green-ghost"
                iconLeft="ccb-icon-ic_plus_big"
                :disabled="!canAddPricingRange"
                @click="addPricingRange()"
              />
            </div>
          </div>
        </div>

        <div
          v-if="showPricingRanges"
          class="ccb-fields-settings ccb-field-sidebar"
        >
          <div class="ccb-field-sidebar__header">
            <Text text="Badge Settings" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__row">
              <Input
                label="Badge Text"
                placeholder="You save"
                v-model="draft.badgeText"
              />
            </div>
            <div class="ccb-field-sidebar__row">
              <div class="ccb-field-sidebar__col">
                <Dropdown
                  label="Format"
                  :items="badgeFormatItems"
                  v-model="draft.badgeFormat"
                  :showOriginal="true"
                />
              </div>
              <div class="ccb-field-sidebar__col">
                <Dropdown
                  label="Variant"
                  :items="BADGE_VARIANT_ITEMS"
                  v-model="draft.badgeVariant"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-if="activeTab === 'settings'">
        <div class="ccb-fields-settings ccb-field-sidebar">
          <div class="ccb-field-sidebar__header">
            <Text text="Additional Classes" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__row">
              <Textarea
                height="120px"
                placeholder="Enter additional classes"
                v-model="draft.additionalClasses"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref, computed } from "vue";
import {
  Text,
  Input,
  Dropdown,
  Toggle,
  Textarea,
  Button,
  Range,
} from "@/admin/shared/ui/UIKit";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { useFlowStore } from "@/admin/app/providers/stores/useFlowStore";
import type { IField } from "@/admin/shared/types/fields.type";
import {
  rangeSettingsDraftDefaults,
  type IRangeSettingsDraft,
} from "@/admin/shared/defaults/range";
import {
  CURRENCY_POSITION_ITEMS,
  DECIMAL_SEPARATOR_ITEMS,
  THOUSANDS_SEPARATOR_ITEMS,
  UNIT_POSITION_ITEMS,
  clampWidth,
  syncCurrencySettings,
} from "./field-settings.constants";
import { useFieldWidthSync } from "./useFieldWidthSync";
import { useAutoSyncDraft } from "./useAutoSyncDraft";
import {
  usePricingRanges,
  PRICING_STRUCTURE_ITEMS,
  BADGE_FORMAT_ITEMS,
  BADGE_VARIANT_ITEMS,
  type PricingStructure,
  type BadgeVariant,
  type BadgeFormat,
} from "./usePricingRanges";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import defaultImage from "@/images/fields-variants/range/default.png";
import smallImage from "@/images/fields-variants/range/small.png";
import flatMinimalImage from "@/images/fields-variants/range/flat-minimal.png";
import modernImage from "@/images/fields-variants/range/Modern.png";
import inputImage from "@/images/fields-variants/range/Input.png";
import multiPointImage from "@/images/fields-variants/range/multi-point.png";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();
const appStore = useAppStore();
const settingsStore = useSettingsStore();
const flowStore = useFlowStore();
const defaultDraft = rangeSettingsDraftDefaults();

const draft = reactive<IRangeSettingsDraft>(rangeSettingsDraftDefaults());

const isProActive = computed(() => flowStore.getProActive);
const currentCurrency = computed(
  () => settingsStore.getSettings?.currency.currency || "$",
);
const badgeFormatItems = computed(() =>
  BADGE_FORMAT_ITEMS(currentCurrency.value),
);

const showPricingRanges = computed(
  () => draft.pricingStructure !== "no_discounts" && !draft.multiply,
);

const {
  canAddPricingRange,
  clampPricingRange,
  addPricingRange,
  removePricingRange,
} = usePricingRanges(
  draft,
  () => draft.minValue,
  () => draft.maxValue,
);

watch(
  () => draft.multiply,
  (isMultiply) => {
    if (isMultiply) {
      draft.pricingStructure = "no_discounts";
    }
  },
);

const fieldTabs = [
  { id: "element", label: "Element" },
  {
    id: "variants",
    label: "Variants",
    isPro: !appStore.getIsPro,
    proBadge: !appStore.getIsPro,
  },
  { id: "settings", label: "Settings" },
];

const activeTab = ref<string>("element");
useFieldWidthSync(() => props.field, draft);
const { suppressAutoSync, restoredVersion } = useAutoSyncDraft(
  () => props.field,
  draft,
  {
    defaultValue: "default",
    additionalClasses: "additionalStyles",
    style: "styles.style",
  },
);

type RangeStyle = IRangeSettingsDraft["style"];

const styleItems: Array<{
  value: RangeStyle;
  label: string;
  image: string;
}> = [
  { value: "default", label: "Default", image: defaultImage },
  { value: "small", label: "Small", image: smallImage },
  { value: "flat-minimal", label: "Flat Minimal", image: flatMinimalImage },
  { value: "modern", label: "Modern", image: modernImage },
  { value: "input", label: "Input", image: inputImage },
  { value: "multi-point", label: "Multi Point", image: multiPointImage },
];

const updateToggle = (key: string): void => {
  if (key === "allowCurrency" && draft.allowCurrency && draft.fieldCurrency) {
    draft.fieldCurrency = false;
  }

  if (key === "fieldCurrency" && draft.fieldCurrency && draft.allowCurrency) {
    draft.allowCurrency = false;
  }
};

const syncDraftFromField = () => {
  const source = props.field as IField & {
    minValue?: number | string;
    maxValue?: number | string;
    step?: number | string;
    default?: number | string;
    sign?: string;
    unitPosition?: "left" | "right";
    multiply?: boolean;
    unit?: number | string;
    unitSymbol?: string;
    multipliedTotal?: boolean;
    jump?: boolean;
    scalePoints?: string;
    allowCurrency?: boolean;
    allowRound?: boolean;
    calculateHidden?: boolean;
    addToSummary?: boolean;
    required?: boolean;
    fieldCurrency?: boolean;
    styles?: {
      style?: IRangeSettingsDraft["style"];
    };
    useCurrencySign?: boolean;
    additionalStyles?: string;
    fieldCurrencySettings?: {
      currency: string;
      currencyPosition: string;
      thousands_separator: string;
      num_after_integer: number;
      decimal_separator: string;
    };
    pricingStructure?: string;
    pricingRanges?: { minQty: number; maxQty: number; unitPrice: number }[];
    badgeText?: string;
    badgeVariant?: string;
    badgeFormat?: string;
  };

  draft.label = String(source.label ?? defaultDraft.label);
  draft.fieldName = String(source.fieldName || defaultDraft.fieldName);
  draft.description = String(source.description || defaultDraft.description);
  draft.width = clampWidth(source.width || defaultDraft.width);
  draft.minValue = String(source.minValue ?? defaultDraft.minValue);
  draft.maxValue = String(source.maxValue ?? defaultDraft.maxValue);
  draft.step = String(source.step ?? defaultDraft.step);
  draft.defaultValue = String(source.default ?? defaultDraft.defaultValue);
  draft.sign = String(source.sign || defaultDraft.sign);
  draft.unitPosition = source.unitPosition || defaultDraft.unitPosition;
  draft.multiply = Boolean(source.multiply ?? defaultDraft.multiply);
  draft.unit = String(source.unit ?? defaultDraft.unit);
  draft.unitSymbol = String(source.unitSymbol || defaultDraft.unitSymbol);
  draft.multipliedTotal = Boolean(
    source.multipliedTotal ?? defaultDraft.multipliedTotal,
  );
  draft.jump = Boolean(source.jump ?? defaultDraft.jump);
  draft.scalePoints = String(source.scalePoints || defaultDraft.scalePoints);
  draft.style = source.styles?.style || defaultDraft.style;
  draft.allowCurrency = Boolean(
    source.allowCurrency ?? defaultDraft.allowCurrency,
  );
  draft.allowRound = Boolean(source.allowRound ?? defaultDraft.allowRound);
  draft.hidden = Boolean(source.hidden ?? defaultDraft.hidden);
  draft.calculateHidden = Boolean(
    source.calculateHidden ?? defaultDraft.calculateHidden,
  );
  draft.addToSummary = Boolean(
    source.addToSummary ?? defaultDraft.addToSummary,
  );
  draft.required = Boolean(source.required ?? defaultDraft.required);
  draft.fieldCurrency = Boolean(
    source.fieldCurrency ?? defaultDraft.fieldCurrency,
  );
  draft.additionalClasses = String(
    source.additionalStyles || defaultDraft.additionalClasses,
  );
  draft.useCurrencySign = Boolean(
    source.useCurrencySign ?? defaultDraft.useCurrencySign,
  );
  draft.fieldCurrencySettings = syncCurrencySettings(
    source.fieldCurrencySettings || defaultDraft.fieldCurrencySettings,
  );
  draft.pricingStructure =
    (source.pricingStructure as PricingStructure) ||
    defaultDraft.pricingStructure;
  draft.pricingRanges = (
    source.pricingRanges || defaultDraft.pricingRanges
  ).map((r) => ({ ...r }));
  draft.badgeText = String(source.badgeText ?? defaultDraft.badgeText);
  draft.badgeVariant =
    (source.badgeVariant as BadgeVariant) || defaultDraft.badgeVariant;
  draft.badgeFormat =
    (source.badgeFormat as BadgeFormat) || defaultDraft.badgeFormat;
};

watch(
  () => [props.field.alias, restoredVersion.value],
  () => {
    suppressAutoSync(() => syncDraftFromField());
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
@use "@/admin/features/builder/field-settings";

.ccb-pricing-range__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ccb-pricing-range__remove {
  border: none;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ccb-font-labels);
  opacity: 0.6;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }

  i {
    font-size: 14px;
  }
}
</style>
