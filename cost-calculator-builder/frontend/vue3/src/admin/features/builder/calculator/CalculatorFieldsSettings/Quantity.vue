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
              placeholder="Placeholder"
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
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Round Value"
              size="m"
              weight="medium"
              v-model="draft.round"
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
              label="Hide Min/Max Values"
              size="m"
              weight="medium"
              v-model="draft.hideMinMax"
            />
          </div>
        </div>

        <div class="ccb-field-sidebar__body" v-if="activeTab === 'variants'">
          <div class="ccb-field-sidebar__item">
            <div
              class="ccb-field-variant"
              :class="{ active: draft.styles.style === 'default' }"
              @click="draft.styles.style = 'default'"
            >
              <div class="ccb-field-variant__check">
                <i class="ccb-icon-ic_check"></i>
              </div>
              <div class="ccb-field-variant__title">
                <Text text="Default" size="s" weight="medium" />
              </div>
              <div class="ccb-field-variant__view">
                <img :src="defaultImage" alt="Default" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <template v-if="activeTab === 'element'">
        <div class="ccb-fields-settings ccb-field-sidebar">
          <div class="ccb-field-sidebar__header">
            <Text text="Properties" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body" style="margin-bottom: 26px">
            <div class="ccb-field-sidebar__row">
              <div class="ccb-field-sidebar__col">
                <Input label="Min Value" placeholder="0" v-model="draft.min" />
              </div>
              <div class="ccb-field-sidebar__col">
                <Input
                  label="Max Value"
                  placeholder="100"
                  v-model="draft.max"
                />
              </div>
            </div>
            <div class="ccb-field-sidebar__row">
              <div class="ccb-field-sidebar__col">
                <Input label="Step" placeholder="1" v-model="draft.step" />
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
                  placeholder="Kg"
                  v-model="draft.sign"
                />
              </div>
              <div class="ccb-field-sidebar__col">
                <Dropdown
                  label="Position"
                  :items="positionItems"
                  v-model="draft.unitPosition"
                />
              </div>
            </div>
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__row">
              <Toggle
                label="Show measurement unit"
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
                      @click="draft.unit = 0"
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
          </div>
        </div>

        <div class="ccb-fields-settings ccb-field-sidebar">
          <div class="ccb-field-sidebar__header">
            <Text text="Measurement Unit" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__item">
              <Toggle
                label="Apply currency settings"
                size="m"
                weight="medium"
                v-model="draft.allowCurrency"
                @change="() => updateToggle('allowCurrency')"
              />
            </div>
            <div class="ccb-field-sidebar__item">
              <Toggle
                label="Use currency sign"
                size="m"
                weight="medium"
                v-model="draft.useCurrencySign"
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
                  :text="`Range ${idx + 1} — from ${idx === 0 ? draft.min : range.minQty}`"
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
                v-model="draft.additionalStyles"
              />
            </div>
          </div>
        </div>
      </template>

      <template v-if="activeTab === 'variants'">
        <div class="ccb-fields-settings ccb-field-sidebar">
          <div class="ccb-field-sidebar__header">
            <Text text="Customize" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__row">
              <div
                class="ccb-field-variant"
                :class="{ active: draft.styles.style === 'buttons' }"
                @click="draft.styles.style = 'buttons'"
              >
                <div class="ccb-field-variant__check">
                  <i class="ccb-icon-ic_check"></i>
                </div>
                <div class="ccb-field-variant__title">
                  <Text
                    :text="
                      draft.buttonsPosition === 'both'
                        ? 'Both Sides'
                        : 'Right Sides'
                    "
                    size="s"
                    weight="medium"
                  />
                </div>
                <div class="ccb-field-variant__view">
                  <img :src="getCurrentImage" alt="Side buttons" />
                </div>
              </div>
            </div>
            <div class="ccb-field-sidebar__row">
              <Tab :items="variantItems" v-model="draft.buttonsPosition" />
            </div>
            <div class="ccb-field-sidebar__row">
              <Toggle
                label="Separation"
                size="m"
                weight="medium"
                v-model="draft.separation"
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
  quantitySettingsDraftDefaults,
  type IQuantitySettingsDraft,
} from "@/admin/shared/defaults/quantity";
import {
  CURRENCY_POSITION_ITEMS,
  DECIMAL_SEPARATOR_ITEMS,
  THOUSANDS_SEPARATOR_ITEMS,
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

import defaultImage from "@/images/fields-variants/quantity/default.png";
import bothButtonsImage from "@/images/fields-variants/quantity/buttons-both.png";
import rightButtonsImage from "@/images/fields-variants/quantity/buttons-right.png";
import rightButtonsSeparationImage from "@/images/fields-variants/quantity/buttons-right-separation.png";
import bothButtonsSeparationImage from "@/images/fields-variants/quantity/buttons-both-separation.png";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();
const settingsStore = useSettingsStore();
const flowStore = useFlowStore();
const defaultDraft = quantitySettingsDraftDefaults();
const appStore = useAppStore();

const draft = reactive<IQuantitySettingsDraft>(quantitySettingsDraftDefaults());

const getCurrentImage = computed(() => {
  const buttonPosition = draft.buttonsPosition || "right";
  const separation = !!draft.separation;

  if (buttonPosition === "both") {
    return separation ? bothButtonsSeparationImage : bothButtonsImage;
  } else if (buttonPosition === "right") {
    return separation ? rightButtonsSeparationImage : rightButtonsImage;
  }

  return defaultImage;
});

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
  () => draft.min,
  () => draft.max,
);

const updateToggle = (key: string): void => {
  if (key === "allowCurrency" && draft.allowCurrency && draft.fieldCurrency) {
    draft.fieldCurrency = false;
  }

  if (key === "fieldCurrency" && draft.fieldCurrency && draft.allowCurrency) {
    draft.allowCurrency = false;
  }
};

watch(
  () => draft.multiply,
  (isMultiply) => {
    if (isMultiply) {
      draft.pricingStructure = "no_discounts";
    }
  },
);

const variantItems = [
  {
    id: "both",
    label: "Both Sides",
  },
  {
    id: "right",
    label: "Right Sides",
  },
];

const fieldTabs = [
  {
    id: "element",
    label: "Element",
  },
  {
    id: "variants",
    label: "Variants",
    isPro: !appStore.getIsPro,
    proBadge: !appStore.getIsPro,
  },
  {
    id: "settings",
    label: "Settings",
  },
];

const activeTab = ref<string>("element");
useFieldWidthSync(() => props.field, draft);
const { suppressAutoSync, restoredVersion } = useAutoSyncDraft(
  () => props.field,
  draft,
  {
    defaultValue: "default",
  },
);

const positionItems = [
  {
    value: "left",
    label: "Left",
  },
  {
    value: "right",
    label: "Right",
  },
];

const syncDraftFromField = () => {
  const source = props.field as IField & {
    min?: number | string;
    max?: number | string;
    step?: number | string;
    default?: number | string;
    required?: boolean;
    buttonsPosition?: IQuantitySettingsDraft["buttonsPosition"] | string;
    separation?: boolean;
    useCurrencySign?: boolean;
    currencySign?: boolean;
    styles?: {
      style?: IQuantitySettingsDraft["styles"]["style"];
    };
    multiply?: boolean;
    unit?: number;
    unitPosition?: IQuantitySettingsDraft["unitPosition"];
    unitSymbol?: string;
    sign?: string;
    addToSummary?: boolean;
    allowCurrency?: boolean;
    round: boolean;
    calculateHidden: boolean;
    hideMinMax: boolean;
    additionalStyles: string;
    fieldCurrency: boolean;
    fieldCurrencySettings: {
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
  draft.label = String(source.label || defaultDraft.label);
  draft.placeholder = String(source.placeholder || defaultDraft.placeholder);
  draft.fieldName = String(source.fieldName || defaultDraft.fieldName);
  draft.placeholder = String(source.placeholder || defaultDraft.placeholder);
  draft.description = String(source.description || defaultDraft.description);
  draft.min = String(source.min ?? defaultDraft.min);
  draft.max = String(source.max ?? defaultDraft.max);
  draft.step = String(source.step ?? defaultDraft.step);
  draft.defaultValue = String(source.default ?? defaultDraft.defaultValue);
  draft.width = clampWidth(source.width || defaultDraft.width);
  draft.required = Boolean(source.required ?? defaultDraft.required);
  draft.hidden = Boolean(source.hidden ?? defaultDraft.hidden);
  draft.styles.style = String(
    source.styles?.style || defaultDraft.styles.style,
  );
  draft.buttonsPosition = (
    source.buttonsPosition === "both"
      ? "both"
      : defaultDraft.buttonsPosition === "both"
        ? "both"
        : "right"
  ) as IQuantitySettingsDraft["buttonsPosition"];
  draft.separation = Boolean(source.separation ?? defaultDraft.separation);
  draft.useCurrencySign = Boolean(
    source.useCurrencySign ?? defaultDraft.useCurrencySign,
  );
  draft.currencySign = Boolean(source.currencySign);
  draft.multiply = Boolean(source.multiply ?? defaultDraft.multiply);
  draft.unit = Number(source.unit ?? defaultDraft.unit);
  draft.unitPosition = source.unitPosition || defaultDraft.unitPosition;
  draft.unitSymbol = String(source.unitSymbol || defaultDraft.unitSymbol);
  draft.sign = String(source.sign || defaultDraft.sign);
  draft.allowCurrency = Boolean(
    source.allowCurrency ?? defaultDraft.allowCurrency,
  );
  draft.addToSummary = Boolean(
    source.addToSummary ?? defaultDraft.addToSummary,
  );
  draft.round = Boolean(source.round);
  draft.calculateHidden = Boolean(
    source.calculateHidden ?? defaultDraft.calculateHidden,
  );
  draft.hideMinMax = Boolean(source.hideMinMax ?? defaultDraft.hideMinMax);
  draft.additionalStyles = String(source.additionalStyles || "");
  draft.fieldCurrency = Boolean(
    source.fieldCurrency ?? defaultDraft.fieldCurrency,
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

<style lang="scss">
@use "@/admin/features/builder/field-settings";

.ccb-fields-settings__content {
  height: calc(100vh - 240px);
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 2px;
}

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
