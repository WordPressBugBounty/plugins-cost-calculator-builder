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
                  label="Default Left Value"
                  placeholder="0"
                  v-model="draft.defaultLeft"
                />
              </div>
            </div>
            <div class="ccb-field-sidebar__row">
              <div class="ccb-field-sidebar__col">
                <Input
                  label="Default Right Value"
                  placeholder="100"
                  v-model="draft.defaultRight"
                />
              </div>
              <div class="ccb-field-sidebar__col">
                <Input
                  label="Unit Name"
                  placeholder="kg"
                  v-model="draft.sign"
                />
              </div>
            </div>
            <div class="ccb-field-sidebar__row">
              <div class="ccb-field-sidebar__col">
                <Dropdown
                  label="Position"
                  :items="UNIT_POSITION_ITEMS"
                  v-model="draft.unitPosition"
                />
              </div>
              <div class="ccb-field-sidebar__col">
                <Input
                  label="Slider Scale Points"
                  placeholder="7.5,10,13.5"
                  v-model="draft.scalePoints"
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
import { reactive, watch, ref } from "vue";
import {
  Text,
  Input,
  Dropdown,
  Toggle,
  Textarea,
  Range,
} from "@/admin/shared/ui/UIKit";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import type { IField } from "@/admin/shared/types/fields.type";
import {
  CURRENCY_POSITION_ITEMS,
  DECIMAL_SEPARATOR_ITEMS,
  THOUSANDS_SEPARATOR_ITEMS,
  UNIT_POSITION_ITEMS,
  clampWidth,
  syncCurrencySettings,
  EMPTY_CURRENCY_SETTINGS,
} from "./field-settings.constants";
import { useFieldWidthSync } from "./useFieldWidthSync";
import { useAutoSyncDraft } from "./useAutoSyncDraft";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import defaultImage from "@/images/fields-variants/multi-range/default.png";
import smallImage from "@/images/fields-variants/multi-range/Small.png";
import flatMinimalImage from "@/images/fields-variants/multi-range/flat-minimal.png";
import modernImage from "@/images/fields-variants/multi-range/Modern.png";
import inputImage from "@/images/fields-variants/multi-range/Input.png";
import multiPointImage from "@/images/fields-variants/multi-range/MultiPoint.png";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();
const appStore = useAppStore();

interface IMultiRangeDraft {
  label: string;
  fieldName: string;
  description: string;
  width: number;
  minValue: string;
  maxValue: string;
  step: string;
  defaultLeft: string;
  defaultRight: string;
  sign: string;
  unitPosition: "left" | "right";
  multiply: boolean;
  unit: string;
  unitSymbol: string;
  multipliedTotal: boolean;
  jump: boolean;
  scalePoints: string;
  style:
    | "default"
    | "small"
    | "flat-minimal"
    | "modern"
    | "input"
    | "multi-point";
  allowCurrency: boolean;
  allowRound: boolean;
  hidden: boolean;
  calculateHidden: boolean;
  addToSummary: boolean;
  required: boolean;
  fieldCurrency: boolean;
  additionalClasses: string;
  useCurrencySign: boolean;
  fieldCurrencySettings: {
    currency: string;
    currencyPosition: string;
    thousands_separator: string;
    num_after_integer: number;
    decimal_separator: string;
  };
}

const draft = reactive<IMultiRangeDraft>({
  label: "",
  fieldName: "",
  description: "",
  width: 100,
  minValue: "0",
  maxValue: "100",
  step: "1",
  defaultLeft: "0",
  defaultRight: "50",
  sign: "",
  unitPosition: "right",
  multiply: false,
  unit: "1",
  unitSymbol: "",
  multipliedTotal: false,
  jump: false,
  scalePoints: "",
  style: "default",
  allowCurrency: false,
  allowRound: false,
  hidden: false,
  calculateHidden: false,
  addToSummary: true,
  required: false,
  fieldCurrency: false,
  additionalClasses: "",
  useCurrencySign: false,
  fieldCurrencySettings: { ...EMPTY_CURRENCY_SETTINGS },
});

const fieldTabs = [
  { id: "element", label: "Element" },
  { id: "variants", label: "Variants", isPro: !appStore.getIsPro },
  { id: "settings", label: "Settings" },
];

const activeTab = ref<string>("element");
useFieldWidthSync(() => props.field, draft);
const { suppressAutoSync, restoredVersion } = useAutoSyncDraft(
  () => props.field,
  draft,
  {
    additionalClasses: "additionalStyles",
    defaultLeft: "default_left",
    defaultRight: "default_right",
    style: "styles.style",
  },
);

type MultiRangeStyle = IMultiRangeDraft["style"];

const styleItems: Array<{
  value: MultiRangeStyle;
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
    default_left?: number | string;
    default_right?: number | string;
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
    useCurrencySign?: boolean;
    styles?: {
      style?: IMultiRangeDraft["style"];
    };
    additionalStyles?: string;
    fieldCurrencySettings?: {
      currency: string;
      currencyPosition: string;
      thousands_separator: string;
      num_after_integer: number;
      decimal_separator: string;
    };
  };

  draft.label = String(source.label || "");
  draft.fieldName = String(source.fieldName || "");
  draft.description = String(source.description || "");
  draft.width = clampWidth(source.width || 100);
  draft.minValue = String(source.minValue ?? 0);
  draft.maxValue = String(source.maxValue ?? 100);
  draft.step = String(source.step ?? 1);
  draft.defaultLeft = String(source.default_left ?? 0);
  draft.defaultRight = String(source.default_right ?? 50);
  draft.sign = String(source.sign || "");
  draft.unitPosition = source.unitPosition || "right";
  draft.multiply = Boolean(source.multiply);
  draft.unit = String(source.unit ?? 1);
  draft.unitSymbol = String(source.unitSymbol || "");
  draft.multipliedTotal = Boolean(source.multipliedTotal);
  draft.jump = Boolean(source.jump);
  draft.scalePoints = String(source.scalePoints || "");
  draft.style = source.styles?.style || "default";
  draft.allowCurrency = Boolean(source.allowCurrency);
  draft.allowRound = Boolean(source.allowRound);
  draft.hidden = Boolean(source.hidden);
  draft.calculateHidden = Boolean(source.calculateHidden);
  draft.addToSummary = Boolean(source.addToSummary);
  draft.required = Boolean(source.required);
  draft.fieldCurrency = Boolean(source.fieldCurrency);
  draft.additionalClasses = String(source.additionalStyles || "");
  draft.useCurrencySign = Boolean(source.useCurrencySign);
  draft.fieldCurrencySettings = syncCurrencySettings(
    source.fieldCurrencySettings,
  );
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
</style>
