<template>
  <div class="ccb-appearance-content-preloader-icon">
    <AppearanceHeader title="Preloader Icon" section-key="others" />
    <div
      class="ccb-appearance-content-preloader-icon__body"
      v-if="preloaderField"
    >
      <div
        class="ccb-appearance-content-preloader-icon__item"
        v-for="idx in loaders"
        :key="idx"
        :class="{ active: idx === selectedLoader }"
        @click="updateValue('calc_preloader', idx)"
      >
        <div class="ccb-appearance-content-preloader-icon__preview">
          <component :is="components[`Loader${idx}`]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
import AppearanceHeader from "./AppearanceHeader.vue";
import Loader0 from "./components/loaders/loader-0.vue";
import Loader1 from "./components/loaders/loader-1.vue";
import Loader2 from "./components/loaders/loader-2.vue";
import Loader3 from "./components/loaders/loader-3.vue";
import Loader4 from "./components/loaders/loader-4.vue";
import Loader5 from "./components/loaders/loader-5.vue";

const components: Record<string, Component> = {
  Loader0,
  Loader1,
  Loader2,
  Loader3,
  Loader4,
  Loader5,
};

const appearanceStore = useAppearanceStore();

type AppearanceAccentColorField = {
  value?: string;
  data?: { accent_color?: { value?: string } };
};

const editorDevice = computed(() => appearanceStore.getEditorDevice);
const accentColor = computed(() => {
  const colors = appearanceStore.getEditingPreset?.desktop?.colors as
    | AppearanceAccentColorField
    | undefined;
  return colors?.data?.accent_color?.value || "";
});

const currentSection = computed<Record<string, any> | null>(() => {
  const preset = appearanceStore.getEditingPreset as Record<string, any> | null;
  if (!preset) return null;

  const activeDeviceData = preset[editorDevice.value] as
    | Record<string, any>
    | undefined;
  const desktopData = preset.desktop as Record<string, any> | undefined;
  const section = activeDeviceData?.others ?? desktopData?.others;

  return section && typeof section === "object"
    ? (section as Record<string, any>)
    : null;
});

const preloaderField = computed<Record<string, any> | null>(() => {
  const field = currentSection.value?.data?.calc_preloader;
  return field && typeof field === "object"
    ? (field as Record<string, any>)
    : null;
});

const selectedLoader = computed(() => Number(preloaderField.value?.value ?? 0));

const loaders = computed<number[]>(() => {
  const options = preloaderField.value?.data?.options;
  if (Array.isArray(options) && options.length > 0) {
    return options
      .map((option: any, index: number) => {
        const rawValue =
          typeof option === "object" && option !== null
            ? (option.value ?? option.id ?? index)
            : option;
        const value = Number(rawValue);
        return Number.isNaN(value) ? index : value;
      })
      .slice(0, 6);
  }

  return [0, 1, 2, 3, 4, 5];
});

function updateValue(fieldKey: string, value: unknown): void {
  appearanceStore.updateEditingPresetField("others", fieldKey, value);
}
</script>

<style lang="scss">
.ccb-appearance-content-preloader-icon {
  &__body {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 4px;
  }

  &__item {
    aspect-ratio: 1;
    border-radius: 12px;
    background: var(--ccb-input-normal);
    border: 1px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &.active {
      border-color: var(--ccb-blue-bg-normal, #007ac6);
    }
  }

  &__preview {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.loader {
  color: v-bind(accentColor);
}

.ccb-loader-1,
.ccb-loader-2,
.ccb-loader-3 {
  //transform: scale(0.4);
  position: relative;
  left: -6px;
  top: -3px;
}
.ccb-loader-1,
.ccb-loader-2,
.ccb-loader-3 {
  @media (min-width: 1024px) and (max-width: 1279px) {
    left: -4px;
  }
}
.ccb-loader-5 {
  display: flex;
  gap: 2px;
  flex-direction: column;
  .ccb-loader-5-item {
    height: 4px;
    border-radius: 4px;
    background: linear-gradient(100deg, #e0e0e0 30%, #f8f8f8 50%, #e0e0e0 70%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.2s infinite;
  }
  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
}
</style>
