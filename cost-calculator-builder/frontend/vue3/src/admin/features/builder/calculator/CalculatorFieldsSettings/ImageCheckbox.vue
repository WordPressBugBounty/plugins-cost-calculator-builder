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

          <div class="ccb-field-sidebar__item">
            <Tab
              :items="ELEMENT_COLUMNS_ITEMS"
              v-model="draft.elementColumns"
              title="Element Columns"
            />
          </div>
        </div>

        <div class="ccb-field-sidebar__body" v-if="activeTab === 'variants'">
          <div class="ccb-field-sidebar__row">
            <div
              class="ccb-field-variant"
              :class="{ active: draft.style === 'default' }"
              @click="draft.style = 'default'"
            >
              <div class="ccb-field-variant__check">
                <i class="ccb-icon-ic_check"></i>
              </div>
              <div class="ccb-field-variant__title">
                <Text :text="'Default'" size="s" weight="medium" />
              </div>
              <div
                class="ccb-field-variant__view"
                style="display: flex; justify-content: center"
              >
                <img :src="defaultImage" alt="Default" style="width: 130px" />
              </div>
            </div>
          </div>
          <div class="ccb-field-sidebar__row">
            <div
              class="ccb-field-variant"
              :class="{ active: draft.style === 'with-icon' }"
              @click="draft.style = 'with-icon'"
            >
              <div class="ccb-field-variant__check">
                <i class="ccb-icon-ic_check"></i>
              </div>
              <div class="ccb-field-variant__title">
                <Text :text="'With Icon'" size="s" weight="medium" />
              </div>
              <div class="ccb-field-variant__view">
                <img :src="withIconImage" alt="With Icon" />
              </div>
            </div>
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Apply this checkbox style to all checkbox fields in this calculator"
              size="m"
              weight="medium"
              v-model="draft.applyStyleForAll"
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
              label="Show value in element (form)"
              size="m"
              weight="medium"
              v-model="draft.showValueInOption"
            />
          </div>
        </div>
      </div>

      <template v-if="activeTab === 'element'">
        <div class="ccb-fields-settings ccb-field-sidebar">
          <div class="ccb-field-sidebar__header">
            <Text text="Options" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__item">
              <OptionsAccordionRepeater
                v-model="draft.options"
                addButtonLabel="Add Option"
                :showHint="false"
                :showImage="true"
                name="imageCheckboxOptions"
              />
            </div>
            <div class="ccb-field-sidebar__item">
              <Notice type="success">
                You can find all the necessary icons in SVG format on
                <a href="https://iconscout.com/" target="_blank"
                  >iconscout.com</a
                >
                or other services.
                <a href="https://iconscout.com/" target="_blank"
                  >Find out more.</a
                >
              </Notice>
            </div>
            <div class="ccb-field-sidebar__item">
              <MultiSelect
                label="Default Value(s)"
                placeholder="Select default values"
                :items="defaultValueItems"
                v-model="draft.defaultValues"
              />
            </div>
            <div class="ccb-field-sidebar__item">
              <Dropdown
                label="Type of Label in Total"
                :items="SUMMARY_VIEW_ITEMS"
                v-model="draft.summaryView"
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
            <Text text="Selection Limits" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__item">
              <Input
                label="Number of Options to Select"
                placeholder="0"
                v-model="draft.checkedLength"
              />
            </div>
          </div>
        </div>

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
  Toggle,
  Textarea,
  Dropdown,
  MultiSelect,
  Range,
  OptionsAccordionRepeater,
  Notice,
} from "@/admin/shared/ui/UIKit";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import type {
  IField,
  IOptions,
  SummaryView,
} from "@/admin/shared/types/fields.type";
import {
  CURRENCY_POSITION_ITEMS,
  DECIMAL_SEPARATOR_ITEMS,
  THOUSANDS_SEPARATOR_ITEMS,
  SUMMARY_VIEW_ITEMS,
  ELEMENT_COLUMNS_ITEMS,
  clampWidth,
  syncCurrencySettings,
} from "./field-settings.constants";
import { useFieldWidthSync } from "./useFieldWidthSync";
import { useAutoSyncDraft } from "./useAutoSyncDraft";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import defaultImage from "@/images/fields-variants/checkbox-img/default.png";
import withIconImage from "@/images/fields-variants/checkbox-img/box.png";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();
const appStore = useAppStore();

interface IImageCheckboxOption {
  src: string;
  icon?: string;
  optionText: string;
  optionValue: string;
  optionHint?: string;
  optionConverted?: string;
}

interface IImageCheckboxDraft {
  label: string;
  fieldName: string;
  description: string;
  width: number;
  required: boolean;
  hidden: boolean;
  allowCurrency: boolean;
  allowRound: boolean;
  calculateHidden: boolean;
  addToSummary: boolean;
  showValueInOption: boolean;
  fieldCurrency: boolean;
  summaryView: SummaryView;
  defaultValues: string[];
  options: IImageCheckboxOption[];
  checkedLength: string;
  additionalClasses: string;
  elementColumns: string;
  style: "default" | "with-icon";
  applyStyleForAll: boolean;
  fieldCurrencySettings: {
    currency: string;
    currencyPosition: string;
    thousands_separator: string;
    num_after_integer: number;
    decimal_separator: string;
  };
}

const draft = reactive<IImageCheckboxDraft>({
  label: "",
  fieldName: "",
  description: "",
  width: 100,
  required: false,
  hidden: false,
  allowCurrency: false,
  allowRound: false,
  calculateHidden: false,
  addToSummary: true,
  showValueInOption: true,
  fieldCurrency: false,
  summaryView: "show_value",
  defaultValues: [],
  options: [
    { src: "", optionText: "Option 1", optionValue: "10" },
    { src: "", optionText: "Option 2", optionValue: "20" },
    { src: "", optionText: "Option 3", optionValue: "30" },
    { src: "", optionText: "Option 4", optionValue: "40" },
  ],
  checkedLength: "0",
  additionalClasses: "",
  elementColumns: "4",
  style: "default",
  applyStyleForAll: false,
  fieldCurrencySettings: {
    currency: "",
    currencyPosition: "",
    thousands_separator: "",
    num_after_integer: 0,
    decimal_separator: "",
  },
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
    summaryView: "summary_view",
    showValueInOption: "show_value_in_option",
    applyStyleForAll: "apply_style_for_all",
    elementColumns: "styles.elementColumns",
    defaultValues: "default",
    style: "styles.style",
  },
);

const defaultValueItems = computed(() =>
  draft.options
    .map((option, index) => {
      const value = String(option.optionValue || "");
      if (!value) return null;
      return {
        value: `${value}_${index}`,
        label: String(option.optionText || value),
      };
    })
    .filter((item): item is { value: string; label: string } => item !== null),
);

const normalizeOptions = (options: unknown): IImageCheckboxOption[] => {
  if (!Array.isArray(options) || options.length === 0) {
    return [
      { src: "", optionText: "Option 1", optionValue: "10" },
      { src: "", optionText: "Option 2", optionValue: "20" },
      { src: "", optionText: "Option 3", optionValue: "30" },
      { src: "", optionText: "Option 4", optionValue: "40" },
    ];
  }

  const mapped = options.map((option) => {
    const source = option as IOptions;
    return {
      src: String(source.src || ""),
      icon: source.icon,
      optionText: String(source.optionText || ""),
      optionValue: String(source.optionValue || ""),
      optionHint: String(source.optionHint || ""),
      optionConverted: source.optionConverted,
    };
  });

  return mapped.length
    ? mapped
    : [
        { src: "", optionText: "Option 1", optionValue: "10" },
        { src: "", optionText: "Option 2", optionValue: "20" },
        { src: "", optionText: "Option 3", optionValue: "30" },
        { src: "", optionText: "Option 4", optionValue: "40" },
      ];
};

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
    required?: boolean;
    allowCurrency?: boolean;
    allowRound?: boolean;
    calculateHidden?: boolean;
    addToSummary?: boolean;
    show_value_in_option?: boolean;
    fieldCurrency?: boolean;
    checkedLength?: number;
    summary_view?: SummaryView;
    default?: string | number;
    options?: IOptions[];
    additionalStyles?: string;
    apply_style_for_all?: boolean;
    fieldCurrencySettings?: {
      currency: string;
      currencyPosition: string;
      thousands_separator: string;
      num_after_integer: number;
      decimal_separator: string;
    };
    styles?: {
      elementColumns?: string;
      style?: "default" | "with-icon";
    };
  };

  draft.label = String(source.label || "");
  draft.fieldName = String(source.fieldName || "");
  draft.description = String(source.description || "");
  draft.width = clampWidth(source.width || 100);
  draft.required = Boolean(source.required);
  draft.hidden = Boolean(source.hidden);
  draft.allowCurrency = Boolean(source.allowCurrency);
  draft.allowRound = Boolean(source.allowRound);
  draft.calculateHidden = Boolean(source.calculateHidden);
  draft.addToSummary = Boolean(source.addToSummary);
  draft.showValueInOption = Boolean(source.show_value_in_option ?? true);
  draft.fieldCurrency = Boolean(source.fieldCurrency);
  draft.checkedLength = String(source.checkedLength ?? 0);
  draft.summaryView = (source.summary_view || "show_value") as SummaryView;
  draft.defaultValues = String(source.default || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  draft.options.splice(
    0,
    draft.options.length,
    ...normalizeOptions(source.options),
  );
  draft.additionalClasses = String(source.additionalStyles || "");
  draft.applyStyleForAll = Boolean(source.apply_style_for_all);
  draft.elementColumns = source.styles?.elementColumns || "1";
  draft.style = source.styles?.style || "default";
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
