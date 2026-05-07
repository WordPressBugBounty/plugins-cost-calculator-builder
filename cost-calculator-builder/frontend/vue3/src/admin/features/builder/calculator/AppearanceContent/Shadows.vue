<template>
  <div class="ccb-appearance-content-shadows">
    <AppearanceHeader title="Shadows" section-key="shadows" />
    <div class="ccb-appearance-content-shadows__body" v-if="shadowField">
      <div class="ccb-appearance-content-shadows__color-row">
        <div
          class="ccb-appearance-content-shadows__color-dot-wrap"
          @click="shadowColorPickerClick"
        >
          <input
            class="ccb-appearance-content-shadows__color-dot"
            type="color"
            ref="shadowColorPickerInputRef"
            :value="toHexColor(shadowColorValue)"
            @input="
              updateShadowValue(
                'color',
                ($event.target as HTMLInputElement).value,
              )
            "
          />
        </div>
        <div class="ccb-appearance-content-shadows__color-text">
          <span class="ccb-appearance-content-shadows__color-label"
            >Shadow Color</span
          >
          <div class="ccb-appearance-content-shadows__color-values">
            <span class="ccb-appearance-content-shadows__color-hex">{{
              toHexLabel(shadowColorValue)
            }}</span>
            <span class="ccb-appearance-content-shadows__color-opacity"
              >{{ opacityPercent(shadowColorValue) }}%</span
            >
          </div>
        </div>
      </div>

      <div class="ccb-appearance-content-shadows__controls-row">
        <div class="ccb-appearance-content-shadows__control">
          <span class="ccb-appearance-content-shadows__control-label"
            >Blur</span
          >
          <input
            class="ccb-appearance-content-shadows__control-input"
            type="number"
            :value="Number(shadowField?.data?.blur?.value ?? 0)"
            :min="shadowField?.data?.blur?.data?.min ?? 0"
            :max="shadowField?.data?.blur?.data?.max ?? 100"
            :step="shadowField?.data?.blur?.data?.step ?? 1"
            @input="
              updateShadowValue(
                'blur',
                Number(($event.target as HTMLInputElement).value || 0),
              )
            "
          />
        </div>

        <div class="ccb-appearance-content-shadows__control">
          <span class="ccb-appearance-content-shadows__control-label">X</span>
          <input
            class="ccb-appearance-content-shadows__control-input"
            type="number"
            :value="Number(shadowField?.data?.x?.value ?? 0)"
            :min="shadowField?.data?.x?.data?.min ?? 0"
            :max="shadowField?.data?.x?.data?.max ?? 100"
            :step="shadowField?.data?.x?.data?.step ?? 1"
            @input="
              updateShadowValue(
                'x',
                Number(($event.target as HTMLInputElement).value || 0),
              )
            "
          />
        </div>

        <div class="ccb-appearance-content-shadows__control">
          <span class="ccb-appearance-content-shadows__control-label">Y</span>
          <input
            class="ccb-appearance-content-shadows__control-input"
            type="number"
            :value="Number(shadowField?.data?.y?.value ?? 0)"
            :min="shadowField?.data?.y?.data?.min ?? 0"
            :max="shadowField?.data?.y?.data?.max ?? 100"
            :step="shadowField?.data?.y?.data?.step ?? 1"
            @input="
              updateShadowValue(
                'y',
                Number(($event.target as HTMLInputElement).value || 0),
              )
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
import AppearanceHeader from "./AppearanceHeader.vue";

const appearanceStore = useAppearanceStore();
const editorDevice = computed(() => appearanceStore.getEditorDevice);

const currentSection = computed<Record<string, any> | null>(() => {
  const preset = appearanceStore.getEditingPreset as Record<string, any> | null;
  if (!preset) return null;

  const activeDeviceData = preset[editorDevice.value] as
    | Record<string, any>
    | undefined;
  const desktopData = preset.desktop as Record<string, any> | undefined;
  const section = activeDeviceData?.shadows ?? desktopData?.shadows;

  return section && typeof section === "object"
    ? (section as Record<string, any>)
    : null;
});

const shadowField = computed<Record<string, any> | null>(() => {
  const field = currentSection.value?.data?.container_shadow;
  return field && typeof field === "object"
    ? (field as Record<string, any>)
    : null;
});

const shadowColorValue = computed(
  () => shadowField.value?.data?.color?.value || "#000000",
);

const shadowColorPickerInputRef = ref<HTMLInputElement | null>(null);

const shadowColorPickerClick = () => {
  shadowColorPickerInputRef.value?.click();
};

function updateNestedValue(
  fieldKey: string,
  nestedKey: string,
  value: unknown,
): void {
  appearanceStore.updateEditingPresetField(
    "shadows",
    fieldKey,
    value,
    nestedKey,
  );
}

function updateShadowValue(
  key: "color" | "blur" | "x" | "y",
  value: unknown,
): void {
  updateNestedValue("container_shadow", key, value);

  const currentShadowValue =
    shadowField.value?.value && typeof shadowField.value.value === "object"
      ? (shadowField.value.value as Record<string, unknown>)
      : {};

  appearanceStore.updateEditingPresetField("shadows", "container_shadow", {
    ...currentShadowValue,
    [key]: value,
  });
}

function toHexColor(value: unknown): string {
  if (typeof value !== "string") return "#000000";
  const normalized = value.trim();

  if (/^#[0-9a-f]{3}$/i.test(normalized)) {
    return `#${normalized
      .slice(1)
      .split("")
      .map((char) => `${char}${char}`)
      .join("")}`;
  }

  if (/^#[0-9a-f]{6}$/i.test(normalized)) return normalized;

  const rgbaMatch = normalized.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([01]?\.?\d*))?\s*\)$/i,
  );

  if (!rgbaMatch) return "#000000";

  const r = Math.max(0, Math.min(255, Number(rgbaMatch[1]) || 0));
  const g = Math.max(0, Math.min(255, Number(rgbaMatch[2]) || 0));
  const b = Math.max(0, Math.min(255, Number(rgbaMatch[3]) || 0));

  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function toHexLabel(value: unknown): string {
  return toHexColor(value).replace("#", "").toUpperCase();
}

function opacityPercent(value: unknown): number {
  if (typeof value !== "string") return 100;
  const normalized = value.trim();
  const rgbaMatch = normalized.match(
    /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*([01]?\.?\d*)\s*\)$/i,
  );

  if (!rgbaMatch) return 100;
  const alpha = Math.max(0, Math.min(1, Number(rgbaMatch[1]) || 1));
  return Math.round(alpha * 100);
}
</script>

<style scoped lang="scss">
.ccb-appearance-content-shadows {
  &__body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__color-row {
    min-height: 48px;
    border-radius: 12px;
    background: var(--ccb-input-normal);
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__color-dot-wrap {
    width: 20px;
    height: 20px;
    border-radius: 999px;
    border: 1px solid var(--ccb-input-border);
    overflow: hidden;
    flex-shrink: 0;
    background-color: v-bind(toHexColor(shadowColorValue));

    input {
      visibility: hidden;
    }
  }

  &__color-dot {
    width: 100%;
    height: 100%;
    border: 0;
    padding: 0;
    cursor: pointer;
    background: transparent;
  }

  &__color-text {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  &__color-label {
    font-size: 12px;
    line-height: 12px;
    color: var(--ccb-font-comment);
  }

  &__color-values {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__color-hex {
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.2px;
    color: var(--ccb-font-labels);
    text-transform: uppercase;
  }

  &__color-opacity {
    margin-left: auto;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.2px;
    color: var(--ccb-font-labels);
  }

  &__controls-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__control {
    flex: 1 1 0;
    min-width: 0;
    max-height: 48px;
    border-radius: 12px;
    background: var(--ccb-input-normal);
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
  }

  &__control-label {
    font-size: 12px;
    line-height: 12px;
    color: var(--ccb-font-comment);
    letter-spacing: 0.2px;
  }

  &__control-input {
    width: 100%;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--ccb-font-labels);
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.2px;
    padding: 0;
    height: 26px;
    min-height: 26px;

    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
}
</style>
