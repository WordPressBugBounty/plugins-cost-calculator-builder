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
          <div class="ccb-field-sidebar__item" v-if="!draft.formulaView">
            <div v-if="formulaErrors.length" class="ccb-formula-errors">
              <p
                v-for="(error, idx) in formulaErrors"
                :key="idx"
                class="ccb-formula-error-message"
              >
                {{ error }}
              </p>
            </div>
            <FormulaBuilder
              v-model="draft.costCalcFormula"
              :availableFields="availableFields"
              :fieldAlias="field.alias"
              @validation-change="onFormulaValidationChange"
            />
          </div>
          <div class="ccb-field-sidebar__item" v-else>
            <FormulaBuilderLegacy
              v-model="draft.legacyFormula"
              :availableFields="availableFields"
              :fieldAlias="field.alias"
            />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Legacy Formula View"
              size="m"
              weight="medium"
              v-model="draft.formulaView"
            />
          </div>
        </div>

        <div class="ccb-field-sidebar__body" v-if="activeTab === 'settings'">
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
              label="Advanced calculations"
              size="m"
              weight="medium"
              v-model="draft.advancedJsCalculation"
            />
            <Tooltip
              text="Enable for advanced calculations using JavaScript-based formulas. With over 9 totals, performance may slow. Disable for faster basic calculations."
              placement="top"
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
        </div>
      </div>

      <template v-if="activeTab === 'element'">
        <div class="ccb-fields-settings ccb-field-sidebar">
          <div class="ccb-field-sidebar__header">
            <Text text="Measurement Unit" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__item">
              <Toggle
                label="Set measurement unit"
                size="m"
                weight="medium"
                placeholder="Kg"
                v-model="draft.fieldCurrency"
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
  Tooltip,
} from "@/admin/shared/ui/UIKit";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import type { IField } from "@/admin/shared/types/fields.type";
import {
  CURRENCY_POSITION_ITEMS,
  DECIMAL_SEPARATOR_ITEMS,
  THOUSANDS_SEPARATOR_ITEMS,
  syncCurrencySettings,
} from "./field-settings.constants";
import FormulaBuilder from "../formula/FormulaBuilder.vue";
import FormulaBuilderLegacy from "../formula/FormulaBuilderLegacy.vue";
import { useFormulaAliases } from "../formula/useFormulaAliases";
import { useAutoSyncDraft } from "./useAutoSyncDraft";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();

const fieldAliasRef = computed(() => props.field.alias);
const isTotalRef = computed(
  () => props.field.alias?.includes("total") ?? false,
);
const { availableFields } = useFormulaAliases(fieldAliasRef, isTotalRef);

const formulaErrors = ref<string[]>([]);

interface IFormulaDraft {
  label: string;
  fieldName: string;
  description: string;
  costCalcFormula: string;
  legacyFormula: string;
  formulaView: boolean;
  hidden: boolean;
  advancedJsCalculation: boolean;
  calculateHidden: boolean;
  fieldCurrency: boolean;
  useCurrencySign: boolean;
  fieldCurrencySettings: {
    currency: string;
    currencyPosition: string;
    thousands_separator: string;
    num_after_integer: number;
    decimal_separator: string;
  };
  additionalClasses: string;
}

const draft = reactive<IFormulaDraft>({
  label: "",
  fieldName: "",
  description: "",
  costCalcFormula: "",
  legacyFormula: "",
  formulaView: false,
  hidden: false,
  advancedJsCalculation: false,
  calculateHidden: false,
  fieldCurrency: false,
  useCurrencySign: false,
  fieldCurrencySettings: {
    currency: "",
    currencyPosition: "",
    thousands_separator: "",
    num_after_integer: 0,
    decimal_separator: "",
  },
  additionalClasses: "",
});

const fieldTabs = [
  { id: "element", label: "Element" },
  { id: "settings", label: "Settings" },
];

const activeTab = ref<string>("element");

const onFormulaValidationChange = (errors: string[]): void => {
  formulaErrors.value = errors;
  builderStore.setFormulaValidationErrors(props.field.alias, errors);
};

const clearFormulaValidationErrors = (): void => {
  formulaErrors.value = [];
  builderStore.clearFormulaValidationErrors(props.field.alias);
};

const syncDraftFromField = (): void => {
  const source = props.field as IField & {
    costCalcFormula?: string;
    legacyFormula?: string;
    formulaView?: boolean;
    advancedJsCalculation?: boolean;
    calculateHidden?: boolean;
    fieldCurrency?: boolean;
    useCurrencySign?: boolean;
    fieldCurrencySettings?: {
      currency: string;
      currencyPosition: string;
      thousands_separator: string;
      num_after_integer: number;
      decimal_separator: string;
    };
    additionalStyles?: string;
  };

  draft.label = String(source.label || "");
  draft.fieldName = String(source.fieldName || "");
  draft.description = String(source.description || "");
  draft.costCalcFormula = String(source.costCalcFormula || "");
  draft.legacyFormula = String(source.legacyFormula || "");
  draft.formulaView = Boolean(source.formulaView);
  draft.hidden = Boolean(source.hidden);
  draft.advancedJsCalculation = Boolean(source.advancedJsCalculation);
  draft.calculateHidden = Boolean(source.calculateHidden);
  draft.fieldCurrency = Boolean(source.fieldCurrency);
  draft.additionalClasses = String(source.additionalStyles || "");
  draft.useCurrencySign = Boolean(source.useCurrencySign);
  draft.fieldCurrencySettings = syncCurrencySettings(
    source.fieldCurrencySettings,
  );
};

const { suppressAutoSync, restoredVersion } = useAutoSyncDraft(
  () => props.field,
  draft,
  { additionalClasses: "additionalStyles" },
);

watch(
  () => [props.field.alias, restoredVersion.value],
  () => {
    suppressAutoSync(() => syncDraftFromField());
    formulaErrors.value =
      builderStore.getFormulaValidationErrors[props.field.alias] || [];
  },
  { immediate: true },
);

watch(
  () => draft.formulaView,
  (isLegacyFormulaView) => {
    if (isLegacyFormulaView) {
      clearFormulaValidationErrors();
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
@use "@/admin/features/builder/field-settings";

.ccb-formula-errors {
  margin-top: 6px;
}

.ccb-formula-error-message {
  color: #d94141;
  font-size: 12px;
  font-weight: 500;
  margin: 2px 0;
}
</style>
