<template>
  <div class="ccb-layout-sidebar">
    <div class="ccb-layout-sidebar__wrapper ccb-sidebar">
      <div class="ccb-layout-sidebar__header">
        <Text text="Layout" size="m" weight="bold" />
        <Button
          label="Reset"
          size="xs"
          type="default"
          textSize="s"
          textWeight="medium"
          @click="resetLayout"
        />
      </div>
      <div
        class="ccb-layout-sidebar__body ccb-sidebar__body ccb-custom-scrollbar"
      >
        <div class="ccb-layout-sidebar__item ccb-sidebar__item">
          <LayoutPreview
            :summaryPosition="layout.summary_position"
            :calculatorWidth="layout.calculator_width"
            :summaryWidth="layout.summary_width"
            :headerPosition="layout.header_position"
            :navigationPosition="layout.navigation_position"
          />
        </div>
        <div
          class="ccb-layout-sidebar__item ccb-sidebar__item"
          v-if="!summaryLastPage"
        >
          <Tab
            :items="summaryPositionItems"
            :modelValue="layout.summary_position"
            @update:modelValue="onSummaryPositionChange"
            title="Summary Position"
          />
        </div>
        <div class="ccb-layout-sidebar__item ccb-sidebar__item">
          <Input
            placeholder="Enter width"
            :modelValue="layout.max_width"
            @update:modelValue="
              updateLayout({ max_width: Number($event) || 0 })
            "
            label="Max Width (px)"
          />
        </div>
        <div
          class="ccb-layout-sidebar__item ccb-sidebar__item"
          v-if="!summaryLastPage"
        >
          <Range
            :modelValue="layout.calculator_width"
            @update:modelValue="onCalculatorWidthChange"
            :min="isSideBySide ? 30 : 0"
            :max="isSideBySide ? 70 : 100"
            label="Calculator Width"
            suffix="%"
          />
        </div>
        <div
          class="ccb-layout-sidebar__item ccb-sidebar__item"
          v-if="!summaryLastPage"
        >
          <Range
            :modelValue="layout.summary_width"
            @update:modelValue="onSummaryWidthChange"
            :min="isSideBySide ? 30 : 0"
            :max="isSideBySide ? 70 : 100"
            label="Summary Width"
            suffix="%"
          />
        </div>
        <div
          class="ccb-layout-sidebar__item ccb-sidebar__item"
          v-if="pageBreakAvailable"
        >
          <div class="ccb-layout-sidebar__header">
            <Text text="Page Header" size="m" weight="bold" />
          </div>
        </div>

        <div
          class="ccb-layout-sidebar__item ccb-sidebar__item"
          v-if="pageBreakAvailable"
        >
          <Tab
            :items="headerPositionItems"
            :modelValue="layout.header_position"
            @update:modelValue="onHeaderPositionChange"
            title="Header Position"
          />
        </div>

        <div
          class="ccb-layout-sidebar__item ccb-sidebar__item"
          v-if="pageBreakAvailable"
        >
          <div class="ccb-layout-sidebar__header">
            <Text text="Page Navigation" size="m" weight="bold" />
          </div>
        </div>

        <div
          class="ccb-layout-sidebar__item ccb-sidebar__item"
          v-if="pageBreakAvailable"
        >
          <Tab
            :items="navigationButtonsPositionItems"
            :modelValue="layout.navigation_position"
            @update:modelValue="onNavigationPositionChange"
            title="Navigation Position"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Text, Input, Range, Button } from "@/admin/shared/ui/UIKit";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import LayoutPreview from "./LayoutPreview.vue";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { ILayout } from "@/admin/shared/types/settings.type";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const settingsStore = useSettingsStore();
const builderStore = useBuilderStore();
const layout = computed<ILayout>(() => {
  return settingsStore.getSettings?.layout as unknown as ILayout;
});

const isSideBySide = computed(
  () => layout.value?.summary_position !== "bottom",
);

const pageBreakAvailable = computed(() => {
  return builderStore.getPages.length > 1;
});

const summaryLastPage = computed(() => {
  return (
    settingsStore.getSettings?.page_break?.summary_after_last_page ?? false
  );
});

const updateLayout = (partial: Partial<ILayout>): void => {
  const settings = settingsStore.getSettings;
  if (!settings) return;

  settingsStore.setSettings({
    ...settings,
    layout: {
      ...settings.layout,
      ...partial,
    },
  });
};

const DEFAULT_LAYOUT: ILayout = {
  max_width: 970,
  summary_position: "right",
  calculator_width: 60,
  summary_width: 40,
  header_position: "top",
  navigation_position: "bottom",
  navigation_buttons_position: "right",
};

const resetLayout = (): void => {
  updateLayout(DEFAULT_LAYOUT);
};

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

const onSummaryPositionChange = (value: string | number): void => {
  const position = value as ILayout["summary_position"];
  const patch: Partial<ILayout> = { summary_position: position };

  if (position !== "bottom") {
    const calcWidth = clamp(layout.value.calculator_width, 40, 60);
    patch.calculator_width = calcWidth;
    patch.summary_width = 100 - calcWidth;
  } else if (position === "bottom") {
    patch.calculator_width = 100;
    patch.summary_width = 100;
  }

  updateLayout(patch);
};

const onHeaderPositionChange = (value: string | number): void => {
  updateLayout({
    header_position: value as ILayout["header_position"],
  });
};

const onNavigationPositionChange = (value: string | number): void => {
  updateLayout({
    navigation_position: value as ILayout["navigation_position"],
  });
};

const onCalculatorWidthChange = (value: number): void => {
  if (isSideBySide.value) {
    updateLayout({
      calculator_width: value,
      summary_width: 100 - value,
    });
  } else {
    updateLayout({ calculator_width: value });
  }
};

const onSummaryWidthChange = (value: number): void => {
  if (isSideBySide.value) {
    updateLayout({
      summary_width: value,
      calculator_width: 100 - value,
    });
  } else {
    updateLayout({ summary_width: value });
  }
};

const summaryPositionItems = [
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
  { id: "bottom", label: "Bottom" },
];

const headerPositionItems = [
  { id: "top", label: "Top" },
  { id: "bottom", label: "Bottom" },
  { id: "hidden", label: "Hidden" },
];

const navigationButtonsPositionItems = [
  { id: "top", label: "Top" },
  { id: "bottom", label: "Bottom" },
  { id: "hidden", label: "Hidden" },
];
</script>

<style scoped lang="scss">
.ccb-layout-sidebar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 16px;

  &__wrapper {
    height: 100%;
    overflow-y: auto;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    color: var(--ccb-font-labels);
    align-items: center;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 20px;
    row-gap: 20px;
    height: calc(100vh - 258px);
    padding-bottom: 36px;
    overflow-y: auto;
  }
}
</style>
