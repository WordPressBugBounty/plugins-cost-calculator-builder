<template>
  <div class="ccb-fields-settings-container">
    <div class="ccb-fields-settings__content ccb-custom-scrollbar">
      <div class="ccb-fields-settings ccb-field-sidebar">
        <div
          class="ccb-fields-settings-back"
          @click="builderStore.setPageSettingsSelected(false)"
        >
          <i class="ccb-icon-ic_back"></i>
          <Text text="Back to Fields" size="s" weight="medium" />
        </div>
        <div class="ccb-field-sidebar__header">
          <Text text="Page" size="m" weight="bold" />
        </div>

        <div class="ccb-field-sidebar__body">
          <div class="ccb-field-sidebar__item">
            <Input
              label="Page Title"
              placeholder="Page title"
              v-model="pageTitle"
            />
          </div>
          <div class="ccb-field-sidebar__item">
            <Input
              label="Description (optional)"
              placeholder="Description (optional)"
              v-model="pageDescription"
            />
          </div>
        </div>
      </div>

      <div class="ccb-fields-settings ccb-field-sidebar">
        <div class="ccb-field-sidebar__header">
          <Text text="Navigation Buttons" size="m" weight="bold" />
        </div>

        <div class="ccb-field-sidebar__body">
          <div class="ccb-field-sidebar__item">
            <Input
              label="Previous Button Label"
              placeholder="Previous Button Label"
              v-model="previousButtonLabel"
            />
          </div>
          <div class="ccb-field-sidebar__item">
            <Input
              label="Next Button Label"
              placeholder="Next Button Label"
              v-model="nextButtonLabel"
            />
          </div>
        </div>
      </div>

      <div class="ccb-fields-settings ccb-field-sidebar">
        <div class="ccb-field-sidebar__header">
          <Text text="Conditions" size="m" weight="bold" />
        </div>

        <div class="ccb-field-sidebar__body">
          <div class="ccb-page-conditions__header">
            <Dropdown
              label="If"
              :items="conditionMatchItems"
              v-model="conditionMatch"
            />
          </div>

          <div class="ccb-page-conditions__note">Of the following match:</div>

          <div class="ccb-page-conditions__rows">
            <div
              v-for="(cond, index) in conditions"
              :key="index"
              class="ccb-page-conditions__row"
            >
              <div class="ccb-page-conditions__row-drag">
                <i class="ccb-icon-ic_drag"></i>
              </div>
              <div class="ccb-page-conditions__row-fields">
                <Dropdown
                  label="Element"
                  :items="fieldItems"
                  v-model="cond.field"
                />
                <Dropdown
                  v-if="cond.field"
                  label="Condition"
                  :items="getConditionItems(cond.field)"
                  v-model="cond.condition"
                />
                <template v-if="cond.field && cond.condition">
                  <MultiSelect
                    v-if="['in', 'not in'].includes(cond.condition)"
                    label="Value"
                    placeholder="Select option(s)"
                    :items="getOptionItems(cond.field)"
                    :modelValue="cond.checkedValues || []"
                    @update:modelValue="onCheckedValuesChange(index, $event)"
                  />
                  <Dropdown
                    v-else-if="cond.condition === 'contains'"
                    label="Value"
                    :items="getOptionItemsWithAny(cond.field)"
                    v-model="cond.key"
                  />
                  <Input
                    v-else-if="isNumericValueCondition(cond)"
                    label="Value"
                    placeholder="Set value"
                    inputType="number"
                    v-model="cond.value"
                  />
                  <Dropdown
                    v-else
                    label="Value"
                    :items="getOptionItemsWithAny(cond.field)"
                    v-model="cond.key"
                  />
                </template>
              </div>
              <button
                class="ccb-page-conditions__row-delete"
                @click="removeCondition(index)"
              >
                <i class="ccb-icon-ic_cross_small"></i>
              </button>
            </div>
          </div>

          <div class="ccb-page-conditions__add">
            <Button
              label="Add Condition"
              icon-left="ccb-icon-ic_plus_small"
              size="s"
              type="green-ghost"
              :onClick="addCondition"
            />
          </div>

          <div class="ccb-page-conditions__action">
            <Dropdown
              label="Action"
              :items="actionItems"
              v-model="conditionAction"
            />
            <Dropdown
              v-if="conditionAction === 'jump_to'"
              label="Page"
              :items="pageItems"
              v-model="conditionPageTo"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { Text, Input, Button, MultiSelect } from "@/admin/shared/ui/UIKit";
import Dropdown from "@/admin/shared/ui/UIKit/Dropdown.vue";
import _field_settings from "@/admin/features/builder/_field-settings.scss";
import { useConditionHelpers } from "@/admin/features/conditions/composable/useConditionHelpers";
import { resolveInputType } from "@/admin/features/conditions/composable/useConditionNormalize";
import type { IField, IOptions } from "@/admin/shared/types/fields.type";
import type { IDropdownOption } from "@/admin/shared/types/uikit.type";

interface IPageConditionRow {
  field: string;
  condition: string;
  key: string | number;
  value: string | number;
  checkedValues?: number[];
}

const EXCLUDED_ELEMENT_TYPES = new Set([
  "time-picker",
  "date-picker",
  "html",
  "file-upload",
  "line",
  "text-area",
  "group",
  "repeater",
]);

const NUMERIC_DISTANCE_CONDITIONS = new Set([
  ">=",
  "<=",
  "== & distance",
  "<= & distance",
  ">= & distance",
  "!= & distance",
]);

const builderStore = useBuilderStore();
const { getActionsByAliasWithField } = useConditionHelpers();

const activePageData = computed(() => builderStore.getActivePageData);

const previousButtonLabel = computed({
  get: () => activePageData.value?.previousBtnLabel || "Back",
  set: (value) => {
    if (activePageData.value) {
      activePageData.value.previousBtnLabel = value;
    }
  },
});

const nextButtonLabel = computed({
  get: () => activePageData.value?.nextBtnLabel || "Next",
  set: (value) => {
    if (activePageData.value) {
      activePageData.value.nextBtnLabel = value;
    }
  },
});
const pageTitle = computed({
  get: () => activePageData.value?.label || "",
  set: (value) => {
    if (activePageData.value) {
      activePageData.value.label = value;
    }
  },
});

const pageDescription = computed({
  get: () => activePageData.value?.description || "",
  set: (value) => {
    if (activePageData.value) {
      activePageData.value.description = value;
    }
  },
});

const conditionMatch = computed({
  get: () => activePageData.value?.condition || "any",
  set: (value) => {
    if (activePageData.value) {
      activePageData.value.condition = value as string;
    }
  },
});

const conditionAction = computed({
  get: () => activePageData.value?.action || "skip",
  set: (value) => {
    if (activePageData.value) {
      activePageData.value.action = value as string;
    }
  },
});

const conditionPageTo = computed({
  get: () => activePageData.value?.pageTo || "",
  set: (value) => {
    if (activePageData.value) {
      activePageData.value.pageTo = value as string;
    }
  },
});
const conditions = ref<IPageConditionRow[]>([]);

watch(
  () => activePageData.value?.alias,
  () => {
    const page = activePageData.value;

    if (page) {
      if (!page.previousBtnLabel) {
        page.previousBtnLabel = "Back";
      }
      if (!page.nextBtnLabel) {
        page.nextBtnLabel = "Next";
      }
      if (!page.condition) {
        page.condition = "any";
      }
      if (!page.action) {
        page.action = "skip";
      }
      if (typeof page.pageTo === "undefined") {
        page.pageTo = "";
      }
    }

    if (page?.conditions && Array.isArray(page.conditions)) {
      conditions.value = (page.conditions as IPageConditionRow[])
        .filter((c) => hasFieldOnPage(c?.field))
        .map((c) => ({
          field: c.field || "",
          condition: c.condition || "",
          key: c.key ?? "",
          value: c.value ?? "",
          checkedValues: Array.isArray(c.checkedValues)
            ? [...c.checkedValues]
            : [],
        }));
    } else {
      conditions.value = [];
      if (page) {
        page.conditions = [];
      }
    }
  },
  { immediate: true },
);

function syncConditionsToStore() {
  if (activePageData.value) {
    activePageData.value.conditions = conditions.value.map((c) => ({ ...c }));
  }
}

function addCondition() {
  conditions.value.push({
    field: "",
    condition: "",
    key: "",
    value: "",
    checkedValues: [],
  });
  syncConditionsToStore();
}

function removeCondition(index: number) {
  conditions.value.splice(index, 1);
  syncConditionsToStore();
}

function onCheckedValuesChange(
  index: number,
  values: Array<string | number>,
): void {
  const row = conditions.value[index];
  if (!row) return;
  row.checkedValues = values.map((v) => Number(v));
}

watch(conditions, syncConditionsToStore, { deep: true });

function hasFieldOnPage(alias: string | undefined | null): boolean {
  if (!alias) return false;
  const page = activePageData.value;
  if (!page) return false;
  return page.groupElements.some((section) =>
    section.fields.some((f) => f.alias === alias),
  );
}

const fieldItems = computed<IDropdownOption[]>(() => {
  const page = activePageData.value;
  if (!page) return [];
  return page.groupElements.flatMap((section) =>
    section.fields
      .filter((f) => !EXCLUDED_ELEMENT_TYPES.has(f.type))
      .map((f) => ({
        label: f.label || f.alias,
        value: f.alias,
      })),
  );
});

function getConditionItems(alias: string): IDropdownOption[] {
  const field = builderStore.getFieldByAlias(alias);
  return getActionsByAliasWithField(alias, field);
}

function getOptionItems(alias: string): IDropdownOption[] {
  const field = builderStore.getFieldByAlias(alias);
  if (!field) return [];

  if (
    field.alias?.includes("geolocation") &&
    "multiplyLocations" in field &&
    Array.isArray(
      (field as { multiplyLocations: { label: string }[] }).multiplyLocations,
    )
  ) {
    return (
      field as { multiplyLocations: { label: string }[] }
    ).multiplyLocations.map((loc, idx) => ({ label: loc.label, value: idx }));
  }

  if (
    "options" in field &&
    Array.isArray((field as { options: IOptions[] }).options)
  ) {
    return (field as { options: IOptions[] }).options.map((opt, idx) => ({
      label: opt.optionText,
      value: idx,
    }));
  }
  return [];
}

function getOptionItemsWithAny(alias: string): IDropdownOption[] {
  return [{ label: "Select any", value: "any" }, ...getOptionItems(alias)];
}

function isNumericValueCondition(cond: IPageConditionRow): boolean {
  if (NUMERIC_DISTANCE_CONDITIONS.has(cond.condition)) return true;
  const field = builderStore.getFieldByAlias(cond.field);
  if (!field) return true;
  return resolveInputType(field as IField) === "input";
}

const conditionMatchItems: IDropdownOption[] = [
  { label: "Any", value: "any" },
  { label: "All", value: "and" },
];

const actionItems: IDropdownOption[] = [
  { label: "Skip next page", value: "skip" },
  { label: "Block next page", value: "not_skip" },
  { label: "Jump to", value: "jump_to" },
];

const pageItems = computed<IDropdownOption[]>(() => {
  const currentAlias = activePageData.value?.alias;
  return builderStore.getBuilderFields
    .filter((page) => page.alias !== currentAlias)
    .map((page, index) => ({
      label: page.label || `Page ${index + 1}`,
      value: page.alias,
    }));
});
</script>

<style lang="scss">
.ccb-page-conditions {
  &__header {
    width: 100%;
  }

  &__note {
    width: 100%;
    background: rgba(68, 80, 207, 0.08);
    border-radius: 12px;
    padding: 10px 16px;
    font-size: 16px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.8);
    line-height: 20px;
  }

  &__rows {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  &__row {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    width: 100%;
    background: rgba(68, 80, 207, 0.08);
    border-radius: 16px;
    padding: 4px;
  }

  &__row-drag {
    display: flex;
    align-items: center;
    padding: 8px 0 0 8px;
    cursor: grab;
    color: var(--ccb-font-comment, rgba(0, 0, 0, 0.4));
    flex-shrink: 0;

    i {
      font-size: 16px;
    }

    &:active {
      cursor: grabbing;
    }
  }

  &__row-fields {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;

    :deep(.ccb-dropdown) {
      border-radius: 4px;

      &:first-child {
        border-radius: 12px 12px 4px 4px;
      }

      &:last-child {
        border-radius: 4px 4px 12px 12px;
      }
    }
  }

  &__row-delete {
    display: flex;
    align-items: center;
    padding: 8px 8px 0 0;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--ccb-font-comment, rgba(0, 0, 0, 0.4));
    flex-shrink: 0;

    i {
      font-size: 12px;
    }

    &:hover {
      color: var(--ccb-red-fg-normal, #e33030);
    }
  }

  &__add {
    padding-left: 16px;
  }

  &__action {
    width: 100%;
    padding-top: 16px;
  }
}

.ccb-fields-settings-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ccb-fields-settings__content {
  height: calc(100vh - 240px);
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 2px;
}

.ccb-fields-settings__content {
  height: calc(100vh - 240px);
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 2px;
}

.ccb-fields-settings-back {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--ccb-font-comment);
  transition: color 0.15s ease;
  padding: 0 0 20px 0;

  i {
    font-size: 14px;
  }

  &:hover {
    color: var(--ccb-font-title);
  }
}
</style>
