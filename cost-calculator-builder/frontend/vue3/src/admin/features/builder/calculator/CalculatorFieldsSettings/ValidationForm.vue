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
              label="Element placeholder"
              placeholder="Field label"
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
              label="Show in Grand Total"
              size="m"
              weight="medium"
              v-model="draft.addToSummary"
            />
          </div>
        </div>
      </div>

      <template v-if="activeTab === 'element'">
        <div class="ccb-fields-settings ccb-field-sidebar">
          <div class="ccb-field-sidebar__header">
            <Text text="Validation Settings" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__item">
              <Tab
                :items="fieldTypeItems"
                v-model="draft.fieldType"
                title="Field Type"
              />
            </div>
            <div class="ccb-field-sidebar__item">
              <Input
                label="Default Value"
                placeholder="Enter default value"
                v-model="draft.defaultValue"
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
import { Text, Input, Toggle, Textarea, Range } from "@/admin/shared/ui/UIKit";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import type {
  IField,
  IValidationFormField,
} from "@/admin/shared/types/fields.type";
import { clampWidth } from "./field-settings.constants";
import { useFieldWidthSync } from "./useFieldWidthSync";
import { useAutoSyncDraft } from "./useAutoSyncDraft";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();

interface IValidationFormDraft {
  label: string;
  fieldName: string;
  description: string;
  placeholder: string;
  width: number;
  required: boolean;
  hidden: boolean;
  addToSummary: boolean;
  fieldType: IValidationFormField["field_type"];
  defaultValue: string;
  additionalClasses: string;
}

const draft = reactive<IValidationFormDraft>({
  label: "",
  fieldName: "",
  description: "",
  placeholder: "",
  width: 100,
  required: false,
  hidden: false,
  addToSummary: true,
  fieldType: "email",
  defaultValue: "",
  additionalClasses: "",
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
    fieldType: "field_type",
    defaultValue: "default",
    additionalClasses: "additionalStyles",
  },
);

const fieldTypeItems = [
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "website_url", label: "Link" },
];

const syncDraftFromField = (): void => {
  const source = props.field as IField & {
    required?: boolean;
    addToSummary?: boolean;
    field_type?: IValidationFormField["field_type"];
    default?: string | number;
    additionalStyles?: string;
  };

  draft.label = String(source.label || "");
  draft.fieldName = String(source.fieldName || "");
  draft.description = String(source.description || "");
  draft.width = clampWidth(source.width);
  draft.required = Boolean(source.required);
  draft.hidden = Boolean(source.hidden);
  draft.addToSummary = Boolean(source.addToSummary ?? true);
  draft.fieldType = (source.field_type ||
    "email") as IValidationFormField["field_type"];
  draft.defaultValue = String(source.default || "");
  draft.placeholder = String(source.placeholder || "");
  draft.additionalClasses = String(source.additionalStyles || "");
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
