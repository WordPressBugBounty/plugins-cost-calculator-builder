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
            <Textarea
              label="HTML5 Code"
              height="220px"
              placeholder="Put HTML code here"
              v-model="draft.htmlContent"
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
              label="Hidden by Default"
              size="m"
              weight="medium"
              v-model="draft.hidden"
            />
          </div>
        </div>
      </div>

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
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import type { IField } from "@/admin/shared/types/fields.type";
import { clampWidth } from "./field-settings.constants";
import { useFieldWidthSync } from "./useFieldWidthSync";
import { useAutoSyncDraft } from "./useAutoSyncDraft";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();

interface IHtmlDraft {
  label: string;
  fieldName: string;
  width: number;
  htmlContent: string;
  hidden: boolean;
  additionalClasses: string;
}

const draft = reactive<IHtmlDraft>({
  label: "",
  fieldName: "",
  width: 100,
  htmlContent: "",
  hidden: false,
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
  { additionalClasses: "additionalStyles" },
);

const syncDraftFromField = (): void => {
  const source = props.field as IField & {
    htmlContent?: string;
    additionalStyles?: string;
  };

  draft.label = String(source.label || "");
  draft.fieldName = String(source.fieldName || "");
  draft.width = clampWidth(source.width);
  draft.htmlContent = String(source.htmlContent || "");
  draft.hidden = Boolean(source.hidden);
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
