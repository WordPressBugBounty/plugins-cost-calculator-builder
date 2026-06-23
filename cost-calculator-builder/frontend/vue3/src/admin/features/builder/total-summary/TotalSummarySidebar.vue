<template>
  <div class="ccb-total-summary-sidebar ccb-sidebar ccb-custom-scrollbar">
    <div class="ccb-sidebar__body">
      <div class="ccb-total-summary-sidebar__block">
        <Text text="Total Summary" size="mx" weight="bold" />
        <Toggle v-model="sticky" label="Sticky" size="m" weight="medium" />
        <Toggle
          v-model="zeroValuesForOrders"
          label="Zero values in Orders, PDF Entries, Emails"
          size="m"
          weight="medium"
        />
        <Toggle
          v-model="mobileMode"
          label="Mobile Mode"
          size="m"
          weight="medium"
        />
        <MultiSelect
          :items="totalFields"
          v-model="miniWidgetFormulas"
          label="Mini Widget Formulas"
          size="m"
          weight="medium"
          :maxItemsSelected="3"
        />
      </div>

      <div class="ccb-total-summary-sidebar__block">
        <div class="ccb-total-summary-sidebar__head">
          <Text text="Arrangement" size="mx" weight="bold" />
        </div>

        <VueDraggable
          v-model="sections"
          handle=".ccb-summary-section__drag"
          group="summary-sections"
          class="ccb-summary-sections"
          :animation="150"
          @end="normalizeSections"
        >
          <div
            v-for="section in sections"
            :key="section.id"
            class="ccb-summary-section"
          >
            <div class="ccb-summary-section__header">
              <div class="ccb-summary-section__left">
                <Text :text="section.title" size="s" weight="medium" />
              </div>
              <div class="ccb-summary-section__actions">
                <button
                  class="ccb-summary-section__action"
                  :class="{ 'is-disabled': sections.length <= 1 }"
                  type="button"
                  @click.stop="deleteSection(section.id)"
                >
                  <i class="ccb-icon-ic_delete"></i>
                </button>
                <button
                  class="ccb-summary-section__action ccb-summary-section__drag"
                  type="button"
                >
                  <i class="ccb-icon-ic_drag"></i>
                </button>
              </div>
            </div>
            <VueDraggable
              v-model="section.items"
              group="summary-items"
              class="ccb-summary-items"
              :animation="150"
              :draggable="'.ccb-summary-item'"
              handle=".ccb-summary-item__drag"
              :move="onItemMove"
              @end="normalizeSections"
            >
              <div
                v-for="item in section.items"
                :key="item.id"
                class="ccb-summary-item"
                :class="{ disabled: checkIsDisabled(item.alias) }"
              >
                <div class="ccb-summary-item__left">
                  <i class="ccb-icon-ic_drag ccb-summary-item__drag"></i>
                  <Text :text="item.title" size="m" weight="medium" />
                </div>

                <div
                  v-if="showItemActions(item.alias)"
                  class="ccb-summary-item__actions"
                >
                  <button
                    v-if="showSetupButton(item.alias)"
                    class="ccb-summary-item__setup"
                    @click.stop="openSettingsByItem(item.alias)"
                  >
                    <Text text="SET UP" size="xs" weight="medium" />
                  </button>
                  <button
                    class="ccb-summary-item__options"
                    :class="{ 'is-hidden': !hasOptions(item.alias) }"
                    @click.stop="openSetup(item.id, $event)"
                  >
                    <i class="ccb-icon-ic_menu_v"></i>
                  </button>
                </div>
              </div>
            </VueDraggable>
            <div
              v-if="section.items.length === 0"
              class="ccb-summary-section__empty"
            >
              <Text text="Drag widgets here" size="s" weight="regular" />
            </div>
          </div>
        </VueDraggable>

        <div class="ccb-total-summary-sidebar__add-section">
          <Button
            label="Add Section"
            size="s"
            type="green-ghost"
            :onClick="addSection"
          />
        </div>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div class="ccb-setup-popup-layer" v-if="selectedItem" @click="closeSetup">
      <div
        class="ccb-setup-popup"
        ref="setupPopupRef"
        :style="{
          top: `calc(${setupPopupPosition.top}px + 10px)`,
          left: `calc(${setupPopupPosition.left}px - 36px)`,
        }"
        @click.stop
      >
        <div v-if="selectedItem.alias === 'total_summary'">
          <Input
            label="Title"
            placeholder="Enter title"
            :modelValue="setupDraft.title"
            @update:modelValue="onDraftTitleChange"
          />
          <div class="ccb-setup-popup__actions">
            <Button
              label="Cancel"
              size="s"
              type="default"
              :onClick="closeSetup"
            />
            <Button
              label="OK"
              size="s"
              type="blue-ghost"
              :onClick="applySetup"
            />
          </div>
        </div>

        <div v-if="selectedItem.alias === 'details'">
          <Radio
            label=""
            :options="detailsStateOptions"
            :modelValue="setupDraft.default_state"
            layout="column"
            @update:modelValue="onDraftDetailsStateChange"
          />
          <span class="ccb-setup-popup__separator"></span>
          <Checkbox
            :modelValue="Boolean(setupDraft.show_zero_values)"
            :options="[{ label: 'Show zero values', value: true }]"
            template="rows"
            @update:modelValue="
              (value) => onDraftDetailsShowZeroChange(Boolean(value))
            "
          />
          <Checkbox
            :modelValue="Boolean(setupDraft.cost_breakdown)"
            :options="[{ label: 'Cost breakdown', value: true }]"
            template="rows"
            @update:modelValue="
              (value) => onDraftDetailsCostBreakdownChange(Boolean(value))
            "
          />
          <div class="ccb-setup-popup__actions">
            <Button
              label="Cancel"
              size="s"
              weight="medium"
              type="default"
              :onClick="closeSetup"
            />
            <Button
              label="OK"
              size="s"
              weight="medium"
              type="blue-ghost"
              :onClick="applySetup"
            />
          </div>
        </div>

        <div v-if="isButtonItem(selectedItem.alias)">
          <Range
            label="Width"
            :modelValue="Number(setupDraft.width || 100)"
            :min="30"
            :max="100"
            :step="1"
            suffix="%"
            @update:modelValue="onDraftButtonWidthChange"
          />
          <div class="ccb-setup-popup__actions">
            <Button
              label="Cancel"
              size="s"
              type="default"
              :onClick="closeSetup"
            />
            <Button
              label="OK"
              size="s"
              type="blue-ghost"
              :onClick="applySetup"
            />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useTotalSummaryStore } from "@/admin/app/providers/stores/useTotalSummaryStore";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { useDiscountsStore } from "@/admin/app/providers/stores/useDiscountsStore";
import { useCommonSettings } from "@/admin/features/settings/sections/composables/useCommonSettings";

import type {
  ITotalSummaryItem,
  ITotalSummarySection,
} from "@/admin/shared/types/settings.type";
import {
  Button,
  Input,
  Radio,
  Range,
  Text,
  Toggle,
  Checkbox,
  MultiSelect,
} from "@/admin/shared/ui/UIKit";

const settingsStore = useSettingsStore();

const discountsStore = useDiscountsStore();
const discounts = computed(() => discountsStore.getDiscounts);
const hasCoupons = computed(() =>
  discounts.value.some((discount) => discount.discount_status === "active"),
);

const builderStore = useBuilderStore();
const totalSummaryStore = useTotalSummaryStore();
const selectedItemId = ref<string>("");
const setupPopupRef = ref<HTMLElement | null>(null);
const setupAnchorRect = ref<DOMRect | null>(null);
const setupPopupPosition = ref({
  top: 0,
  left: 0,
});
const setupDraft = ref<{
  title: string;
  default_state: "expanded" | "collapsed";
  show_zero_values: boolean;
  cost_breakdown: boolean;
  width: number;
  layout: "horizontal" | "vertical";
}>({
  title: "",
  default_state: "expanded",
  show_zero_values: false,
  cost_breakdown: false,
  width: 100,
  layout: "horizontal",
});

const detailsStateOptions = [
  { label: "Expanded", value: "expanded" },
  { label: "Collapsed", value: "collapsed" },
];

const SETUP_POPUP_OFFSET = 8;
const SETUP_POPUP_VIEWPORT_PADDING = 8;

const totalSummary = computed({
  get() {
    return totalSummaryStore.getTotalSummary;
  },
  set(value) {
    if (value) totalSummaryStore.setTotalSummary(value);
  },
});

const { totalFields } = useCommonSettings();

const sticky = computed<boolean>({
  get: () => Boolean(totalSummary.value?.sticky),
  set: (value) => {
    if (!totalSummary.value) return;
    totalSummary.value.sticky = value;
  },
});

const miniWidgetFormulas = computed<string[]>({
  get: () => totalSummary.value?.mini_widget_formulas || [],
  set: (value) => {
    if (!totalSummary.value) return;
    totalSummary.value.mini_widget_formulas = value;
  },
});

const mobileMode = computed<boolean>({
  get: () => Boolean(totalSummary.value?.mobile_mode),
  set: (value) => {
    if (!totalSummary.value) return;
    totalSummary.value.mobile_mode = value;
  },
});

const zeroValuesForOrders = computed<boolean>({
  get: () => Boolean(totalSummary.value?.zero_values_for_orders_pdf_emails),
  set: (value) => {
    if (!totalSummary.value) return;
    totalSummary.value.zero_values_for_orders_pdf_emails = value;
  },
});

const sections = computed<ITotalSummarySection[]>({
  get: () => totalSummary.value?.arrangement_sections || [],
  set: (value) => {
    if (!totalSummary.value) return;
    totalSummary.value.arrangement_sections = value;
  },
});

const selectedItem = computed<ITotalSummaryItem | null>(() => {
  if (!selectedItemId.value) return null;
  for (const section of sections.value) {
    const item = section.items.find((i) => i.id === selectedItemId.value);
    if (item) return item;
  }
  return null;
});

function hasOptions(alias: string): boolean {
  return (
    alias === "total_summary" || alias === "details" || isButtonItem(alias)
  );
}

function showItemActions(alias: string): boolean {
  return hasOptions(alias) || showSetupButton(alias);
}

function showSetupButton(alias: string): boolean {
  return (
    (hasOptions(alias) && alias !== "total_summary" && alias !== "details") ||
    alias === "coupons"
  );
}

function isButtonItem(alias: string): boolean {
  return (
    alias === "purchase_button" ||
    alias === "pdf_button" ||
    alias === "share_button"
  );
}

function addSection() {
  sections.value.push({
    id: `summary_section_${Date.now()}`,
    title: `Section #${sections.value.length + 1}`,
    sort_id: sections.value.length + 1,
    items: [],
  });
  normalizeSections();
}

function deleteSection(sectionId: string) {
  if (sections.value.length <= 1) return;

  const sectionIndex = sections.value.findIndex((s) => s.id === sectionId);
  if (sectionIndex === -1) return;

  const sectionToDelete = sections.value[sectionIndex];
  const targetSectionIndex =
    sectionIndex < sections.value.length - 1
      ? sectionIndex + 1
      : sectionIndex - 1;
  const targetSection = sections.value[targetSectionIndex];
  if (!targetSection) return;

  const movedWidgetsCount = sectionToDelete.items.length;
  if (sectionToDelete.items.length > 0) {
    const confirmed = window.confirm(
      `This section contains ${movedWidgetsCount} widget(s). Delete section and move widgets to another section?`,
    );
    if (!confirmed) return;
  }

  targetSection.items.push(...sectionToDelete.items);
  sections.value.splice(sectionIndex, 1);
  normalizeSections();
}

function getSettingsSectionByAlias(alias: string): string {
  if (alias === "payments") return "payments";
  if (isButtonItem(alias)) return "order-form";
  if (alias === "total_summary" || alias === "details")
    return "warning-messages";
  return "currency";
}

function openSettingsByItem(alias: string) {
  if (alias === "coupons") {
    builderStore.setCurrentCalculatorPage("discounts");
    return;
  }

  if (alias === "pdf_button") {
    window.open(
      `${window.location.origin}/wp-admin/admin.php?page=cost_calculator_builder_settings&option=invoice`,
      "_blank",
    );
    return;
  }

  if (alias === "share_button") {
    window.open(
      `${window.location.origin}/wp-admin/admin.php?page=cost_calculator_builder_settings&option=share-quote-form`,
      "_blank",
    );
    return;
  }

  builderStore.setSettingsActiveSection(getSettingsSectionByAlias(alias));
  builderStore.setCurrentCalculatorPage("settings");
}

function onItemMove(): boolean {
  return true;
}

function normalizeSections() {
  let hasCouponsItem = false;

  sections.value.forEach((section) => {
    section.items.forEach((item) => {
      if (item.alias === "coupons") {
        hasCouponsItem = true;
      }
    });
  });

  if (!hasCouponsItem && sections.value[0]) {
    sections.value[0].items.push({
      id: "summary_item_coupons",
      title: "Coupons",
      alias: "coupons",
      sort_id: sections.value[0].items.length + 1,
      locked: false,
      static: false,
      draggable: true,
      options: {},
    });
  }

  sections.value.forEach((section, index) => {
    section.items = section.items.map((item, itemIdx) => ({
      ...item,
      sort_id: itemIdx + 1,
    }));
    section.sort_id = index + 1;
  });
}

function updateSelectedOptions(
  updater: (options: Record<string, unknown>) => Record<string, unknown>,
) {
  if (!selectedItem.value) return;
  selectedItem.value.options = updater({
    ...(selectedItem.value.options || {}),
  });
}

function onTitleChange(value: string) {
  updateSelectedOptions((options) => ({ ...options, title: value }));
}

function onDetailsStateChange(value: string) {
  updateSelectedOptions((options) => ({
    ...options,
    default_state: value === "collapsed" ? "collapsed" : "expanded",
  }));
}

function onDetailsShowZeroChange(value: boolean) {
  updateSelectedOptions((options) => ({ ...options, show_zero_values: value }));
}

function onDetailsCostBreakdownChange(value: boolean) {
  updateSelectedOptions((options) => ({ ...options, cost_breakdown: value }));
}

function onButtonWidthChange(value: number) {
  updateSelectedOptions((options) => ({ ...options, width: value }));
}

function updateSetupPopupPosition() {
  if (!setupAnchorRect.value) return;

  const popupWidth = setupPopupRef.value?.offsetWidth || 320;
  const popupHeight = setupPopupRef.value?.offsetHeight || 180;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top = setupAnchorRect.value.bottom + SETUP_POPUP_OFFSET;
  let left = setupAnchorRect.value.left;

  if (top + popupHeight > viewportHeight - SETUP_POPUP_VIEWPORT_PADDING) {
    top = setupAnchorRect.value.top - popupHeight - SETUP_POPUP_OFFSET;
  }

  top = Math.max(
    SETUP_POPUP_VIEWPORT_PADDING,
    Math.min(top, viewportHeight - popupHeight - SETUP_POPUP_VIEWPORT_PADDING),
  );
  left = Math.max(
    SETUP_POPUP_VIEWPORT_PADDING,
    Math.min(left, viewportWidth - popupWidth - SETUP_POPUP_VIEWPORT_PADDING),
  );

  setupPopupPosition.value = { top, left };
}

function openSetup(itemId: string, event?: MouseEvent) {
  selectedItemId.value = itemId;
  if (event?.currentTarget instanceof HTMLElement) {
    setupAnchorRect.value = event.currentTarget.getBoundingClientRect();
  }
  const item = selectedItem.value;
  if (!item) return;

  setupDraft.value = {
    title: String(item.options?.title || ""),
    default_state:
      item.options?.default_state === "collapsed" ? "collapsed" : "expanded",
    show_zero_values: Boolean(item.options?.show_zero_values),
    cost_breakdown: Boolean(item.options?.cost_breakdown),
    width: Number(item.options?.width || 100),
    layout: item.options?.layout === "vertical" ? "vertical" : "horizontal",
  };

  void nextTick(updateSetupPopupPosition);
}

function closeSetup() {
  selectedItemId.value = "";
  setupAnchorRect.value = null;
}

function applySetup() {
  if (!selectedItem.value) return;

  if (selectedItem.value.alias === "total_summary") {
    onTitleChange(setupDraft.value.title);
  }

  if (selectedItem.value.alias === "details") {
    onDetailsStateChange(setupDraft.value.default_state);
    onDetailsShowZeroChange(setupDraft.value.show_zero_values);
    onDetailsCostBreakdownChange(setupDraft.value.cost_breakdown);
  }

  if (isButtonItem(selectedItem.value.alias)) {
    onButtonWidthChange(setupDraft.value.width);
  }

  if (selectedItem.value.alias === "payments") {
    updateSelectedOptions((options) => ({
      ...options,
      layout: setupDraft.value.layout,
    }));
  }

  closeSetup();
}

function onDraftTitleChange(value: string | number) {
  setupDraft.value.title = String(value || "");
}

function onDraftDetailsStateChange(value: string) {
  setupDraft.value.default_state =
    value === "collapsed" ? "collapsed" : "expanded";
}

function onDraftDetailsShowZeroChange(value: boolean) {
  setupDraft.value.show_zero_values = value;
}

function onDraftDetailsCostBreakdownChange(value: boolean) {
  setupDraft.value.cost_breakdown = value;
}

function onDraftButtonWidthChange(value: number) {
  setupDraft.value.width = value;
}

function handleViewportChange() {
  if (!selectedItem.value) return;
  updateSetupPopupPosition();
}

onMounted(() => {
  normalizeSections();
  window.addEventListener("resize", handleViewportChange);
  window.addEventListener("scroll", handleViewportChange, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleViewportChange);
  window.removeEventListener("scroll", handleViewportChange, true);
});

const checkIsDisabled = (alias: string) => {
  if (alias === "payments") {
    // done
    return settingsStore.getOrderFormStatus || !settingsStore.getPaymentsStatus;
  } else if (alias === "purchase_button") {
    // done
    return !settingsStore.getOrderFormStatus;
  } else if (alias === "pdf_button") {
    return !settingsStore.getGeneralSettings?.invoice?.use_in_all;
  } else if (alias === "share_button") {
    return !settingsStore.getGeneralSettings?.invoice?.emailButton;
  } else if (alias === "coupons") {
    return !hasCoupons;
  }
};
</script>

<style scoped lang="scss">
.ccb-sidebar__body {
  display: flex;
  flex-direction: column;
  row-gap: 24px;
}

.ccb-total-summary-sidebar {
  width: 100%;
  height: calc(100vh - 175px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  color: var(--ccb-font-labels);

  &__add-section {
    display: flex;
    width: 100%;

    button {
      width: 100%;
      height: 32px;
    }
  }

  &__block {
    border-radius: 12px;
    background-color: var(--ccb-bgr-sidebar);
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.ccb-summary-sections {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
}

.ccb-summary-section {
  border: 1px dashed var(--ccb-border-normal);
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 8px;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__drag {
    color: var(--ccb-font-comment);
    cursor: grab;
  }

  &__actions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  &__action {
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--ccb-font-comment);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--ccb-transition-normal);

    &:hover {
      background: var(--ccb-blue-bg-dull-normal);
      color: var(--ccb-blue-fg-normal);
    }

    i {
      font-size: 16px;
    }

    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  &__empty {
    padding: 6px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ccb-font-comment);
  }
}

.ccb-summary-items {
  display: flex;
  flex-direction: column;
}

.ccb-summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  padding: 8px;
  background: transparent;
  padding: 0 8px;
  min-height: 48px;
  column-gap: 12px;

  &.disabled {
    .ccb-summary-item__left,
    .ccb-summary-item__options {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      font-size: 20px;
    }
  }

  &__setup {
    height: 24px;
    border: none;
    border-radius: 99px;
    background: var(--ccb-blue-bg-dull-normal);
    color: var(--ccb-blue-fg-normal);
    padding: 0 8px;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }

  &__actions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  &__options {
    width: 24px;
    height: 24px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--ccb-font-labels);
    cursor: pointer;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: var(--ccb-blue-bg-dull-normal);
      color: var(--ccb-blue-fg-normal);
    }

    &.is-hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
  }

  &:hover {
    background: var(--ccb-blue-bg-dull-hover);
  }
}

.ccb-setup-popup-layer {
  position: fixed;
  inset: 0;
  z-index: 100000;
}

.ccb-setup-popup {
  position: fixed;
  background: var(--ccb-bgr-popup);
  border-radius: 16px;
  padding: 10px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  box-shadow: 0px 0px 32px 0px rgba(0, 0, 0, 0.2);

  .ccb-button {
    height: 32px;
    padding: 0 12px;
  }

  .ccb-radio {
    gap: 0px;
  }

  .ccb-setup-popup__separator {
    display: block;
    width: 90%;
    height: 1px;
    background: var(--ccb-border-normal);
    margin: 6px 0;
    margin-left: auto;
    margin-right: auto;
  }

  :deep(.ccb-radio__options .ccb-radio__label) {
    padding: 14px 16px !important;
    border-radius: 8px;

    &.is-checked {
      background: var(--ccb-blue-bg-dull-normal);
    }
  }

  :deep(.ccb-checkbox-group--rows .ccb-checkbox) {
    padding: 14px 16px !important;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    column-gap: 8px;
    margin-top: 16px;
  }
}

.ccb-setup-popup--big {
  padding: 16px;
  background: var(--ccb-bgr-popup);
  border-radius: 16px;
  box-shadow: 0px 0px 32px 0px rgba(0, 0, 0, 0.2);

  .ccb-setup-popup__actions {
    margin-top: 16px;
  }
}
</style>
