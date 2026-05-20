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
          <div class="ccb-field-sidebar__row">
            <div class="ccb-field-sidebar__col">
              <Input
                label="Hours"
                placeholder="hh"
                :only-digits="true"
                v-model="placeholderHours"
              />
            </div>
            <div class="ccb-field-sidebar__col">
              <Input
                label="Minutes"
                placeholder="mm"
                :only-digits="true"
                v-model="placeholderMinutes"
              />
            </div>
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
            <Dropdown label="Mode" :items="rangeItems" v-model="draft.range" />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="24-hour format"
              size="m"
              weight="medium"
              v-model="draft.format"
            />
          </div>
          <div class="ccb-field-sidebar__row" v-if="draft.range === '1'">
            <Toggle
              label="Set minimum interval"
              size="m"
              weight="medium"
              v-model="draft.useInterval"
            />
          </div>
          <div
            class="ccb-field-sidebar__item"
            v-if="draft.useInterval && draft.range === '1'"
          >
            <Input
              label="Min interval"
              placeholder="1h"
              v-model="draft.minInterval"
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
              label="Show in Grand Total"
              size="m"
              weight="medium"
              v-model="draft.addToSummary"
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
import { computed, reactive, watch, ref } from "vue";
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
import { clampWidth } from "./field-settings.constants";
import { useFieldWidthSync } from "./useFieldWidthSync";
import { useAutoSyncDraft } from "./useAutoSyncDraft";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();

interface ITimePickerDraft {
  label: string;
  required: boolean;
  fieldName: string;
  description: string;
  width: number;
  range: "0" | "1";
  placeholderHours: string;
  placeholderTime: string;
  format: boolean;
  addToSummary: boolean;
  useInterval: boolean;
  minInterval: string;
  minIntervalMinutes: string;
  hidden: boolean;
  additionalClasses: string;
}

const draft = reactive<ITimePickerDraft>({
  label: "",
  required: false,
  fieldName: "",
  description: "",
  width: 100,
  range: "0",
  placeholderHours: "",
  placeholderTime: "",
  format: false,
  addToSummary: true,
  useInterval: false,
  minInterval: "1h",
  minIntervalMinutes: "60",
  hidden: false,
  additionalClasses: "",
});

const fieldTabs = [
  { id: "element", label: "Element" },
  { id: "settings", label: "Settings" },
];

const activeTab = ref<string>("element");
const maxMinutes = 60;

const normalizeHours = (
  value: string | number,
  is24HourFormat = draft.format,
): string => {
  const digits = String(value).replace(/\D+/g, "");
  const maxHours = is24HourFormat ? 24 : 12;

  return digits ? String(Math.min(Number(digits), maxHours)) : "";
};

const normalizeMinutes = (value: string | number): string => {
  const digits = String(value).replace(/\D+/g, "");
  return digits ? String(Math.min(Number(digits), maxMinutes)) : "";
};

const placeholderHours = computed({
  get: () => draft.placeholderHours,
  set: (value: string | number) => {
    draft.placeholderHours = normalizeHours(value);
  },
});

const placeholderMinutes = computed({
  get: () => draft.placeholderTime,
  set: (value: string | number) => {
    draft.placeholderTime = normalizeMinutes(value);
  },
});

useFieldWidthSync(() => props.field, draft);

const { suppressAutoSync, restoredVersion } = useAutoSyncDraft(
  () => props.field,
  draft,
  {
    useInterval: "use_interval",
    minInterval: "min_interval",
    minIntervalMinutes: "min_interval_minutes",
    additionalClasses: "additionalStyles",
  },
);

const rangeItems = [
  { value: "0", label: "Single Time" },
  { value: "1", label: "Time Range" },
];

const syncDraftFromField = (): void => {
  const source = props.field as IField & {
    required?: boolean;
    range?: string | boolean;
    placeholderHours?: string;
    placeholderTime?: string;
    format?: boolean;
    addToSummary?: boolean;
    min_interval?: string;
    min_interval_minutes?: number | string;
    use_interval?: boolean;
    additionalStyles?: string;
  };

  draft.label = String(source.label || "");
  draft.required = Boolean(source.required);
  draft.fieldName = String(source.fieldName || "");
  draft.description = String(source.description || "");
  draft.width = clampWidth(source.width);
  draft.range =
    String(source.range ?? "0") === "1" || source.range === true ? "1" : "0";
  draft.format = Boolean(source.format);
  draft.placeholderHours = normalizeHours(source.placeholderHours || "");
  draft.placeholderTime = normalizeMinutes(source.placeholderTime || "");
  draft.addToSummary = Boolean(source.addToSummary);
  draft.useInterval = Boolean(source.use_interval);
  draft.minInterval = String(source.min_interval || "1h");
  draft.minIntervalMinutes = String(source.min_interval_minutes ?? 60);
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

watch(
  () => draft.format,
  () => {
    draft.placeholderHours = normalizeHours(draft.placeholderHours);
  },
);
</script>

<style scoped lang="scss">
@use "@/admin/features/builder/field-settings";
</style>
