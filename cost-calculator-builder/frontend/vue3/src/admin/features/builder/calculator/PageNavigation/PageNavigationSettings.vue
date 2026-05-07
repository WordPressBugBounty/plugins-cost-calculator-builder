<template>
  <div class="ccb-fields-settings-container ccb-custom-scrollbar">
    <div class="ccb-fields-settings ccb-field-sidebar">
      <div class="ccb-field-sidebar__header">
        <Text text="Page Navigation" size="m" weight="bold" />
      </div>

      <div class="ccb-field-sidebar__tabs">
        <div class="ccb-field-sidebar__row">
          <Tab :items="fieldTabs" v-model="activeTab" type="regular" />
        </div>
      </div>

      <div class="ccb-field-sidebar__body" v-if="activeTab === 'variants'">
        <div
          class="ccb-field-sidebar__row"
          v-for="style in styleItems"
          :key="style.value"
        >
          <div
            class="ccb-field-variant"
            :class="{ active: paginationType === style.value }"
            @click="paginationType = style.value"
          >
            <div class="ccb-field-variant__check">
              <i class="ccb-icon-ic_check"></i>
            </div>
            <div class="ccb-field-variant__title">
              <Text :text="style.label" size="s" weight="medium" />
            </div>
            <div
              class="ccb-field-variant__view"
              v-if="style.value !== 'hidden'"
            >
              <img :src="style.image" :alt="style.label" />
            </div>
          </div>
        </div>
      </div>

      <div class="ccb-field-sidebar__body" v-if="activeTab === 'settings'">
        <div class="ccb-field-sidebar__item">
          <Toggle
            label="Hide pagination title"
            size="m"
            weight="medium"
            v-model="hidePaginationTitle"
          />
        </div>

        <div class="ccb-field-sidebar__item">
          <Toggle
            label="Summary after last page"
            size="m"
            weight="medium"
            v-model="summaryAfterLastPage"
          />
        </div>

        <div class="ccb-field-sidebar__item" v-if="summaryAfterLastPage">
          <Toggle
            label="Total in page"
            size="m"
            weight="medium"
            v-model="totalInPage"
          />
        </div>
        <div class="ccb-field-sidebar__item" v-if="summaryAfterLastPage">
          <MultiSelect
            :items="totalFields"
            v-model="pageBreakFormulas"
            label="Page Break Formulas"
            placeholder="Select formulas"
            name="pageBreakFormulas"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { Text, Toggle, MultiSelect } from "@/admin/shared/ui/UIKit";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import { useCommonSettings } from "@/admin/features/settings/sections/composables/useCommonSettings";
import type { ISettings } from "@/admin/shared/types/settings.type";
import "@/admin/features/builder/_field-settings.scss";

import circleWithLineImage from "@/images/fields-variants/page-navigation/circle_with_line.png";
import rectangleStepsWithLineImage from "@/images/fields-variants/page-navigation/rectangle_steps_with_line.png";
import circleTabsImage from "@/images/fields-variants/page-navigation/circle_tabs.png";
import rectangleTabsImage from "@/images/fields-variants/page-navigation/rectangle_tabs.png";
import progressWithCircleImage from "@/images/fields-variants/page-navigation/progress_with_circle.png";
import progressWithBarImage from "@/images/fields-variants/page-navigation/progress_with_bar.png";

// const builderStore = useBuilderStore();
const settingsStore = useSettingsStore();
const { totalFields, syncFormulas } = useCommonSettings();

const pageBreak = computed(() => settingsStore.getSettings?.page_break);

const paginationType = computed({
  get: () => pageBreak.value?.pagination_type || "circle_with_line",
  set: (value) => {
    if (pageBreak.value) {
      pageBreak.value.pagination_type = value as string;
    }
  },
});

const hidePaginationTitle = computed({
  get: () => pageBreak.value?.hide_pagination_title ?? false,
  set: (value) => {
    if (pageBreak.value) {
      pageBreak.value.hide_pagination_title = value;
    }
  },
});

const summaryAfterLastPage = computed({
  get: () => pageBreak.value?.summary_after_last_page ?? false,
  set: (value) => {
    if (pageBreak.value) {
      pageBreak.value.summary_after_last_page = value;
    }
  },
});

const totalInPage = computed({
  get: () => pageBreak.value?.total_in_page ?? false,
  set: (value) => {
    if (pageBreak.value) {
      pageBreak.value.total_in_page = value;
    }
  },
});

const pageBreakFormulas = computed({
  get() {
    const saved = pageBreak.value?.formulas || [];
    const synced = syncFormulas(saved);
    return synced.map((formula) => formula.alias);
  },
  set(value: string[]) {
    const settings = settingsStore.getSettings;
    if (!settings) return;

    const matched = totalFields.value.filter((total) =>
      value.includes(total.alias),
    );
    const nextSettings = JSON.parse(JSON.stringify(settings)) as ISettings;

    nextSettings.page_break.formulas = matched.map((total) => ({
      idx: total.idx,
      alias: total.alias,
      title: total.title,
    }));
    nextSettings.page_break.formulas_list = matched.map((total) => total.alias);
    settingsStore.setSettings(nextSettings);
  },
});

const fieldTabs = [
  { id: "variants", label: "Variants" },
  { id: "settings", label: "Settings" },
];

const activeTab = ref<string>("variants");

const styleItems = [
  {
    label: "Circle with line",
    value: "circle_with_line",
    image: circleWithLineImage,
  },
  {
    label: "Rectangle with line",
    value: "rectangle_steps_with_line",
    image: rectangleStepsWithLineImage,
  },
  { label: "Circle tabs", value: "circle_tabs", image: circleTabsImage },
  {
    label: "Rectangle tabs",
    value: "rectangle_tabs",
    image: rectangleTabsImage,
  },
  {
    label: "Progress with circle",
    value: "progress_with_circle",
    image: progressWithCircleImage,
  },
  {
    label: "Progress with bar",
    value: "progress_with_bar",
    image: progressWithBarImage,
  },
  { label: "Hidden", value: "hidden" },
];

// function close() {
//   builderStore.setPageNavigationSelected(false);
// }
</script>

<style lang="scss">
.ccb-fields-settings-container {
  height: calc(100vh - 240px);
}
</style>
