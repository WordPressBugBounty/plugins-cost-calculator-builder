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
                name="dropdownOptions"
              />
            </div>
          </div>
        </div>

        <div class="ccb-fields-settings ccb-field-sidebar">
          <div class="ccb-field-sidebar__header">
            <Text text="Default Settings" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__item">
              <Dropdown
                label="Default Value"
                :items="defaultValueItems"
                v-model="draft.default"
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
  Range,
  OptionsAccordionRepeater,
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

interface IDropdownDraft {
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
  summaryView: SummaryView;
  default: string;
  options: IOptions[];
  additionalClasses: string;
  fieldCurrency: boolean;
  fieldCurrencySettings: {
    currency: string;
    currencyPosition: string;
    thousands_separator: string;
    num_after_integer: number;
    decimal_separator: string;
  };
}

const draft = reactive<IDropdownDraft>({
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
  summaryView: "show_value",
  default: "",
  options: [
    { optionText: "Option 1", optionValue: "10" },
    { optionText: "Option 2", optionValue: "20" },
    { optionText: "Option 3", optionValue: "30" },
    { optionText: "Option 4", optionValue: "40" },
  ],
  additionalClasses: "",
  fieldCurrency: false,
  fieldCurrencySettings: {
    currency: "",
    currencyPosition: "",
    thousands_separator: "",
    num_after_integer: 0,
    decimal_separator: "",
  },
});

const fieldTabs = [
  {
    id: "element",
    label: "Element",
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
    additionalClasses: "additionalStyles",
    summaryView: "summary_view",
    showValueInOption: "show_value_in_option",
  },
);

const defaultValueItems = computed(() => {
  const items = [{ value: "", label: "Not selected" }];
  draft.options.forEach((option, index) => {
    const value = String(option.optionValue || "");
    if (!value) return;
    items.push({
      value: `${value}_${index}`,
      label: String(option.optionText || value),
    });
  });
  return items;
});

const flattenOptions = (options: unknown): IOptions[] => {
  if (!Array.isArray(options)) return [];

  return options.flatMap((option) =>
    Array.isArray(option) ? flattenOptions(option) : [option as IOptions],
  );
};

const normalizeOptions = (options: unknown): IOptions[] => {
  const list = flattenOptions(options);

  if (list.length === 0) {
    return [
      { optionText: "Option 1", optionValue: "10" },
      { optionText: "Option 2", optionValue: "20" },
      { optionText: "Option 3", optionValue: "30" },
      { optionText: "Option 4", optionValue: "40" },
    ];
  }

  const mapped = list
    .map((option) => {
      const source = option as IOptions;
      return {
        optionText: String(source.optionText || "").trim(),
        optionValue: String(source.optionValue || "").trim(),
      };
    })
    .filter(
      (option) => option.optionText.length > 0 || option.optionValue.length > 0,
    );

  return mapped.length
    ? mapped
    : [
        { optionText: "Option 1", optionValue: "10" },
        { optionText: "Option 2", optionValue: "20" },
        { optionText: "Option 3", optionValue: "30" },
        { optionText: "Option 4", optionValue: "40" },
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
    summary_view?: SummaryView;
    default?: string | number;
    options?: IOptions[];
    show_value_in_option?: boolean;
    additionalStyles?: string;
    fieldCurrency?: boolean;
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
  draft.required = Boolean(source.required);
  draft.hidden = Boolean(source.hidden);
  draft.allowCurrency = Boolean(source.allowCurrency);
  draft.allowRound = Boolean(source.allowRound);
  draft.calculateHidden = Boolean(source.calculateHidden);
  draft.addToSummary = Boolean(source.addToSummary);
  draft.showValueInOption = Boolean(source.show_value_in_option ?? true);
  draft.summaryView = (source.summary_view || "show_value") as SummaryView;
  draft.default = String(source.default || "");
  draft.options.splice(
    0,
    draft.options.length,
    ...normalizeOptions(source.options),
  );
  draft.additionalClasses = String(source.additionalStyles || "");
  draft.fieldCurrency = Boolean(source.fieldCurrency);
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
