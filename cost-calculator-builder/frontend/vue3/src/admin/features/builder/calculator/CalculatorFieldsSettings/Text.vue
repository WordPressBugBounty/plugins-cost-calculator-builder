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
        </div>
      </div>

      <div
        v-if="activeTab === 'element'"
        class="ccb-fields-settings ccb-field-sidebar"
      >
        <div class="ccb-field-sidebar__header">
          <Text text="Properties" size="m" weight="bold" />
        </div>
        <div class="ccb-field-sidebar__body">
          <div class="ccb-field-sidebar__item">
            <Input
              label="Max Number Of Characters"
              placeholder="150"
              v-model="draft.numberOfCharacters"
            />
          </div>
        </div>
      </div>

      <div
        v-if="activeTab === 'settings'"
        class="ccb-fields-settings ccb-field-sidebar"
      >
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { Text, Input, Toggle, Textarea, Range } from "@/admin/shared/ui/UIKit";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import type { IField } from "@/admin/shared/types/fields.type";
import { clampWidth } from "./field-settings.constants";
import { useFieldWidthSync } from "./useFieldWidthSync";
import { useAutoSyncDraft } from "./useAutoSyncDraft";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();

const DEFAULT_NUMBER_OF_CHARACTERS = 150;
type TabId = "element" | "settings";

type TextFieldSettings = IField & {
  required?: boolean;
  placeholder?: string;
  numberOfCharacters?: number | string;
  additionalStyles?: string;
};

interface ITextDraft {
  label: string;
  fieldName: string;
  placeholder: string;
  description: string;
  width: number;
  required: boolean;
  hidden: boolean;
  numberOfCharacters: string;
  additionalClasses: string;
}

const draft = reactive<ITextDraft>({
  label: "",
  fieldName: "",
  description: "",
  placeholder: "",
  width: 100,
  required: false,
  hidden: false,
  numberOfCharacters: String(DEFAULT_NUMBER_OF_CHARACTERS),
  additionalClasses: "",
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

const activeTab = ref<TabId>("element");

useFieldWidthSync(() => props.field, draft);

const { suppressAutoSync, restoredVersion } = useAutoSyncDraft(
  () => props.field,
  draft,
  { additionalClasses: "additionalStyles" },
);

const syncDraftFromField = (): void => {
  const source = props.field as TextFieldSettings;

  draft.label = String(source.label || "");
  draft.fieldName = String(source.fieldName || "");
  draft.description = String(source.description || "");
  draft.placeholder = String(source.placeholder || "");
  draft.width = clampWidth(source.width);
  draft.required = Boolean(source.required);
  draft.hidden = Boolean(source.hidden);
  draft.numberOfCharacters = String(
    source.numberOfCharacters ?? DEFAULT_NUMBER_OF_CHARACTERS,
  );
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
