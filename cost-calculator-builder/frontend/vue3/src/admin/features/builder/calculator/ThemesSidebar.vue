<template>
  <div class="ccb-themes-sidebar-container">
    <div class="ccb-themes-sidebar ccb-sidebar">
      <div class="ccb-themes-sidebar__header">
        <Text text="Brand Themes" size="m" weight="bold" />
        <div
          class="ccb-themes-sidebar__header-arrow"
          :class="{ 'is-open': isBrandThemesVisible }"
          @click="toggleBrandThemes"
        >
          <i class="ccb-icon-Path-3514"></i>
        </div>
      </div>
      <div
        class="ccb-themes-sidebar__body ccb-sidebar__body ccb-custom-scrollbar my-themes-scroll"
      >
        <Transition
          name="brand-themes"
          @before-enter="onBrandThemesBeforeEnter"
          @enter="onBrandThemesEnter"
          @after-enter="onBrandThemesAfterEnter"
          @before-leave="onBrandThemesBeforeLeave"
          @leave="onBrandThemesLeave"
          @after-leave="onBrandThemesAfterLeave"
        >
          <div
            v-if="isBrandThemesVisible"
            class="ccb-themes-sidebar__body-brand-themes"
          >
            <Preset
              v-for="preset in brandPresets"
              :key="preset.id"
              :colors="preset.colors"
              :active="activePresetKey === preset.id"
              :selected="activePresetKey === preset.id"
              :show-use="true"
              action-label="Customize"
              @apply="applyTheme(preset.id)"
              @use="onCustomizeBrandTheme(preset.id)"
            />
          </div>
        </Transition>

        <div class="ccb-themes-hr" v-if="visibleMyPresets.length > 0"></div>

        <Preset
          v-for="preset in visibleMyPresets"
          :key="preset.id"
          :colors="preset.colors"
          :active="activePresetKey === preset.id"
          :selected="activePresetKey === preset.id"
          :show-delete="true"
          :show-duplicate="true"
          :show-edit="true"
          @apply="applyTheme(preset.id)"
          @delete="deletePreset(preset.id)"
          @duplicate="extendBrandTheme(preset.id)"
          @edit="openMyThemeEditor(preset.id)"
        />
      </div>
    </div>

    <div v-if="isEditorLoading" class="ccb-themes-editor-loader">
      <Loader />
    </div>
    <ThemesPresetEditor v-else-if="isPresetEditorOpen" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Text, Loader } from "@/admin/shared/ui/UIKit";
import Preset from "@/admin/shared/ui/components/Preset/Preset.vue";
import ThemesPresetEditor from "./ThemesPresetEditor.vue";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
import { useCalculatorStore } from "@/admin/app/providers/stores/useCalculatorStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";

const appearanceStore = useAppearanceStore();
const calculatorStore = useCalculatorStore();
const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);
const isEditorLoading = ref(false);

const brandPresets = computed(() => appearanceStore.getBrandPresets);
const myPresets = computed(() => {
  const presets = [...appearanceStore.getMyPresets];

  const getCreatedOrder = (id: string): number => {
    const match = id.match(/^saved_(\d+)$/);
    return match ? Number(match[1]) : -1;
  };

  return presets.sort((a, b) => getCreatedOrder(b.id) - getCreatedOrder(a.id));
});
const activePresetKey = computed(() =>
  String(appearanceStore.getActivePreset?.preset_key || ""),
);
const isPresetEditorOpen = computed(
  () => appearanceStore.getIsPresetEditorOpen,
);
const editingPresetId = computed(() => appearanceStore.getEditingPresetId);

const COLOR_KEYS = [
  "container",
  "primary_color",
  "accent_color",
  "secondary_color",
  "error_color",
];

const liveEditingColors = computed<string[]>(() => {
  void appearanceStore.getEditingRevision;
  const preset = appearanceStore.getActivePreset as Record<string, any> | null;
  const colorsData = preset?.desktop?.colors?.data;
  if (!colorsData || typeof colorsData !== "object") return [];

  return COLOR_KEYS.map((key) => {
    const field = colorsData[key];
    if (!field) return "";

    if (field.data?.color?.value) return String(field.data.color.value);

    let val = field.value;
    if (val && typeof val === "object" && "color" in val) val = val.color;
    return typeof val === "string" ? val : "";
  });
});

const visibleMyPresets = computed(() => {
  const list = isPresetEditorOpen.value
    ? myPresets.value.filter((p) => p.id === activePresetKey.value)
    : myPresets.value;

  const currentEditingId = editingPresetId.value;
  if (!isPresetEditorOpen.value || !currentEditingId) return list;

  const liveColors = liveEditingColors.value;
  return list.map((p) =>
    p.id === currentEditingId ? { ...p, colors: liveColors } : p,
  );
});

const calcId = computed(() => Number(calculatorStore.getId || 0));

async function onCustomizeBrandTheme(presetId: string): Promise<void> {
  if (!calcId.value) return;
  isEditorLoading.value = true;
  try {
    const newKey = await appearanceStore.duplicatePresetOnly(
      calcId.value,
      presetId,
    );
    if (!newKey) return;

    await appearanceStore.previewPreset(calcId.value, newKey);
    await appearanceStore.selectPreset(calcId.value, newKey);
    await appearanceStore.loadEditingPreset(calcId.value, newKey);
    appearanceStore.openPresetEditor(newKey);
  } finally {
    isEditorLoading.value = false;
  }
}

async function extendBrandTheme(presetId: string): Promise<void> {
  if (!calcId.value) return;
  await appearanceStore.extendBrandTheme(calcId.value, presetId);
}

async function openMyThemeEditor(presetId: string): Promise<void> {
  if (!calcId.value) return;
  isEditorLoading.value = true;
  try {
    await appearanceStore.previewPreset(calcId.value, presetId);
    await appearanceStore.selectPreset(calcId.value, presetId);
    await appearanceStore.loadEditingPreset(calcId.value, presetId);
    appearanceStore.openPresetEditor(presetId);
  } finally {
    isEditorLoading.value = false;
  }
}

async function applyTheme(presetId: string): Promise<void> {
  if (!calcId.value || activePresetKey.value === presetId) return;
  await appearanceStore.previewPreset(calcId.value, presetId);
  await appearanceStore.selectPreset(calcId.value, presetId);

  if (isPresetEditorOpen.value) {
    const isBrand = brandPresets.value.some((p) => p.id === presetId);
    if (isBrand) {
      await appearanceStore.closePresetEditor(calcId.value);
    } else {
      await appearanceStore.loadEditingPreset(calcId.value, presetId);
      appearanceStore.openPresetEditor(presetId);
    }
  }
}

async function deletePreset(presetId: string): Promise<void> {
  if (!calcId.value) return;
  if (!window.confirm(translations.value.areYouSureToDeleteThisTheme)) return;
  await appearanceStore.deleteCustomPreset(calcId.value, presetId);
}

const isBrandThemesVisible = ref(true);

function toggleBrandThemes(): void {
  isBrandThemesVisible.value = !isBrandThemesVisible.value;
}

function onBrandThemesBeforeEnter(el: Element): void {
  const target = el as HTMLElement;
  target.style.height = "0px";
  target.style.opacity = "0";
}

function onBrandThemesEnter(el: Element): void {
  const target = el as HTMLElement;
  // force reflow to ensure starting styles are applied before transition
  void target.offsetHeight;
  target.style.height = `${target.scrollHeight}px`;
  target.style.opacity = "1";
}

function onBrandThemesAfterEnter(el: Element): void {
  const target = el as HTMLElement;
  target.style.height = "auto";
}

function onBrandThemesBeforeLeave(el: Element): void {
  const target = el as HTMLElement;
  target.style.height = `${target.scrollHeight}px`;
  target.style.opacity = "1";
}

function onBrandThemesLeave(el: Element): void {
  const target = el as HTMLElement;
  void target.offsetHeight;
  target.style.height = "0px";
  target.style.opacity = "0";
}

function onBrandThemesAfterLeave(el: Element): void {
  const target = el as HTMLElement;
  target.style.height = "";
  target.style.opacity = "";
}
</script>

<style scoped lang="scss">
.ccb-themes-sidebar-container {
  width: 100%;
  height: calc(100vh - 228px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  row-gap: 12px;
  color: var(--ccb-font-labels);
}

.ccb-themes-sidebar {
  width: 100%;
  padding-top: 16px;

  &__body-brand-themes {
    display: flex;
    flex-direction: column;
    row-gap: 2px;
    overflow: hidden;
    will-change: height, opacity;
    transition:
      height 0.3s ease,
      opacity 0.25s ease;
  }

  &__header {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-arrow {
      border: 0;
      border-radius: 999px;
      color: var(--ccb-font-labels);
      display: inline-flex;
      cursor: pointer;
      transition: transform 0.25s ease;

      &.is-open {
        transform: rotate(180deg);
      }
    }
  }
}

.brand-themes-enter-from,
.brand-themes-leave-to {
  height: 0;
  opacity: 0;
}

.my-themes-scroll {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  row-gap: 2px;
}

.ccb-themes-hr {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  margin: 10px 5px;
}

.ccb-themes-editor-loader {
  width: 100%;
  padding: 48px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
