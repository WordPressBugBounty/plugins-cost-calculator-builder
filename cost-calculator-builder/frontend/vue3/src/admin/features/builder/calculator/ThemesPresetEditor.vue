<template>
  <div class="ccb-themes-editor">
    <div class="ccb-themes-editor__top">
      <Text :text="editorTitle" size="m" weight="bold" />
      <button class="ccb-themes-editor__close" @click="closeEditor">
        <i class="ccb-icon-close-x"></i>
      </button>
    </div>

    <div class="ccb-themes-editor__tabs">
      <button
        v-for="(tab, index) in sectionTabs"
        :key="tab.id"
        class="ccb-themes-editor__tab"
        :class="{
          active: tab.enabled && currentSectionId === tab.id,
          disabled: !tab.enabled,
          first: index === 0,
          last: index === sectionTabs.length - 1,
        }"
        :disabled="!tab.enabled"
        @click="setSection(tab.id)"
      >
        <i :class="tab.icon"></i>
      </button>
    </div>

    <div class="ccb-themes-editor__body ccb-custom-scrollbar">
      <component
        v-if="currentSectionContentComponent"
        :is="currentSectionContentComponent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, defineAsyncComponent } from "vue";
import type { Component } from "vue";
import { Text } from "@/admin/shared/ui/UIKit";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
import { useCalculatorStore } from "@/admin/app/providers/stores/useCalculatorStore";

const appearanceStore = useAppearanceStore();
const calculatorStore = useCalculatorStore();
const editingPresetId = computed(() => appearanceStore.getEditingPresetId);

const editorTitle = computed(() => {
  const presetId = editingPresetId.value;
  if (!presetId) return "Edit Theme";

  const preset = appearanceStore.getPresets.find(
    (item) => item.id === presetId,
  );
  const presetName = (preset?.name || presetId)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return `Edit ${presetName} Theme`;
});

const tabMeta = [
  { id: "colors", label: "Colors", icon: "ccb-icon-ic_collor" },
  { id: "typography", label: "Typography", icon: "ccb-icon-ic_font" },
  { id: "borders", label: "Borders", icon: "ccb-icon-ic_border" },
  { id: "shadows", label: "Shadows", icon: "ccb-icon-ic_shadow" },
  { id: "spacing_and_positions", label: "Spacing", icon: "ccb-icon-ic_space" },
  { id: "others", label: "Preloader", icon: "ccb-icon-ic_preloader" },
];

const editorDevice = computed(() => appearanceStore.getEditorDevice);
const currentSectionId = computed(() => appearanceStore.getEditorSection);

const deviceData = computed<Record<string, any>>(() => {
  const preset = appearanceStore.getEditingPreset as Record<string, any> | null;
  if (!preset) return {};
  const data = preset[editorDevice.value] as Record<string, any> | undefined;
  return data && typeof data === "object" ? data : {};
});

const sectionTabs = computed(() =>
  tabMeta.map((tab) => ({
    ...tab,
    enabled:
      editorDevice.value === "desktop" &&
      (tab.id === "others" || Boolean(deviceData.value?.[tab.id])),
  })),
);

const ColorsContent = defineAsyncComponent(
  () => import("./AppearanceContent/Colors.vue"),
);
const TypographyContent = defineAsyncComponent(
  () => import("./AppearanceContent/Typography.vue"),
);
const BordersContent = defineAsyncComponent(
  () => import("./AppearanceContent/Borders.vue"),
);
const ShadowsContent = defineAsyncComponent(
  () => import("./AppearanceContent/Shadows.vue"),
);
const SpacingContent = defineAsyncComponent(
  () => import("./AppearanceContent/Spacing.vue"),
);
const PreloaderIconContent = defineAsyncComponent(
  () => import("./AppearanceContent/PreloaderIcon.vue"),
);

const sectionToContentComponent: Record<string, Component> = {
  colors: ColorsContent,
  typography: TypographyContent,
  borders: BordersContent,
  shadows: ShadowsContent,
  spacing_and_positions: SpacingContent,
  others: PreloaderIconContent,
};

const currentSectionContentComponent = computed<Component | null>(() => {
  return sectionToContentComponent[currentSectionId.value] || null;
});

watch(
  () => [editorDevice.value, sectionTabs.value] as const,
  ([device, tabs]) => {
    if (device !== "desktop") return;
    if (!tabs.length) return;
    const current = tabs.find((t) => t.id === currentSectionId.value);
    if (current?.enabled) return;
    const fallback = tabs.find((t) => t.enabled);
    if (fallback) appearanceStore.setEditorSection(fallback.id);
  },
  { immediate: true },
);

function closeEditor(): void {
  const calcId = Number(calculatorStore.getId || 0);
  appearanceStore.closePresetEditor(calcId);
}

function setSection(sectionId: string): void {
  if (typeof appearanceStore.setEditorSection === "function") {
    appearanceStore.setEditorSection(sectionId);
    return;
  }

  appearanceStore.$patch({ editorSection: sectionId });
}
</script>

<style scoped lang="scss">
.ccb-themes-editor {
  width: 100%;
  padding: 24px 4px;

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 16px;
  }

  &__close {
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 999px;
    background: var(--ccb-wb-normal);
    color: var(--ccb-font-labels);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
  }

  &__tabs {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 2px;
    margin-bottom: 16px;
  }

  &__tab {
    border: 0;
    border-radius: 4px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--ccb-bw-dull-disabled);
    color: var(--ccb-font-labels);
    cursor: pointer;

    &.active {
      background: var(--ccb-blue-bg-dull-normal);
      color: var(--ccb-blue-fg-normal);
    }

    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &.first {
      border-top-left-radius: 99px !important;
      border-bottom-left-radius: 99px !important;
    }

    &.last {
      border-top-right-radius: 99px !important;
      border-bottom-right-radius: 99px !important;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 2px;
  }

  &__field {
    border-radius: 12px;
    background: var(--ccb-input-normal);
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-size: 12px;
    color: var(--ccb-font-comment);
  }

  &__sub-label {
    font-size: 12px;
    color: var(--ccb-font-comment);
    margin-bottom: 4px;
  }

  &__group {
    padding-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__sub-grid {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--ccb-font-labels);
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__color {
    width: 36px;
    height: 36px;
    border: 0;
    padding: 0;
    background: transparent;
    cursor: pointer;
  }

  &__input {
    width: 100%;
    border: 1px solid var(--ccb-input-border);
    border-radius: 10px;
    height: 36px;
    padding: 0 10px;
    color: var(--ccb-font-labels);
    background: #fff;
  }
}
</style>
