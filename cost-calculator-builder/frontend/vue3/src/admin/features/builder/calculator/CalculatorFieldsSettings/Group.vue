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
        <div class="ccb-field-sidebar__body">
          <div class="ccb-field-sidebar__item">
            <Input
              label="Element name"
              placeholder="Group name"
              v-model="draft.label"
            />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Show Name"
              size="m"
              weight="medium"
              v-model="draft.showTitle"
            />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Make this group collapsible"
              size="m"
              weight="medium"
              v-model="draft.collapsible"
            />
          </div>
          <div class="ccb-field-sidebar__row" v-if="draft.collapsible">
            <Toggle
              label="Collapse this group by default"
              size="m"
              weight="medium"
              v-model="draft.collapse"
            />
          </div>
          <div
            class="ccb-field-sidebar__row"
            style="flex-direction: column"
            v-if="draft.collapsible"
          >
            <Toggle
              label="Accordion Mode"
              size="m"
              weight="medium"
              v-model="draft.accordion"
            />
            <div class="ccb-field-sidebar__row-description">
              <Text
                text="This makes that only one Group element is open at a time, and it is applied to all Group fields in the calculator."
                size="s"
                weight="regular"
              />
            </div>
          </div>
          <div
            class="ccb-field-sidebar__row flex-column"
            style="flex-direction: column"
            v-if="draft.collapsible"
          >
            <Toggle
              label="Show this group based on condition"
              size="m"
              weight="medium"
              v-model="draft.hidden"
            />
            <div class="ccb-field-sidebar__row-description">
              <Text
                text='This makes the group hidden by default. Open "Conditions" tab and create a condition with this field so users can reveal it.'
                size="s"
                weight="regular"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import { Text, Input, Toggle } from "@/admin/shared/ui/UIKit";
import type { IField } from "@/admin/shared/types/fields.type";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { clampWidth } from "./field-settings.constants";
import { useAutoSyncDraft } from "./useAutoSyncDraft";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();

interface IGroupDraft {
  label: string;
  fieldName: string;
  description: string;
  width: number;
  collapsible: boolean;
  collapse: boolean;
  accordion: boolean;
  showTitle: boolean;
  hidden: boolean;
}

const draft = reactive<IGroupDraft>({
  label: "",
  fieldName: "",
  description: "",
  width: 100,
  collapsible: true,
  collapse: false,
  accordion: false,
  showTitle: true,
  hidden: false,
});

const syncDraftFromField = (): void => {
  const source = props.field as IField & {
    collapsible?: boolean;
    collapse?: boolean;
    accordion?: boolean;
    showTitle?: boolean;
  };

  draft.label = String(source.label || "");
  draft.fieldName = String(source.fieldName || "");
  draft.description = String(source.description || "");
  draft.width = clampWidth(source.width);
  draft.collapsible = Boolean(source.collapsible ?? true);
  draft.collapse = Boolean(source.collapse);
  draft.accordion = Boolean(source.accordion);
  draft.showTitle = Boolean(source.showTitle ?? true);
  draft.hidden = Boolean(source.hidden);
};

const { suppressAutoSync, restoredVersion } = useAutoSyncDraft(
  () => props.field,
  draft,
  {},
);

watch(
  () => [props.field.alias, restoredVersion.value],
  () => suppressAutoSync(() => syncDraftFromField()),
  { immediate: true },
);
</script>

<style scoped lang="scss">
@use "@/admin/features/builder/field-settings";

.ccb-field-sidebar {
  &__row-description {
    width: 100%;
    display: flex;
    gap: 8px;
    color: var(--ccb-font-comment);
    padding-left: 54px;
  }
}
</style>
