<template>
  <div class="ccb-fields-settings-container ccb-custom-scrollbar">
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
      <div class="ccb-field-sidebar__body">
        <div class="ccb-field-sidebar__item">
          <Input
            label="Element name"
            placeholder="Repeater name"
            v-model="draft.label"
          />
        </div>
        <div class="ccb-field-sidebar__item">
          <Input
            label="Add Button Label"
            placeholder="Add another"
            v-model="draft.addButtonLabel"
          />
        </div>
        <div class="ccb-field-sidebar__item">
          <Input
            label="Remove Button Label"
            placeholder="Remove"
            v-model="draft.removeButtonLabel"
          />
        </div>
        <div class="ccb-field-sidebar__item">
          <Input
            label="Repeat Count"
            placeholder="3"
            v-model="draft.repeatCount"
          />
        </div>
        <div class="ccb-field-sidebar__item">
          <FormulaBuilder
            v-model="draft.costCalcFormula"
            :availableFields="availableFields"
            :fieldAlias="field.alias"
            v-if="draft.enableFormula"
          />
        </div>
        <div class="ccb-field-sidebar__row">
          <Toggle
            label="Use Formula"
            size="m"
            weight="medium"
            v-model="draft.enableFormula"
            @change="() => updateToggle('enableFormula')"
          />
        </div>
        <div class="ccb-field-sidebar__row">
          <Toggle
            label="Sum Up All Fields"
            size="m"
            weight="medium"
            v-model="draft.sumAllAvailable"
            @change="() => updateToggle('sumAllAvailable')"
          />
        </div>

        <div class="ccb-field-sidebar__row">
          <Toggle
            label="Collapse on Add Another"
            size="m"
            weight="medium"
            v-model="draft.collapseOnAddAnother"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from "vue";
import { Text, Input, Toggle } from "@/admin/shared/ui/UIKit";
import type { IField } from "@/admin/shared/types/fields.type";
import FormulaBuilder from "../formula/FormulaBuilder.vue";
import { useRepeaterFormulaAliases } from "../formula/useFormulaAliases";
import { useAutoSyncDraft } from "./useAutoSyncDraft";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();
const repeaterAliasRef = computed(() => props.field.alias);
const { availableFields } = useRepeaterFormulaAliases(repeaterAliasRef);

interface IRepeaterDraft {
  label: string;
  fieldName: string;
  addButtonLabel: string;
  removeButtonLabel: string;
  repeatCount: string;
  enableFormula: boolean;
  costCalcFormula: string;
  sumAllAvailable: boolean;
  collapseOnAddAnother: boolean;
}

const draft = reactive<IRepeaterDraft>({
  label: "",
  fieldName: "",
  addButtonLabel: "Add another",
  removeButtonLabel: "Remove",
  repeatCount: "3",
  enableFormula: false,
  costCalcFormula: "",
  sumAllAvailable: true,
  collapseOnAddAnother: false,
});

const syncDraftFromField = (): void => {
  const source = props.field as IField & {
    addButtonLabel?: string;
    removeButtonLabel?: string;
    repeatCount?: string | number;
    enableFormula?: boolean;
    costCalcFormula?: string;
    sumAllAvailable?: boolean;
    collapseOnAddAnother?: boolean;
  };

  draft.label = String(source.label || "");
  draft.fieldName = String(source.fieldName || "");
  draft.addButtonLabel = String(source.addButtonLabel || "Add another");
  draft.removeButtonLabel = String(source.removeButtonLabel || "Remove");
  draft.repeatCount = String(source.repeatCount ?? "3");
  draft.enableFormula = Boolean(source.enableFormula);
  draft.costCalcFormula = String(source.costCalcFormula || "");
  draft.sumAllAvailable = Boolean(source.sumAllAvailable ?? true);
  draft.collapseOnAddAnother = Boolean(source.collapseOnAddAnother ?? false);
};

const { suppressAutoSync, restoredVersion } = useAutoSyncDraft(
  () => props.field,
  draft,
);

const updateToggle = (key: string): void => {
  if (key === "enableFormula") {
    draft.sumAllAvailable = !draft.enableFormula;
  } else {
    draft.enableFormula = !draft.sumAllAvailable;
  }
};

watch(
  () => [props.field.alias, restoredVersion.value],
  () => suppressAutoSync(() => syncDraftFromField()),
  { immediate: true },
);
</script>

<style scoped lang="scss">
@use "@/admin/features/builder/field-settings";
</style>
