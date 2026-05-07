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
          <div class="ccb-field-sidebar__row">
            <div class="ccb-field-sidebar__col">
              <Dropdown
                label="Line Size"
                :items="sizeItems"
                v-model="draft.size"
              />
            </div>
            <div class="ccb-field-sidebar__col">
              <Dropdown
                label="Line Style"
                :items="styleItems"
                v-model="draft.style"
              />
            </div>
          </div>
          <div class="ccb-field-sidebar__item">
            <Dropdown
              label="Line Length"
              :items="lengthItems"
              v-model="draft.len"
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
          <div class="ccb-field-sidebar__item">
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
import { reactive, watch } from "vue";
import { Text, Dropdown, Toggle, Textarea } from "@/admin/shared/ui/UIKit";
import type { IField } from "@/admin/shared/types/fields.type";
import { useAutoSyncDraft } from "./useAutoSyncDraft";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();

interface IDividerDraft {
  len: "25%" | "50%" | "100%";
  size: "1px" | "2px" | "4px";
  style: "solid" | "dashed";
  hidden: boolean;
  additionalClasses: string;
}

const draft = reactive<IDividerDraft>({
  len: "25%",
  size: "1px",
  style: "solid",
  hidden: false,
  additionalClasses: "",
});

const sizeItems = [
  { value: "1px", label: "Small" },
  { value: "2px", label: "Medium" },
  { value: "4px", label: "Large" },
];

const styleItems = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
];

const lengthItems = [
  { value: "25%", label: "Short" },
  { value: "50%", label: "Medium" },
  { value: "100%", label: "Long" },
];

const { suppressAutoSync, restoredVersion } = useAutoSyncDraft(
  () => props.field,
  draft,
  { additionalClasses: "additionalStyles" },
);

const syncDraftFromField = (): void => {
  const source = props.field as IField & {
    len?: IDividerDraft["len"];
    size?: IDividerDraft["size"];
    style?: IDividerDraft["style"];
    additionalStyles?: string;
  };

  draft.len = source.len || "25%";
  draft.size = source.size || "1px";
  draft.style = source.style || "solid";
  draft.hidden = Boolean(source.hidden);
  draft.additionalClasses = String(source.additionalStyles || "");
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
