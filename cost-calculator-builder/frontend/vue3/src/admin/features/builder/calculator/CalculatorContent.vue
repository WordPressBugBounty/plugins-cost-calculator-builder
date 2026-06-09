<template>
  <div class="ccb-calculator-content ccb-custom-scrollbar">
    <template v-if="builderStore.builderFields.length">
      <CalculatorTitle v-if="!pageBreakAvailable" />
      <div
        class="ccb-calculator-content__page-navigation"
        :class="[`ccb-calculator-content__page-navigation-${headerPosition}`]"
        v-if="pageBreakAvailable"
      >
        <CalculatorTitle v-if="pageBreakAvailable" />
        <PageNavigation />
      </div>
      <div
        class="ccb-calculator-content__bottom"
        :class="[
          {
            'ccb-page-wrapper--bordered':
              pageBreakAvailable && !isSummaryLastPageActive,
            'ccb-page-wrapper--summary-last-page': summaryLastPage,
          },
          `ccb-calculator-content__bottom--summary-${layoutSettings.summary_position}`,
        ]"
      >
        <div
          class="ccb-page-wrapper__controls"
          v-if="pageBreakAvailable && !isSummaryLastPageActive"
        >
          <button
            class="ccb-page-wrapper__control-btn"
            @click="editPage"
            title="Edit page"
          >
            <i class="ccb-icon-ic_edit"></i>
          </button>
          <button
            class="ccb-page-wrapper__control-btn"
            @click="requestDeletePage(builderStore.activePage)"
            title="Delete page"
            v-if="builderStore.builderFields.length > 1"
          >
            <i class="ccb-icon-ic_delete"></i>
          </button>
        </div>
        <div class="ccb-calculator-content__builder" :style="builderStyle">
          <div
            v-for="(page, pageIndex) in builderStore.builderFields"
            :key="page._id || pageIndex"
            v-show="pageIndex === builderStore.activePage"
            class="ccb-calculator-content__wrapper"
          >
            <VueDraggable
              v-model="page.groupElements"
              group="sections"
              :animation="200"
              handle=".ccb-section__handle"
              ghostClass="ccb-section--ghost"
              class="ccb-calculator-content__sections"
              @start="onDragStart"
              @end="onDragEnd"
            >
              <SectionComponent
                v-for="(section, sIndex) in page.groupElements"
                :key="section._id"
                :field="section"
                :class="{
                  'ccb-section--selected': isSectionSelected(section),
                }"
                @click="openSectionSettings(section)"
              >
                <template #headerPrepend>
                  <div
                    class="ccb-section__handle"
                    title="Drag to reorder section"
                    data-section-no-collapse
                    @click.stop
                  >
                    <span>&#8942;&#8942;</span>
                  </div>
                </template>
                <template #headerAppend>
                  <button
                    v-if="page.groupElements.length > 1"
                    class="ccb-section__remove"
                    data-section-no-collapse
                    @click.stop="removeSection(pageIndex, sIndex)"
                    title="Remove section"
                  >
                    <i class="ccb-icon-Trash-filled"></i>
                  </button>
                </template>

                <div class="ccb-section__body" data-section-no-collapse>
                  <div
                    class="ccb-section__rows"
                    :class="{
                      'ccb-section__rows--empty': section.fields.length === 0,
                    }"
                  >
                    <template
                      v-for="(row, rowIdx) in getVisibleSectionRows(section)"
                      :key="`row-${section._id}-${rowIdx}`"
                    >
                      <div class="ccb-row ccb-row--inter-zone">
                        <VueDraggable
                          :modelValue="getInterRowSlot(section, rowIdx)"
                          @update:modelValue="
                            (next) => onInterRowUpdate(section, rowIdx, next)
                          "
                          :group="{ name: 'fields' }"
                          :animation="200"
                          handle=".ccb-field-item__drag-handle"
                          ghostClass="ccb-field-item--ghost"
                          class="ccb-row__inter-zone-drop"
                          @start="onDragStart"
                          @end="onRowDragEnd(section)"
                        />
                      </div>
                      <div class="ccb-row" :data-row-index="rowIdx">
                        <VueDraggable
                          :modelValue="row"
                          @update:modelValue="
                            (next) => onRowUpdate(section, rowIdx, next)
                          "
                          :group="rowFieldsGroup"
                          :animation="200"
                          handle=".ccb-field-item__drag-handle"
                          ghostClass="ccb-field-item--ghost"
                          class="ccb-row__fields"
                          @start="onDragStart"
                          @end="onRowDragEnd(section)"
                        >
                          <div
                            v-for="field in getSectionFields(row)"
                            :key="getFieldKey(field)"
                            class="ccb-field-item ccb-field ccb-disable-pointer-events"
                            :class="[
                              {
                                'ccb-field-item--is-container':
                                  isContainerField(field),
                                'ccb-field-item--selected':
                                  isFieldSelected(field),
                                'ccb-field-item--resizing':
                                  resizingFieldAlias === field.alias,
                              },
                              `field-width-${field.width}`,
                            ]"
                            :data-field-type="field.type"
                            :data-field-alias="field.alias"
                            :style="{
                              width: getFieldWidthStyle(field.width),
                            }"
                            @click.stop="selectField(field)"
                          >
                            <div class="ccb-field-item__controls">
                              <button
                                type="button"
                                class="ccb-field-item__action"
                                title="Duplicate field"
                                @click.stop="duplicateField(field)"
                              >
                                <i class="ccb-icon-ic_duplicate"></i>
                              </button>
                              <button
                                type="button"
                                class="ccb-field-item__action ccb-field-item__action--danger"
                                title="Delete field"
                                @click.stop="deleteField(field)"
                              >
                                <i class="ccb-icon-ic_delete"></i>
                              </button>
                              <button
                                type="button"
                                class="ccb-field-item__action ccb-field-item__drag-handle"
                                title="Drag field"
                                @click.stop
                              >
                                <i class="ccb-icon-ic_drag"></i>
                              </button>
                            </div>

                            <div
                              v-if="
                                !isContainerField(field) && !isTotalField(field)
                              "
                              class="ccb-field-item__resize-handle"
                              @mousedown.stop="onResizeStart($event, field)"
                            >
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>

                            <!-- ── Repeater field ────────────────── -->
                            <template
                              v-if="
                                field.type === 'repeater' &&
                                isContainerField(field)
                              "
                            >
                              <RepeaterComponent
                                :field="field as unknown as IRepeaterField"
                                :is-collapsed="
                                  containerCollapsed[getFieldId(field)]
                                "
                                @toggle-collapse="
                                  toggleContainerCollapse(getFieldId(field))
                                "
                              >
                                <VueDraggable
                                  :modelValue="getGroupElements(field)"
                                  @update:modelValue="
                                    setGroupElements(field, $event)
                                  "
                                  :group="containerChildrenGroup"
                                  :animation="200"
                                  handle=".ccb-field-item__drag-handle"
                                  ghostClass="ccb-field-item--ghost"
                                  class="ccb-repeater-field__drop-zone"
                                  @start="onDragStart"
                                  @end="onDragEnd"
                                >
                                  <div
                                    v-for="child in getGroupElements(field)"
                                    :key="getFieldKey(child)"
                                    class="ccb-field-item"
                                    :class="{
                                      'ccb-field-item--selected':
                                        isFieldSelected(child),
                                      'ccb-field-item--resizing':
                                        resizingFieldAlias === child.alias,
                                    }"
                                    :data-field-type="child.type"
                                    :data-field-alias="child.alias"
                                    :style="{
                                      width: child.width
                                        ? `${child.width}%`
                                        : '100%',
                                    }"
                                    @click.stop="selectField(child)"
                                  >
                                    <div class="ccb-field-item__controls">
                                      <button
                                        type="button"
                                        class="ccb-field-item__action"
                                        title="Edit field"
                                        @click.stop="openFieldSettings(child)"
                                      >
                                        <i class="ccb-icon-ic_edit"></i>
                                      </button>
                                      <button
                                        type="button"
                                        class="ccb-field-item__action"
                                        title="Duplicate field"
                                        @click.stop="duplicateField(child)"
                                      >
                                        <i class="ccb-icon-ic_duplicate"></i>
                                      </button>
                                      <button
                                        type="button"
                                        class="ccb-field-item__action ccb-field-item__action--danger"
                                        title="Delete field"
                                        @click.stop="deleteField(child)"
                                      >
                                        <i class="ccb-icon-ic_delete"></i>
                                      </button>
                                      <button
                                        type="button"
                                        class="ccb-field-item__action ccb-field-item__drag-handle"
                                        title="Drag field"
                                        @click.stop
                                      >
                                        <i class="ccb-icon-ic_drag"></i>
                                      </button>
                                    </div>

                                    <div
                                      class="ccb-field-item__resize-handle"
                                      @mousedown.stop="
                                        onResizeStart($event, child)
                                      "
                                    >
                                      <span></span>
                                      <span></span>
                                      <span></span>
                                    </div>

                                    <component
                                      v-if="resolveFieldComponent(child._tag)"
                                      :is="resolveFieldComponent(child._tag)"
                                      :field="child"
                                    />
                                    <div
                                      v-else
                                      class="ccb-field-item__fallback"
                                    >
                                      <i
                                        v-if="child.icon"
                                        :class="child.icon"
                                      ></i>
                                      <span>{{ child.label }}</span>
                                    </div>
                                  </div>
                                </VueDraggable>

                                <div
                                  v-if="getGroupElements(field).length === 0"
                                  class="ccb-repeater-field__placeholder"
                                >
                                  Drag and drop elements here
                                </div>
                              </RepeaterComponent>
                            </template>

                            <!-- ── Container field (Group) ──────── -->
                            <template v-else-if="isContainerField(field)">
                              <GroupComponent
                                :field="field as unknown as IGroupField"
                                :is-collapsed="
                                  containerCollapsed[getFieldId(field)]
                                "
                                @toggle-collapse="
                                  toggleContainerCollapse(getFieldId(field))
                                "
                              >
                                <VueDraggable
                                  :modelValue="getGroupElements(field)"
                                  @update:modelValue="
                                    setGroupElements(field, $event)
                                  "
                                  :group="containerChildrenGroup"
                                  :animation="200"
                                  handle=".ccb-field-item__drag-handle"
                                  ghostClass="ccb-field-item--ghost"
                                  class="ccb-group__fields"
                                  :class="{
                                    'not-empty':
                                      getGroupElements(field).length > 0,
                                  }"
                                  @start="onDragStart"
                                  @end="onDragEnd"
                                >
                                  <div
                                    v-for="child in getGroupElements(field)"
                                    :key="getFieldKey(child)"
                                    class="ccb-field-item"
                                    :class="{
                                      'ccb-field-item--selected':
                                        isFieldSelected(child),
                                      'ccb-field-item--resizing':
                                        resizingFieldAlias === child.alias,
                                    }"
                                    :data-field-type="child.type"
                                    :data-field-alias="child.alias"
                                    :style="{
                                      width: child.width
                                        ? `${child.width}%`
                                        : '100%',
                                    }"
                                    @click.stop="selectField(child)"
                                  >
                                    <div class="ccb-field-item__controls">
                                      <button
                                        type="button"
                                        class="ccb-field-item__action"
                                        title="Edit field"
                                        @click.stop="openFieldSettings(child)"
                                      >
                                        <i class="ccb-icon-ic_edit"></i>
                                      </button>
                                      <button
                                        type="button"
                                        class="ccb-field-item__action"
                                        title="Duplicate field"
                                        @click.stop="duplicateField(child)"
                                      >
                                        <i class="ccb-icon-ic_duplicate"></i>
                                      </button>
                                      <button
                                        type="button"
                                        class="ccb-field-item__action ccb-field-item__action--danger"
                                        title="Delete field"
                                        @click.stop="deleteField(child)"
                                      >
                                        <i class="ccb-icon-ic_delete"></i>
                                      </button>
                                      <button
                                        type="button"
                                        class="ccb-field-item__action ccb-field-item__drag-handle"
                                        title="Drag field"
                                        @click.stop
                                      >
                                        <i class="ccb-icon-ic_drag"></i>
                                      </button>
                                    </div>

                                    <div
                                      class="ccb-field-item__resize-handle"
                                      @mousedown.stop="
                                        onResizeStart($event, child)
                                      "
                                    >
                                      <span></span>
                                      <span></span>
                                      <span></span>
                                    </div>

                                    <component
                                      v-if="resolveFieldComponent(child._tag)"
                                      :is="resolveFieldComponent(child._tag)"
                                      :field="child"
                                    />
                                    <div
                                      v-else
                                      class="ccb-field-item__fallback"
                                    >
                                      <i
                                        v-if="child.icon"
                                        :class="child.icon"
                                      ></i>
                                      <span>{{ child.label }}</span>
                                    </div>
                                  </div>
                                </VueDraggable>

                                <div
                                  v-if="getGroupElements(field).length === 0"
                                  class="ccb-group__placeholder"
                                >
                                  Drag and drop elements here
                                </div>
                              </GroupComponent>
                            </template>

                            <!-- ── Regular field ─────────────────── -->
                            <template v-else>
                              <component
                                v-if="resolveFieldComponent(field._tag)"
                                :is="resolveFieldComponent(field._tag)"
                                :field="field"
                              />
                              <div v-else class="ccb-field-item__fallback">
                                <i v-if="field.icon" :class="field.icon"></i>
                                <span>{{ field.label }}</span>
                                <span class="ccb-field-item__fallback-type">{{
                                  field.type
                                }}</span>
                              </div>
                            </template>
                          </div>
                        </VueDraggable>
                      </div>
                    </template>

                    <div
                      class="ccb-row ccb-row--new-zone"
                      :class="{
                        'ccb-row--new-zone-only': section.fields.length === 0,
                      }"
                    >
                      <VueDraggable
                        :modelValue="getNewRowSlot(section)"
                        @update:modelValue="
                          (next) => onNewRowUpdate(section, next)
                        "
                        :group="{ name: 'fields' }"
                        :animation="200"
                        handle=".ccb-field-item__drag-handle"
                        ghostClass="ccb-field-item--ghost"
                        class="ccb-row__new-zone-drop"
                        @start="onDragStart"
                        @end="onRowDragEnd(section)"
                      />
                      <div
                        v-if="section.fields.length === 0"
                        class="ccb-row__hint ccb-row__hint--new"
                      >
                        Drag and drop elements here
                      </div>
                    </div>
                  </div>
                </div>
              </SectionComponent>
            </VueDraggable>

            <Button
              label="Add Section"
              icon-left="ccb-icon-ic_plus_small"
              style="margin: 20px 0px"
              size="s"
              type="green-ghost"
              :onClick="addSection"
            />
            <PageActions />
          </div>

          <div
            v-if="isSummaryLastPageActive"
            class="ccb-calculator-content__wrapper ccb-calculator-content__wrapper--summary"
          >
            <TotalSummary />
            <PageActions />
          </div>
        </div>
        <div
          v-if="!summaryLastPage && isSideBySide"
          class="ccb-calculator-content__resizer"
          :class="{ 'is-active': isSummaryResizing }"
          @mousedown="onSummaryResizeStart"
          @mouseenter="isResizerHovered = true"
          @mouseleave="isResizerHovered = false"
          @mousemove="onResizerPointerMove"
        ></div>
        <Teleport to="body">
          <span
            v-if="isSummaryResizing || isResizerHovered"
            class="ccb-calculator-content__resizer-badge"
            :style="{ left: `${pointerX}px`, top: `${pointerY}px` }"
            >{{ resizeRatioLabel }}</span
          >
        </Teleport>
        <div
          class="ccb-calculator-content__summary"
          :style="summaryStyle"
          v-if="!summaryLastPage"
        >
          <TotalSummary />
        </div>
      </div>
    </template>

    <ConfirmDialog
      :visible="deletePageConfirmVisible"
      title="Delete page"
      message="Are you sure you want to delete this field and all data associated with it?"
      confirm-text="Delete"
      cancel-text="Cancel"
      confirm-type="red"
      cancel-type="default"
      @update:visible="deletePageConfirmVisible = $event"
      @confirm="confirmDeletePage"
      @cancel="cancelDeletePage"
    />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  nextTick,
  reactive,
  ref,
  onBeforeUnmount,
  watch,
} from "vue";
import type { Component } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import PageNavigation from "./PageNavigation/PageNavigation.vue";
import PageActions from "./PageNavigation/PageActions.vue";
import CalculatorTitle from "./CalculatorTitle.vue";
import { useAppearanceTypography } from "@/admin/shared/utils/useAppearanceTypography";

import type {
  IGroupField,
  IField,
  IRepeaterField,
  ISection,
} from "@/admin/shared/types/fields.type";
import { Button, ConfirmDialog } from "@/admin/shared/ui/UIKit";
import TotalSummary from "./TotalSummary/TotalSummary.vue";

import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
import { useAppearanceSpacing } from "@/admin/shared/utils/useAppearanceSpacing";
import { ILayout } from "@/admin/shared/types/settings.type";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import {
  ensureSectionRows,
  commitRowsToSection,
  cleanupEmptyRows,
  fitFieldAtRow,
  isolateContainersInState,
} from "@/admin/shared/utils/useSectionRows";

const settingsStore = useSettingsStore();
const appStore = useAppStore();
const builderStore = useBuilderStore();

const layoutSettings = computed<ILayout>(() => {
  return settingsStore.getSettings?.layout as unknown as ILayout;
});

const summaryLastPage = computed(() => {
  return (
    settingsStore.getSettings?.page_break?.summary_after_last_page ?? false
  );
});

const summaryPageIndex = computed(() => builderStore.builderFields.length);

const isSummaryLastPageActive = computed(() => {
  return (
    summaryLastPage.value && builderStore.activePage === summaryPageIndex.value
  );
});

const setBuilderSidebarContent = () => {
  builderStore.setSidebarContent("builder");
};

const calculatorWidth = computed(() => {
  return (layoutSettings.value?.max_width || 1200) + "px";
});

const headerPosition = computed(() => {
  return layoutSettings.value?.header_position;
});

const builderStyle = computed(() => {
  if (summaryLastPage.value) {
    return { width: `100%` };
  }
  return { width: `${layoutSettings.value?.calculator_width ?? 70}%` };
});

const summaryStyle = computed(() => {
  if (summaryLastPage.value) {
    return { width: `100%` };
  }
  return { width: `${layoutSettings.value?.summary_width ?? 30}%` };
});

const isSideBySide = computed(() => {
  return layoutSettings.value?.summary_position !== "bottom";
});

const MIN_CALC_WIDTH = 30;
const MAX_CALC_WIDTH = 70;

const resizeRatioLabel = computed(() => {
  const calc = Math.round(layoutSettings.value?.calculator_width ?? 60);
  const summary = 100 - calc;
  const isLeft = layoutSettings.value?.summary_position === "left";
  return isLeft ? `${summary}/${calc}` : `${calc}/${summary}`;
});

const isSummaryResizing = ref(false);
const isResizerHovered = ref(false);
const pointerX = ref(0);
const pointerY = ref(0);
let summaryResizeContainer: HTMLElement | null = null;

function onResizerPointerMove(event: MouseEvent): void {
  pointerX.value = event.clientX;
  pointerY.value = event.clientY;
}

function updateCalculatorWidth(calcWidth: number): void {
  const settings = settingsStore.getSettings;
  if (!settings) return;

  const clamped = Math.round(
    Math.min(MAX_CALC_WIDTH, Math.max(MIN_CALC_WIDTH, calcWidth)),
  );

  settingsStore.setSettings({
    ...settings,
    layout: {
      ...settings.layout,
      calculator_width: clamped,
      summary_width: 100 - clamped,
    },
  });
}

function onSummaryResizeStart(event: MouseEvent): void {
  event.preventDefault();
  event.stopPropagation();

  summaryResizeContainer = (event.currentTarget as HTMLElement).closest(
    ".ccb-calculator-content__bottom",
  ) as HTMLElement | null;

  if (!summaryResizeContainer) return;

  isSummaryResizing.value = true;
  document.body.style.userSelect = "none";
  document.body.style.cursor = "col-resize";

  document.addEventListener("mousemove", onSummaryResizeMove);
  document.addEventListener("mouseup", onSummaryResizeEnd);
}

function onSummaryResizeMove(event: MouseEvent): void {
  if (!isSummaryResizing.value || !summaryResizeContainer) return;

  const rect = summaryResizeContainer.getBoundingClientRect();
  if (rect.width <= 0) return;

  const isLeft = layoutSettings.value?.summary_position === "left";
  const offset = isLeft
    ? rect.right - event.clientX
    : event.clientX - rect.left;

  const clamped = Math.round(
    Math.min(
      MAX_CALC_WIDTH,
      Math.max(MIN_CALC_WIDTH, (offset / rect.width) * 100),
    ),
  );

  updateCalculatorWidth(clamped);

  const splitterX = isLeft
    ? rect.right - (clamped / 100) * rect.width
    : rect.left + (clamped / 100) * rect.width;

  pointerX.value = splitterX;
  pointerY.value = Math.min(rect.bottom, Math.max(rect.top, event.clientY));
}

function onSummaryResizeEnd(): void {
  isSummaryResizing.value = false;
  summaryResizeContainer = null;
  document.body.style.userSelect = "";
  document.body.style.cursor = "";
  document.removeEventListener("mousemove", onSummaryResizeMove);
  document.removeEventListener("mouseup", onSummaryResizeEnd);
}

function getFieldWidthStyle(width: IField["width"]): string {
  const numericWidth = Number(width);

  if (!numericWidth) {
    return "100%";
  }

  return numericWidth < 100 ? `calc(${numericWidth}%)` : `${numericWidth}%`;
}

// ── Cross-page drag state ──────────────────────────────────────────────
function onDragStart() {
  builderStore.setDragging(true);
}

function onDragEnd() {
  builderStore.setDragging(false);
}

// ── Section rows (virtual row layer) ───────────────────────────────────
const newRowSlots = reactive<Record<string, IField[]>>({});
const interRowSlots = reactive<Record<string, IField[]>>({});

function getVisibleSectionRows(section: ISection): IField[][] {
  return ensureSectionRows(section);
}

function getNewRowSlot(section: ISection): IField[] {
  const key = String(section._id ?? section.alias);
  if (!newRowSlots[key]) newRowSlots[key] = [];
  return newRowSlots[key];
}

function getInterRowSlot(section: ISection, beforeIndex: number): IField[] {
  const key = `${section._id ?? section.alias}::${beforeIndex}`;
  if (!interRowSlots[key]) interRowSlots[key] = [];
  return interRowSlots[key];
}

function findAddedField(
  oldFields: IField[],
  newFields: IField[],
): IField | undefined {
  const oldAliases = new Set(oldFields.map((f) => f.alias));
  return newFields.find((f) => !oldAliases.has(f.alias));
}

function onRowUpdate(
  section: ISection,
  rowIndex: number,
  nextFields: IField[],
) {
  const rows = ensureSectionRows(section);
  const oldFields = rows[rowIndex] || [];
  const addedField = findAddedField(oldFields, nextFields);

  rows[rowIndex] = nextFields;

  if (addedField) {
    fitFieldAtRow(
      section,
      rowIndex,
      nextFields.findIndex((f) => f.alias === addedField.alias),
    );

    if (isFieldFromExternalSource(rows, addedField, rowIndex)) {
      isolateContainersInState(section);
    }
  }

  commitRowsToSection(section);
}

function isFieldFromExternalSource(
  rows: IField[][],
  field: IField,
  rowIndex: number,
): boolean {
  for (let i = 0; i < rows.length; i++) {
    if (i === rowIndex) continue;
    if (rows[i].some((f) => f.alias === field.alias)) return false;
  }
  return true;
}

function onNewRowUpdate(section: ISection, nextSlot: IField[]) {
  const key = String(section._id ?? section.alias);
  newRowSlots[key] = nextSlot;
  if (nextSlot.length === 0) return;

  const rows = ensureSectionRows(section);
  rows.push([...nextSlot]);
  newRowSlots[key] = [];
  commitRowsToSection(section);
}

function onInterRowUpdate(
  section: ISection,
  beforeIndex: number,
  nextSlot: IField[],
) {
  const key = `${section._id ?? section.alias}::${beforeIndex}`;
  interRowSlots[key] = nextSlot;
  if (nextSlot.length === 0) return;

  const rows = ensureSectionRows(section);
  const movedAliases = new Set(nextSlot.map((f) => f.alias));

  let anchorAlias: string | null = null;
  for (let i = beforeIndex; i < rows.length; i++) {
    for (const f of rows[i]) {
      if (!movedAliases.has(f.alias)) {
        anchorAlias = f.alias;
        break;
      }
    }
    if (anchorAlias) break;
  }

  nextTick(() => {
    const slot = interRowSlots[key];
    if (!slot || slot.length === 0) return;
    const fieldsToInsert = [...slot];
    interRowSlots[key] = [];

    const currentRows = ensureSectionRows(section);

    for (const field of fieldsToInsert) {
      for (let i = 0; i < currentRows.length; i++) {
        const idx = currentRows[i].findIndex((rf) => rf.alias === field.alias);
        if (idx !== -1) currentRows[i].splice(idx, 1);
      }
    }

    cleanupEmptyRows(section);
    const cleanedRows = ensureSectionRows(section);

    let insertAt = cleanedRows.length;
    if (anchorAlias) {
      const refIdx = cleanedRows.findIndex((r) =>
        r.some((f) => f.alias === anchorAlias),
      );
      if (refIdx !== -1) insertAt = refIdx;
    }

    cleanedRows.splice(insertAt, 0, fieldsToInsert);
    isolateContainersInState(section);
    commitRowsToSection(section);
  });
}

function onRowDragEnd(section: ISection) {
  builderStore.setDragging(false);
  cleanupEmptyRows(section);
  isolateContainersInState(section);
  commitRowsToSection(section);
}

// ── Container types that cannot be nested ──────────────────────────────
const CONTAINER_TYPES = ["group", "repeater"];

// ── Async builder field components (created once) ──────────────────────
const TextComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/Text/Text.vue"
    ),
);
const QuantityComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/Quantity/Quantity.vue"
    ),
);
const DropdownComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/Dropdown/Dropdown.vue"
    ),
);
const ImageDropdownComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/ImageDropdown/ImageDropdown.vue"
    ),
);
const RadioComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/Radio/Radio.vue"
    ),
);
const ImageRadioComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/ImageRadio/ImageRadio.vue"
    ),
);
const ToggleComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/Toggle/Toggle.vue"
    ),
);
const CheckboxComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/Checkbox/Checkbox.vue"
    ),
);
const ImageCheckboxComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/ImageCheckbox/ImageCheckbox.vue"
    ),
);
const DatePickerComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/DatePicker/DatePicker.vue"
    ),
);
const TimePickerComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/TimePicker/TimePicker.vue"
    ),
);
const RangeComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/Range/Range.vue"
    ),
);
const MultiRangeComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/MultiRange/MultiRange.vue"
    ),
);
const FileUploadComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/FileUpload/FileUpload.vue"
    ),
);
const HtmlComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/Html/Html.vue"
    ),
);
const GeolocationComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/Geolocation/Geolocation.vue"
    ),
);
const DividerComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/Divider/Divider.vue"
    ),
);
const ValidationFormComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/ValidationForm/ValidationForm.vue"
    ),
);
const RepeaterComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/Repeater/Repeater.vue"
    ),
);
const TotalComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/Total/Total.vue"
    ),
);

const GroupComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/Group/Group.vue"
    ),
);

const SectionComponent = defineAsyncComponent(
  () =>
    import(
      "@/admin/features/builder/calculator/CalculatorFields/Section/Section.vue"
    ),
);

// ── Type → Component mapping (exact types from PHP CCBFieldsHelper) ────
const fieldComponentMap: Record<string, Component> = {
  "cost-text": TextComponent,
  "cost-quantity": QuantityComponent,
  "cost-drop-down": DropdownComponent,
  "cost-drop-down-with-image": ImageDropdownComponent,
  "cost-radio": RadioComponent,
  "cost-radio-with-image": ImageRadioComponent,
  "cost-toggle": ToggleComponent,
  "cost-checkbox": CheckboxComponent,
  "cost-checkbox-with-image": ImageCheckboxComponent,
  "date-picker": DatePickerComponent,
  "time-picker": TimePickerComponent,
  "cost-range": RangeComponent,
  "cost-multi-range": MultiRangeComponent,
  "cost-file-upload": FileUploadComponent,
  "cost-html": HtmlComponent,
  "cost-geolocation": GeolocationComponent,
  "cost-line": DividerComponent,
  "cost-validated-form": ValidationFormComponent,
  "cost-total": TotalComponent,
  "cost-group": GroupComponent,
};

function resolveFieldComponent(type: string): Component | null {
  return fieldComponentMap[type] || null;
}

// ── SortableJS group config for container children ─────────────────────
// Rejects group/repeater from being dropped inside another container
function canAcceptInContainer(
  _to: unknown,
  _from: unknown,
  dragEl: HTMLElement,
): boolean {
  const draggedType = dragEl.getAttribute("data-field-type") || "";
  return !CONTAINER_TYPES.includes(draggedType);
}

const containerChildrenGroup = {
  name: "fields",
  put: canAcceptInContainer,
};

// ── SortableJS group config for section rows ───────────────────────────
// Rejects drops that would put a regular field next to a container,
// or a container next to other fields (containers must be alone in row).
function canAcceptInRow(
  to: { el?: HTMLElement } | unknown,
  _from: unknown,
  dragEl: HTMLElement,
): boolean {
  const draggedType = dragEl.getAttribute("data-field-type") || "";
  const draggedIsContainer = CONTAINER_TYPES.includes(draggedType);

  const toEl =
    to && typeof to === "object" && "el" in to
      ? (to as { el?: HTMLElement }).el
      : (to as HTMLElement);
  if (!(toEl instanceof HTMLElement)) return true;

  const items = Array.from(toEl.children).filter(
    (el) =>
      el instanceof HTMLElement &&
      el.classList.contains("ccb-field-item") &&
      el.getAttribute("data-field-alias") !==
        dragEl.getAttribute("data-field-alias"),
  );

  if (items.length === 0) return true;

  const rowHasContainer = items.some((el) => {
    const type = (el as HTMLElement).getAttribute("data-field-type") || "";
    return CONTAINER_TYPES.includes(type);
  });

  if (draggedIsContainer) return false;
  if (rowHasContainer) return false;

  return true;
}

const rowFieldsGroup = {
  name: "fields",
  put: canAcceptInRow,
};

// ── Container field helpers (group + repeater) ─────────────────────────
const containerCollapsed = reactive<Record<string, boolean>>({});

const isTotalField = (field: IField): boolean => {
  return field.type === "total";
};

function isContainerField(field: IField): field is IGroupField {
  return (
    CONTAINER_TYPES.includes(field.type) ||
    ("groupElements" in field &&
      Array.isArray((field as IGroupField).groupElements))
  );
}

function getGroupElements(field: IField): IField[] {
  if (isContainerField(field)) {
    return field.groupElements;
  }
  return [];
}

function setGroupElements(field: IField, value: IField[]) {
  if (isContainerField(field)) {
    field.groupElements = value;
  }
}

function toggleContainerCollapse(fieldId: string) {
  containerCollapsed[fieldId] = !containerCollapsed[fieldId];
}

function getFieldId(field: IField): string {
  return String(field._id ?? field.alias);
}

function getFieldKey(field: IField): string | number {
  return field._id ?? field.alias;
}

function isFieldSelected(field: IField): boolean {
  return builderStore.getSelectedFieldAlias === field.alias;
}

function isSectionSelected(section: ISection): boolean {
  return builderStore.getSelectedFieldAlias === section.alias;
}

function selectField(field: IField) {
  builderStore.setPageNavigationSelected(false);
  builderStore.setSelectedField(field.alias);
  setBuilderSidebarContent();
  builderStore.setBuilderContent("calculator");

  if (builderStore.getSidebarCollapse) {
    builderStore.setSidebarCollapse(false);
  }
}

function openSectionSettings(section: ISection) {
  builderStore.setPageNavigationSelected(false);
  builderStore.setSelectedField(section.alias);
  builderStore.setSidebarContent("builder");
  setBuilderSidebarContent();
  if (builderStore.getSidebarCollapse) {
    builderStore.setSidebarCollapse(false);
  }
  builderStore.setBuilderContent("calculator");
}

function openFieldSettings(field: IField) {
  builderStore.setSelectedField(field.alias);
  builderStore.setSidebarContent("builder");
  setBuilderSidebarContent();
  builderStore.setBuilderContent("calculator");
}

function duplicateField(field: IField) {
  builderStore.duplicateField(field.alias);
}

function deleteField(field: IField) {
  builderStore.deleteField(field.alias);
}

// ── Section actions ────────────────────────────────────────────────────
function addSection() {
  builderStore.addSection(builderStore.activePage);
}

function removeSection(pageIndex: number, sectionIndex: number) {
  builderStore.removeSection(pageIndex, sectionIndex);
}

// ── Page actions ───────────────────────────────────────────────────────
function editPage() {
  builderStore.setSelectedField(null);
  builderStore.setPageSettingsSelected(true);
  builderStore.setBuilderContent("calculator");
  builderStore.setSidebarContent("builder");
}

const deletePageConfirmVisible = ref(false);
const pendingDeletePageIndex = ref<number | null>(null);

function requestDeletePage(pageIndex: number) {
  pendingDeletePageIndex.value = pageIndex;
  deletePageConfirmVisible.value = true;
}

function confirmDeletePage() {
  if (pendingDeletePageIndex.value !== null) {
    builderStore.removePage(pendingDeletePageIndex.value);
  }
  pendingDeletePageIndex.value = null;
}

function cancelDeletePage() {
  pendingDeletePageIndex.value = null;
}

// Page navigation
const pageBreakAvailable = computed(() => {
  return builderStore.getPages.length + (summaryLastPage.value ? 1 : 0) > 1;
});

watch([summaryLastPage, summaryPageIndex], () => {
  const lastPageIndex = Math.max(
    summaryLastPage.value ? summaryPageIndex.value : summaryPageIndex.value - 1,
    0,
  );

  if (builderStore.activePage > lastPageIndex) {
    builderStore.setActivePage(lastPageIndex);
  }
});

// ── Field resize ───────────────────────────────────────────────────────
const MIN_FIELD_WIDTH = 10;
const MAX_FIELD_WIDTH = 100;

function clampFieldWidth(value: number): number {
  return Math.min(
    MAX_FIELD_WIDTH,
    Math.max(MIN_FIELD_WIDTH, Math.round(value)),
  );
}

function readFieldWidthPercent(el: HTMLElement): number {
  const inline = el.style.width;
  const match = inline.match(/(\d+(?:\.\d+)?)\s*%/);
  if (match) return parseFloat(match[1]);
  return MAX_FIELD_WIDTH;
}

function getResizeMaxWidth(fieldEl: HTMLElement): number {
  const container = fieldEl.parentElement;
  if (!container) return MAX_FIELD_WIDTH;

  if (
    container.classList.contains("ccb-group__fields") ||
    container.classList.contains("ccb-repeater-field__drop-zone")
  ) {
    return MAX_FIELD_WIDTH;
  }

  let usedWidth = 0;
  for (const sibling of Array.from(container.children)) {
    if (sibling === fieldEl) continue;
    if (!(sibling instanceof HTMLElement)) continue;
    if (!sibling.classList.contains("ccb-field-item")) continue;
    usedWidth += readFieldWidthPercent(sibling);
  }

  return Math.max(MIN_FIELD_WIDTH, MAX_FIELD_WIDTH - usedWidth);
}

const resizingFieldAlias = ref<string | null>(null);
const resizeStartX = ref(0);
const resizeStartWidth = ref(100);
const resizeContainerWidth = ref(0);
const resizeMaxWidth = ref(MAX_FIELD_WIDTH);

function onResizeStart(event: MouseEvent, field: IField) {
  event.preventDefault();
  event.stopPropagation();

  resizingFieldAlias.value = field.alias;
  resizeStartX.value = event.clientX;
  resizeStartWidth.value = clampFieldWidth(Number(field.width) || 100);

  const fieldEl = (event.target as HTMLElement).closest(
    ".ccb-field-item",
  ) as HTMLElement | null;
  const container = fieldEl?.parentElement;
  if (container) {
    resizeContainerWidth.value = container.offsetWidth;
  }
  resizeMaxWidth.value = fieldEl ? getResizeMaxWidth(fieldEl) : MAX_FIELD_WIDTH;

  selectField(field);

  document.addEventListener("mousemove", onResizeMove);
  document.addEventListener("mouseup", onResizeEnd);
}

function onResizeMove(event: MouseEvent) {
  if (!resizingFieldAlias.value || !resizeContainerWidth.value) return;

  const deltaX = event.clientX - resizeStartX.value;
  const deltaPercent = (deltaX / resizeContainerWidth.value) * 100;
  const rawWidth = resizeStartWidth.value + deltaPercent;
  const nextWidth = Math.min(resizeMaxWidth.value, clampFieldWidth(rawWidth));

  builderStore.updateFieldWidth(resizingFieldAlias.value, nextWidth);
}

function onResizeEnd() {
  resizingFieldAlias.value = null;
  document.removeEventListener("mousemove", onResizeMove);
  document.removeEventListener("mouseup", onResizeEnd);
}

onBeforeUnmount(() => {
  document.removeEventListener("mousemove", onResizeMove);
  document.removeEventListener("mouseup", onResizeEnd);
  document.removeEventListener("mousemove", onSummaryResizeMove);
  document.removeEventListener("mouseup", onSummaryResizeEnd);
  document.body.style.userSelect = "";
  document.body.style.cursor = "";
});

const {
  accentColor,
  textColor,
  formFieldsColor,
  descriptionColor,
  containerDarkColor,
  borderColor,
  borderWidth,
  borderStyle,
  borderRadius,
} = useAppearanceColors();

const {
  labelFontSize,
  labelFontWeight,
  descriptionFontSize,
  descriptionFontWeight,
  fieldsBtnFontSize,
  fieldsBtnFontWeight,
} = useAppearanceTypography();

const {
  fieldSideIndent,
  fieldSpacing,
  fieldButtonHeight,
  summarySpacing,
  summaryGroupSpacing,
  grandTotalSpacing,
  containerMarginTop,
  containerMarginBottom,
  containerMarginLeft,
  containerMarginRight,
  containerPaddingTop,
  containerPaddingBottom,
  containerPaddingLeft,
  containerPaddingRight,
} = useAppearanceSpacing();

const getSectionFields = computed(() => {
  const proFieldsMap: Record<string, boolean> = {
    geolocation: true,
    "multi-range": true,
    "date-picker": true,
    "time-picker": true,
    repeater: true,
    "validated-form": true,
    "group-field": true,
    "file-upload": true,
    "drop-down-with-image": true,
    "checkbox-with-image": true,
    "radio-with-image": true,
    group: true,
  };
  return (fields: IField[]): IField[] => {
    if (appStore.getIsPro) return fields;
    return fields.filter((field) => {
      return !proFieldsMap[field.type];
    });
  };
});
</script>

<style lang="scss">
.ccb-calculator-content {
  --ccb-field-side-indent: v-bind(fieldSideIndent);
  --ccb-field-spacing: v-bind(fieldSpacing);
  --ccb-summary-spacing: v-bind(summarySpacing);
  --ccb-summary-group-spacing: v-bind(summaryGroupSpacing);
  --ccb-grand-total-spacing: v-bind(grandTotalSpacing);
  --ccb-container-margin-top: v-bind(containerMarginTop);
  --ccb-container-margin-bottom: v-bind(containerMarginBottom);
  --ccb-container-margin-left: v-bind(containerMarginLeft);
  --ccb-container-margin-right: v-bind(containerMarginRight);
  --ccb-container-padding-top: v-bind(containerPaddingTop);
  --ccb-container-padding-bottom: v-bind(containerPaddingBottom);
  --ccb-container-padding-left: v-bind(containerPaddingLeft);
  --ccb-container-padding-right: v-bind(containerPaddingRight);
  --ccb-field-button-height: v-bind(fieldButtonHeight);
  --ccb-field-label-font-size: v-bind(labelFontSize);
  --ccb-field-label-font-weight: v-bind(labelFontWeight);
  --ccb-description-font-size: v-bind(descriptionFontSize);
  --ccb-description-font-weight: v-bind(descriptionFontWeight);

  width: 100%;
  border-radius: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 200px);
  padding: 20px 12px 10px;
  max-width: v-bind(calculatorWidth);
  margin-left: auto;
  margin-right: auto;

  .ccb-calculator-content__wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    align-items: flex-start;
  }

  &__page-navigation {
    width: 100%;
    flex-shrink: 0;
  }

  &__page-navigation-bottom {
    order: 1;
  }

  &__page-navigation-hidden {
    .ccb-page-navigation-component {
      opacity: 0.5;
    }
  }

  &__bottom {
    width: 100%;
    display: flex;
    gap: 12px;
    margin-top: auto;
    flex-shrink: 0;
    position: relative;
    overflow: visible;

    &--summary-left {
      flex-direction: row-reverse;
    }

    &--summary-right {
      flex-direction: row;
    }

    &--summary-bottom {
      flex-direction: column;
    }
  }

  &__builder {
    min-width: 0;
  }

  &__summary {
    min-width: 0;
    overflow: visible;
    margin: var(--ccb-container-margin-top, 0)
      var(--ccb-container-margin-right, 0) var(--ccb-container-margin-bottom, 0)
      var(--ccb-container-margin-left, 0);
  }

  &__resizer {
    position: relative;
    flex: 0 0 8px;
    align-self: stretch;
    min-height: 80px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    cursor: col-resize;
    user-select: none;
    touch-action: none;
    color: rgba(0, 0, 0, 0.08);

    &::before {
      content: "";
      position: absolute;
      top: 8px;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 1px;
      background-image: linear-gradient(
        to bottom,
        currentColor 0,
        currentColor 4px,
        transparent 4px,
        transparent 8px
      );
      background-size: 1px 8px;
      background-repeat: repeat-y;
      transition: color 0.15s ease;
    }

    &:hover,
    &.is-active {
      color: var(--ccb-blue-bg-normal, #007ac6);
    }
  }

  &__resizer-badge {
    position: fixed;
    z-index: 9999;
    transform: translate(-50%, calc(-100% - 16px));
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    padding: 0 8px;
    border-radius: 99px;
    background: rgba(0, 0, 0, 0.8);
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    pointer-events: none;
  }

  &__sections {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }

  &__add-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    margin-top: 16px;
    border: 2px dashed var(--ccb-green-bg-normal, #22c55e);
    border-radius: 8px;
    background: transparent;
    color: var(--ccb-green-bg-normal, #22c55e);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    i {
      font-size: 10px;
    }

    &:hover {
      background: rgba(34, 197, 94, 0.05);
      border-color: var(--ccb-green-bg-hover, #16a34a);
    }
  }
}

// ── Page header ────────────────────────────────────────────────────────
.ccb-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  margin-bottom: 16px;
  color: v-bind(textColor);

  &__title {
    font-size: 20px;
    font-weight: 700;
    color: var(--ccb-font-title, #001931);
    line-height: 26px;
  }

  &__settings {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: var(--ccb-font-comment, #9ca3af);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;

    i {
      font-size: 16px;
    }

    &:hover {
      background: var(--ccb-blue-bg-dull-normal, #eff6ff);
      color: var(--ccb-blue-bg-normal, #007ac6);
    }
  }
}

// ── Page wrapper ───────────────────────────────────────────────────────
.ccb-page-wrapper {
  overflow: visible;

  &--bordered {
    border: 1px solid var(--ccb-blue-bg-normal, #007ac6);
    border-radius: 16px;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
    padding: 28px 24px 24px;
    margin-top: 8px;
    overflow: visible;
  }

  &__controls {
    position: absolute;
    top: -14px;
    right: -1px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    height: 28px;
    padding: 0 16px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 99px;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
    z-index: 5;
  }

  &__control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: none;
    background: transparent;
    color: #dbeafe;
    cursor: pointer;
    padding: 0;

    i {
      font-size: 14px;
    }

    &:hover {
      color: #ffffff;
    }
  }
}

// ── Section (admin chrome) ─────────────────────────────────────────────
.ccb-section {
  color: v-bind(textColor);
  transition: border-color 0.15s ease;
  margin: v-bind(containerMarginTop) v-bind(containerMarginRight)
    v-bind(containerMarginBottom) v-bind(containerMarginLeft);

  &:hover {
    border-color: var(--ccb-blue-bg-normal, #0b79d0) !important;
  }

  &--selected {
    border-color: var(--ccb-blue-bg-normal, #0b79d0) !important;
  }

  &--ghost {
    opacity: 0.5;
    background: var(--ccb-blue-bg-dull-normal, #eff6ff) !important;
    border: 2px dashed var(--ccb-blue-bg-normal, #3b82f6) !important;
  }

  &__handle {
    cursor: grab;
    display: flex;
    align-items: center;
    font-size: 18px;
    letter-spacing: -2px;
    user-select: none;

    &:active {
      cursor: grabbing;
    }
  }

  &__title-fallback {
    font-size: 16px;
    font-weight: 600;
    flex: 1;
    color: v-bind(textColor);
  }

  &__remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: v-bind(textColor);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;

    i {
      font-size: 14px;
    }

    &:hover {
      background: var(--ccb-red-bg-dull-normal, #fef2f2);
      color: var(--ccb-red-fg-normal, #ef4444);
    }
  }

  &__body {
    position: relative;
    min-height: 80px;
    overflow: visible;
  }

  &__rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    border-radius: 4px;
    min-height: 68px;
    overflow: visible;
  }

  &__rows--empty {
    border: 2px dashed v-bind(borderColor);
    border-radius: 8px;
  }

  &__placeholder {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ccb-font-comment, #9ca3af);
    font-size: 14px;
    pointer-events: none;
    user-select: none;
  }
}

// ── Row (virtual layout layer) ─────────────────────────────────────────
.ccb-row {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 8px;
  width: 100%;
  min-height: 48px;
  padding: 4px;
  overflow: visible;
  border: 1px dashed transparent;
  border-radius: 8px;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;

  &:hover {
    border-color: rgba(11, 121, 208, 0.18);
  }

  &__fields {
    display: flex;
    flex: 1 1 auto;
    flex-wrap: nowrap;
    align-items: stretch;
    width: 100%;
    min-height: 40px;
    gap: 0;
    overflow: visible;
  }

  &__hint {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    padding: 0 8px;
    font-size: 11px;
    pointer-events: none;
    user-select: none;

    &--new {
      flex: 1;
      justify-content: center;
      color: v-bind(textColor);
      font-weight: 500;
      opacity: 0.7;
    }
  }

  &__new-zone-drop,
  &__inter-zone-drop {
    display: flex;
    flex: 1 1 auto;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    min-height: inherit;
  }

  &--new-zone {
    border-color: transparent;
    background: transparent;
    min-height: 12px;
    padding: 0;
    align-items: stretch;
    justify-content: flex-start;

    &:hover {
      border-color: transparent;
      background: transparent;
    }
  }

  &--inter-zone {
    border-color: transparent;
    background: transparent;
    min-height: 10px;
    padding: 0;
    margin: -2px 0;
    align-items: stretch;
    justify-content: flex-start;

    &:hover {
      border-color: transparent;
      background: transparent;
    }
  }

  &--new-zone-only {
    position: relative;
    min-height: 80px;
    padding: 4px;
    border-color: v-bind(borderColor);
    background: transparent;

    .ccb-row__new-zone-drop {
      min-height: 72px;
    }

    .ccb-row__hint--new {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: v-bind(textColor);
      font-weight: 400;
      opacity: 0.8;
      pointer-events: none;
    }
  }
}

// ── Field item (clean — only component visible) ────────────────────────
.ccb-field-item {
  position: relative;
  box-sizing: border-box;
  cursor: default;
  transition: all 0.15s ease;
  pointer-events: auto;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 8px;
  overflow: visible;
  container-type: inline-size;

  &:hover,
  &--selected {
    border-color: var(--ccb-blue-bg-normal, #0b79d0);
  }

  &:hover > &__controls,
  &--selected > &__controls {
    opacity: 1;
    pointer-events: auto;
  }

  &:hover > &__resize-handle,
  &--selected > &__resize-handle {
    opacity: 1;
  }

  &:deep(.ccb-field) {
    pointer-events: none;
    user-select: none;
  }

  &--ghost {
    opacity: 0.4;
    background: var(--ccb-blue-bg-dull-normal, #eff6ff);
    border: 2px dashed var(--ccb-blue-bg-normal, #3b82f6);
    border-radius: 8px;
  }

  &--is-container {
    cursor: default;
  }

  &--resizing {
    .ccb-field-item__resize-handle {
      opacity: 1;
    }

    cursor: col-resize;
  }

  &__resize-handle {
    position: absolute;
    top: 50%;
    right: -4px;
    transform: translateY(-50%);
    width: 8px;
    height: 32px;
    cursor: col-resize;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 10;
    background: var(--ccb-blue-bg-normal);
    color: #fff;
    border-radius: 4px;

    span {
      width: 2px;
      height: 2px;
      background: #fff;
    }
  }

  &__fallback {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    background: white;
    border: 1px solid var(--ccb-border-normal, #e5e7eb);
    border-radius: 8px;

    i {
      font-size: 20px;
      color: var(--ccb-font-comment, #9ca3af);
    }

    span {
      font-size: 13px;
      font-weight: 500;
      color: var(--ccb-font-title, #111827);
    }

    &-type {
      font-size: 11px !important;
      font-weight: 400 !important;
      color: var(--ccb-font-comment, #9ca3af) !important;
      background: var(--ccb-wb-normal, #f3f4f6);
      padding: 2px 8px;
      border-radius: 4px;
      margin-left: auto;
    }
  }

  &__controls {
    position: absolute;
    top: -17px;
    right: 12px;
    left: auto;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--ccb-blue-bg-normal);
    border: 1px solid var(--ccb-blue-bg-normal);
    border-radius: 999px;
    padding: 0px 6px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
    z-index: 20;
    white-space: nowrap;
  }

  // Narrow fields: center the toolbar so it stays inside the field bounds.
  @container (max-width: 220px) {
    &__controls {
      right: auto;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  &__action {
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;

    i {
      font-size: 14px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.18);
      color: #ffffff;
    }

    &--danger:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #fee2e2;
    }
  }

  &__drag-handle {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }
}

.ccb-field {
  position: relative;

  .ccb-field__label {
    .ccb-field__title {
      color: v-bind(textColor) !important;
      font-size: v-bind(labelFontSize);
      font-weight: v-bind(labelFontWeight);
      margin-bottom: 3px;
      line-height: normal;
    }
  }

  .ccb-field__descriptions {
    .ccb-field__description {
      color: v-bind(descriptionColor) !important;
      font-size: v-bind(descriptionFontSize);
      font-weight: v-bind(descriptionFontWeight);
      line-height: normal;
    }
  }

  .ccb-field__input-wrapper {
    input {
      background-color: v-bind(formFieldsColor);
      color: v-bind(textColor);
      border: v-bind(borderWidth) v-bind(borderStyle) v-bind(borderColor);
      border-radius: v-bind(borderRadius);
    }

    .ccb-dropdown__input {
      background-color: v-bind(formFieldsColor);
      color: v-bind(textColor);
      border: v-bind(borderWidth) v-bind(borderStyle) v-bind(borderColor);
      border-radius: v-bind(borderRadius);
    }
  }

  .ccb-dropdown {
    .ccb-dropdown__input {
      background-color: v-bind(formFieldsColor);
      color: v-bind(textColor);
      border: v-bind(borderWidth) v-bind(borderStyle) v-bind(borderColor);
      border-radius: v-bind(borderRadius);
    }
    &__label {
      color: v-bind(textColor);
      font-size: v-bind(fieldsBtnFontSize);
      font-weight: v-bind(fieldsBtnFontWeight);
      line-height: normal;
    }
  }

  .ccb-default-radio-image {
    .ccb-radio-image__label {
      color: v-bind(textColor) !important;
    }

    .ccb-radio-image__info {
      .ccb-radio-image__title-box {
        .ccb-radio-image__label {
          font-size: v-bind(fieldsBtnFontSize) !important;
          font-weight: v-bind(fieldsBtnFontWeight);
          line-height: normal;
        }
      }
    }

    input {
      background-color: v-bind(formFieldsColor);

      &:checked {
        border-color: v-bind(accentColor);
        background-color: v-bind(accentColor);

        &::before {
          border-color: v-bind(accentColor);
          background-color: v-bind(accentColor);
        }
      }
    }
  }

  .ccb-default-image-radio-withicon {
    .ccb-radio-image__info {
      .ccb-radio-image__title-box {
        .ccb-radio-image__label {
          font-size: v-bind(fieldsBtnFontSize) !important;
          font-weight: v-bind(fieldsBtnFontWeight);
          line-height: normal;
        }
      }
    }
  }

  .ccb-default-checkbox,
  .ccb-box-checkbox,
  .ccb-box-with-checkbox,
  .ccb-box-with-checkbox-description,
  .ccb-box-with-heading-checkbox-description {
    .ccb-checkbox-label {
      font-size: v-bind(fieldsBtnFontSize) !important;
      font-weight: v-bind(fieldsBtnFontWeight);
      line-height: normal;
    }
  }

  .ccb-default-checkbox-image,
  .ccb-default-image-checkbox-withicon {
    .ccb-checkbox-image__info {
      .ccb-checkbox-image__title-box {
        .ccb-checkbox-image__label {
          font-size: v-bind(fieldsBtnFontSize) !important;
          font-weight: v-bind(fieldsBtnFontWeight);
          line-height: normal;
        }
      }
    }
  }

  .ccb-datePicker {
    input {
      font-size: v-bind(fieldsBtnFontSize) !important;
      font-weight: v-bind(fieldsBtnFontWeight);
      line-height: normal;
    }
  }

  .ccb-default-radio {
    color: v-bind(textColor);

    .ccb-radio-label {
      color: v-bind(textColor) !important;
      font-size: v-bind(fieldsBtnFontSize);
      font-weight: v-bind(fieldsBtnFontWeight);
      line-height: normal;
    }

    input {
      background-color: v-bind(formFieldsColor);

      &:checked {
        background-color: v-bind(accentColor);
      }

      &::before {
        background-color: v-bind(formFieldsColor);
      }
    }
  }

  .ccb-default-toggle,
  .ccb-box-toggle {
    &.ccb-box-with-toggle-and-description {
      .ccb-toggle-item {
        .ccb-toggle-item__label {
          font-size: v-bind(fieldsBtnFontSize) !important;
          font-weight: v-bind(fieldsBtnFontWeight);
          line-height: normal;
        }

        .ccb-toggle-item__label-wrap {
          .ccb-toggle-item__label {
            font-size: v-bind(fieldsBtnFontSize) !important;
            font-weight: v-bind(fieldsBtnFontWeight);
            line-height: normal;
          }
        }
      }
    }
    .ccb-toggle-item {
      .ccb-toggle-item__label {
        font-size: v-bind(fieldsBtnFontSize) !important;
        font-weight: v-bind(fieldsBtnFontWeight);
        line-height: normal;
        color: v-bind(textColor);
      }
    }

    label {
      background-color: v-bind(formFieldsColor);
    }

    .ccb-toggle-wrapper {
      input:checked + label {
        background: v-bind(accentColor);
      }
    }
  }

  .ccb-text-field {
    textarea {
      border: v-bind(borderWidth) v-bind(borderStyle) v-bind(borderColor);
      border-radius: v-bind(borderRadius);
    }
  }

  .ccb-field-quantity {
    input {
      border: v-bind(borderWidth) v-bind(borderStyle) v-bind(borderColor);
      border-radius: v-bind(borderRadius);
      font-size: v-bind(fieldsBtnFontSize) !important;
      font-weight: v-bind(fieldsBtnFontWeight);
      line-height: normal;
    }
  }

  .ccb-input-counter {
    background-color: v-bind(containerDarkColor);
    color: v-bind(textColor);
  }
}
</style>
