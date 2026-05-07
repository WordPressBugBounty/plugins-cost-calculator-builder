<template>
  <div class="ccb-calculator-sidebar">
    <template v-if="pageSettingsSelected">
      <div class="ccb-fields-sidebar__settings">
        <PageSettings />
      </div>
    </template>

    <template v-else-if="pageNavigationSelected">
      <div class="ccb-fields-sidebar__settings">
        <PageNavigationSettings />
      </div>
    </template>

    <template v-else-if="selectedField">
      <div class="ccb-fields-sidebar__settings">
        <component
          v-if="selectedFieldSettingsComponent"
          :is="selectedFieldSettingsComponent"
          :field="selectedField"
          :key="`${selectedField.alias}-${restoredVersion}`"
        />
      </div>
    </template>

    <template v-else>
      <div class="ccb-fields-sidebar">
        <div class="ccb-fields-sidebar__header">
          <div class="ccb-fields-sidebar__header-search">
            <Input
              :placeholder="searchPlaceholder"
              iconRight="ccb-icon-ic_search"
              class="ccb-search-input"
              v-model="search"
            />
          </div>
        </div>
        <div
          class="ccb-fields-sidebar__body ccb-custom-scrollbar"
          v-if="activeTab === 'elements'"
        >
          <div
            v-if="!isSearching && mostUsedFields.length > 0"
            class="ccb-most-used"
            :class="{ 'ccb-most-used--open': mostUsedOpen }"
          >
            <div class="ccb-most-used__header" @click="toggleMostUsed">
              <div class="ccb-most-used__header-left">
                <span class="ccb-most-used__star">&#9733;</span>
                <span class="ccb-most-used__title">MOST USED</span>
              </div>
              <i
                class="ccb-icon-ic_caret_down ccb-most-used__chevron"
                :class="{ 'ccb-most-used__chevron--open': mostUsedOpen }"
              />
            </div>
            <Transition name="most-used-slide">
              <VueDraggable
                v-show="mostUsedOpen"
                :modelValue="mostUsedFields"
                :group="{ name: 'fields', pull: 'clone', put: false }"
                :sort="false"
                :clone="cloneField"
                :animation="150"
                class="ccb-most-used__list"
              >
                <div
                  class="ccb-fields-sidebar__body-item-list-item"
                  v-for="field in mostUsedFields"
                  :key="field.alias"
                  :data-field-type="field.type"
                >
                  <div class="ccb-fields-sidebar__body-item-list-item-label">
                    <i :class="field.icon"></i>
                    <Text :text="field.name" size="m" weight="medium" />
                  </div>
                </div>
              </VueDraggable>
            </Transition>
          </div>

          <template v-for="type in calculatorFieldTypes">
            <div
              v-if="fieldsByType[type.id] && fieldsByType[type.id].length > 0"
              :key="type.id"
              class="ccb-fields-sidebar__body-item"
            >
              <Text :text="type.label" size="m" weight="bold" show-original />
              <VueDraggable
                :modelValue="fieldsByType[type.id]"
                :group="{ name: 'fields', pull: 'clone', put: false }"
                :sort="false"
                :clone="cloneField"
                :animation="150"
                class="ccb-fields-sidebar__body-item-list"
              >
                <div
                  class="ccb-fields-sidebar__body-item-list-item"
                  v-for="field in fieldsByType[type.id]"
                  :key="field.alias"
                  :data-field-type="field.type"
                  :class="{ 'ccb-pro-required': proRequired(field.alias) }"
                >
                  <div class="ccb-fields-sidebar__body-item-list-item-label">
                    <i :class="field.icon"></i>
                    <Text :text="field.name" size="m" weight="medium" />
                  </div>
                  <div class="ccb-fields-sidebar__body-item-list-item-badge">
                    <Badge
                      v-if="proRequired(field.alias)"
                      label="PRO"
                      :type="'blue'"
                    />
                  </div>
                </div>
              </VueDraggable>
            </div>
          </template>

          <div v-if="hasNoSearchResults" class="ccb-fields-sidebar__no-results">
            <i class="ccb-icon-ic_search"></i>
            <Text text="No fields found" size="m" weight="medium" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from "vue";
import { useBuilderHistory } from "./CalculatorFieldsSettings/useBuilderHistory";
import { Text, Input } from "@/admin/shared/ui/UIKit";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { VueDraggable } from "vue-draggable-plus";
import type { Component } from "vue";
import _field_settings from "@/admin/features/builder/_field-settings.scss";
import type {
  ICalculatorRawFields,
  IField,
} from "@/admin/shared/types/fields.type";
import PageNavigationSettings from "./PageNavigation/PageNavigationSettings.vue";
import { normalizeFieldTypeKey } from "@/admin/shared/defaults/type-convert";
import PageSettings from "./PageNavigation/PageSettings.vue";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import { Badge } from "@/admin/shared/ui/UIKit";

import "@/styles/admin/builder/sidebar.scss";

const activeTab = ref<"elements" | "widgets">("elements");
const builderStore = useBuilderStore();
const { restoredVersion } = useBuilderHistory();
const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);
const appStore = useAppStore();

const searchPlaceholder = computed(() => translations.value.searchForAField);
const search = ref("");

const MOST_USED_STORAGE_KEY = "ccb_most_used_open";
const mostUsedOpen = ref(
  localStorage.getItem(MOST_USED_STORAGE_KEY) !== "false",
);
const toggleMostUsed = () => {
  mostUsedOpen.value = !mostUsedOpen.value;
  localStorage.setItem(MOST_USED_STORAGE_KEY, String(mostUsedOpen.value));
};

const MOST_USED_ALIASES = [
  "drop-down",
  "radio",
  "checkbox",
  "quantity",
  "range",
];

const isSearching = computed(() => search.value.trim().length > 0);

const mostUsedFields = computed(() => {
  const all = rawFields.value;
  return MOST_USED_ALIASES.map((alias) =>
    all.find((f) => f.alias === alias),
  ).filter((f): f is ICalculatorRawFields => f != null);
});

const selectedField = computed(() => builderStore.getSelectedField);
const pageNavigationSelected = computed(
  () => builderStore.getPageNavigationSelected,
);
const pageSettingsSelected = computed(
  () => builderStore.getPageSettingsSelected,
);

const QuantitySettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Quantity.vue"),
);
const TextSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Text.vue"),
);
const DropdownSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Dropdown.vue"),
);
const ImageDropdownSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/ImageDropdown.vue"),
);
const RadioSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Radio.vue"),
);
const ImageRadioSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/ImageRadio.vue"),
);
const ToggleSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Toggle.vue"),
);
const CheckboxSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Checkbox.vue"),
);
const ImageCheckboxSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/ImageCheckbox.vue"),
);
const RangeSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Range.vue"),
);
const MultiRangeSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/MultiRange.vue"),
);
const DatePickerSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/DatePicker.vue"),
);
const TimePickerSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/TimePicker.vue"),
);
const FormulaSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Formula.vue"),
);
const HtmlSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Html.vue"),
);
const GeolocationSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Geolocation.vue"),
);
const DividerSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Divider.vue"),
);
const GroupSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Group.vue"),
);
const FileUploadSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Fileupload.vue"),
);
const RepeaterSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Repeater.vue"),
);
const ValidationFormSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/ValidationForm.vue"),
);
const SectionSettings = defineAsyncComponent(
  () => import("./CalculatorFieldsSettings/Section.vue"),
);

const typeToSettingsComponent: Record<string, Component> = {
  quantity: QuantitySettings,
  "text-area": TextSettings,
  "drop-down": DropdownSettings,
  "drop-down-with-image": ImageDropdownSettings,
  "radio-button": RadioSettings,
  "radio-with-image": ImageRadioSettings,
  toggle: ToggleSettings,
  checkbox: CheckboxSettings,
  "checkbox-with-image": ImageCheckboxSettings,
  "range-button": RangeSettings,
  "multi-range": MultiRangeSettings,
  "date-picker": DatePickerSettings,
  "time-picker": TimePickerSettings,
  total: FormulaSettings,
  Total: FormulaSettings,
  html: HtmlSettings,
  geolocation: GeolocationSettings,
  line: DividerSettings,
  group: GroupSettings,
  section: SectionSettings,
  "file-upload": FileUploadSettings,
  repeater: RepeaterSettings,
  "validated-form": ValidationFormSettings,
};

const selectedFieldSettingsComponent = computed<Component | null>(() => {
  if (!selectedField.value) return null;
  const type = normalizeFieldTypeKey(selectedField.value.type);
  return typeToSettingsComponent[type] || null;
});

// const fieldDescription = computed<string>({
//   get: () => String(selectedField.value?.description || ''),
//   set: (value) => {
//     if (!selectedField.value) return;
//     selectedField.value.description = value;
//   },
// });

// const fieldWidth = computed<number>({
//   get: () => Number(selectedField.value?.width || 100),
//   set: (value) => {
//     if (!selectedField.value) return;
//     selectedField.value.width = Math.min(100, Math.max(10, Number(value)));
//   },
// });

// const fieldHidden = computed<boolean>({
//   get: () => Boolean(selectedField.value?.hidden),
//   set: (value) => {
//     if (!selectedField.value) return;
//     selectedField.value.hidden = value;
//   },
// });

// const hasRequiredSetting = computed<boolean>(() => {
//   if (!selectedField.value) return false;
//   return 'required' in selectedField.value;
// });

// const fieldRequired = computed<boolean>({
//   get: () => {
//     if (!selectedField.value || !('required' in selectedField.value))
//       return false;
//     return Boolean(
//       (selectedField.value as IField & { required?: boolean }).required
//     );
//   },
//   set: (value) => {
//     if (!selectedField.value || !('required' in selectedField.value)) return;
//     (selectedField.value as IField & { required?: boolean }).required = value;
//   },
// });

// function closeFieldSettings() {
//   builderStore.setSelectedField(null);
// }

const rawFields = computed(() =>
  builderStore.getRawFields.filter(
    (field) =>
      field.type !== "page-navigation" &&
      field.type !== "page-break" &&
      field.type !== "section",
  ),
);

const filteredRawFields = computed(() => {
  if (!search.value.trim()) return rawFields.value;
  const query = search.value.toLowerCase().trim();
  return rawFields.value.filter(
    (field) =>
      field.name.toLowerCase().includes(query) ||
      field.type.toLowerCase().includes(query),
  );
});

const hasNoSearchResults = computed(
  () => isSearching.value && filteredRawFields.value.length === 0,
);

const fieldsByType = computed(() => {
  const map: Record<string, ICalculatorRawFields[]> = {};
  for (const type of calculatorFieldTypes) {
    map[type.id] = filteredRawFields.value.filter(
      (f) => f.sort_type === type.id,
    );
  }
  return map;
});

function cloneField(rawField: ICalculatorRawFields): IField {
  return builderStore.createFieldFromRaw(rawField);
}

const proRequired = computed(() => {
  const proFieldsMap: Record<string, boolean> = {
    geolocation: true,
    "multi-range": true,
    datepicker: true,
    timepicker: true,
    repeater: true,
    "validated-form": true,
    "group-field": true,
    "file-upload": true,
    "drop-down-with-image": true,
    "checkbox-with-image": true,
    "radio-with-image": true,
    group: true,
  };

  return (alias: string) => {
    if (proFieldsMap[alias]) {
      if (!appStore.getIsPro) return true;
      return false;
    }

    return false;
  };
});

const calculatorFieldTypes = [
  { id: "choice", label: "Choice" },
  { id: "numbers", label: "Numbers" },
  { id: "datetime", label: "Date & Time" },
  { id: "content", label: "Text & Content" },
  { id: "advanced", label: "Advanced" },
  { id: "layout", label: "Layout" },
] as const;
</script>

<style scoped lang="scss">
.ccb-calculator-sidebar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ccb-fields-sidebar {
  width: 100%;
  padding-top: 16px;

  &__settings-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__settings-back {
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 999px;
    background: var(--ccb-wb-normal, #f3f4f6);
    color: var(--ccb-font-labels);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transform: rotate(180deg);
  }

  &__settings-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__settings-subtitle {
    color: var(--ccb-font-comment);
    text-transform: capitalize;
  }

  &__settings-note {
    color: var(--ccb-font-comment);
  }

  &__settings {
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-right: 2px;
  }

  &__header {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;

    &-search {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 16px;

      .ccb-search-input {
        width: 100%;
      }
    }
  }

  &__body {
    width: 100%;
    height: calc(100vh - 258px);
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 16px;
    padding-top: 20px;

    &-item {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      color: var(--ccb-font-labels);
      transition: var(--ccb-transition-normal);

      &-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
      }
      &-list-item {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 16px;
        padding: 14px 12px;
        border-radius: 8px;
        cursor: grab;
        transition: background 0.15s ease;

        &:hover {
          background: var(--ccb-wb-hover, #f3f4f6);
        }

        &:active {
          cursor: grabbing;
        }

        &-label {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          gap: 16px;

          i {
            font-size: 20px;
            color: var(--ccb-font-comment);
          }
        }
      }
    }
  }
}

.ccb-fields-sidebar__no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 16px;
  color: var(--ccb-font-comment);
  width: 100%;

  i {
    font-size: 28px;
    opacity: 0.4;
  }
}

.ccb-most-used {
  border: 1px solid #e2d9a2;
  border-radius: 12px;
  background: var(--ccb-most-used-bg);
  padding: 4px 4px 0;
  cursor: pointer;
  width: 95%;

  &--open {
    padding-bottom: 4px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 8px;
    user-select: none;
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__chevron {
    font-size: 10px;
    color: #e5a100;
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__star {
    font-size: 14px;
    line-height: 1;
    color: #e5a100;
  }

  &__title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.6px;
    line-height: 1;
    color: #e5a100;
    text-transform: uppercase;
  }

  &__list {
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: 4px;
    padding: 5px;

    .ccb-fields-sidebar__body-item-list-item {
      padding: 10px 12px;
      background-color: var(--ccb-input-normal) !important;
      color: var(--ccb-most-used-text);
    }
  }
}

.most-used-slide-enter-active,
.most-used-slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.most-used-slide-enter-from,
.most-used-slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.most-used-slide-enter-to,
.most-used-slide-leave-from {
  opacity: 1;
  max-height: 400px;
}

.ccb-pro-required {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}
</style>
