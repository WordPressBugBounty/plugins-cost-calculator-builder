<template>
  <div class="ccb-appearance-content-colors">
    <AppearanceHeader title="Colors" section-key="colors" />
    <div class="ccb-appearance-content-colors__body">
      <div class="ccb-appearance-content-colors__row">
        <ColorPicker
          :model-value="toHexColor(containerColorValue)"
          @update:modelValue="updateValue('container', $event, 'color')"
        />
        <div class="ccb-appearance-content-colors__text-wrap">
          <span class="ccb-appearance-content-colors__label">{{
            containerLabel
          }}</span>
          <span class="ccb-appearance-content-colors__value">{{
            toHexLabel(containerColorValue)
          }}</span>
        </div>
      </div>
      <div
        class="ccb-appearance-content-colors__row-wrap"
        v-if="containerField"
      >
        <div class="ccb-appearance-content-colors__row" v-if="hasContainerBlur">
          <div class="ccb-appearance-content-colors__value">
            <span class="ccb-appearance-content-colors__label">Opacity</span>
            <input
              class="ccb-appearance-content-colors__mini-input"
              type="number"
              :value="Number(containerOpacityValue || 0)"
              @input="
                updateValue(
                  'container',
                  Number(($event.target as HTMLInputElement).value || 0),
                  'opacity',
                )
              "
            />
          </div>
        </div>
        <div class="ccb-appearance-content-colors__row" v-if="hasContainerBlur">
          <div class="ccb-appearance-content-colors__value">
            <span class="ccb-appearance-content-colors__label">Blur</span>
            <input
              class="ccb-appearance-content-colors__mini-input"
              type="number"
              :value="Number(containerBlurValue || 0)"
              @input="
                updateValue(
                  'container',
                  Number(($event.target as HTMLInputElement).value || 0),
                  'blur',
                )
              "
            />
          </div>
        </div>
      </div>

      <div
        class="ccb-appearance-content-colors__row"
        v-for="field in colorFields"
        :key="field.key"
      >
        <ColorPicker
          :model-value="toHexColor(field.field.value)"
          @update:modelValue="updateValue(field.key, $event)"
        />
        <div class="ccb-appearance-content-colors__text-wrap">
          <span class="ccb-appearance-content-colors__label">{{
            field.field.label || field.key
          }}</span>
          <div class="ccb-appearance-content-colors__value-row">
            <span class="ccb-appearance-content-colors__value">{{
              toHexLabel(field.field.value)
            }}</span>
            <span
              class="ccb-appearance-content-colors__opacity"
              v-if="opacityPercent(field.field.value) !== null"
            >
              {{ opacityPercent(field.field.value) }}%
            </span>
          </div>
        </div>
      </div>

      <label
        class="ccb-appearance-content-colors__toggle"
        v-if="svgToggleField"
      >
        <input
          class="ccb-appearance-content-colors__toggle-input"
          type="checkbox"
          :checked="toBoolean(svgToggleField.value)"
          @change="
            updateValue(
              'svg_color',
              ($event.target as HTMLInputElement).checked ? 1 : 0,
            )
          "
        />
        <span class="ccb-appearance-content-colors__toggle-ui"></span>
        <span class="ccb-appearance-content-colors__toggle-label">{{
          svgToggleField.label || "Apply accent color to SVG icons"
        }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
import AppearanceHeader from "./AppearanceHeader.vue";
import { ColorPicker } from "@/admin/shared/ui/UIKit";

type EditorField = Record<string, any>;

const appearanceStore = useAppearanceStore();

const currentSection = computed<Record<string, any> | null>(() => {
  const preset = appearanceStore.getEditingPreset as Record<string, any> | null;
  if (!preset) return null;

  const desktopData = preset.desktop as Record<string, any> | undefined;
  return desktopData?.colors && typeof desktopData.colors === "object"
    ? (desktopData.colors as Record<string, any>)
    : null;
});

const currentFields = computed(() => {
  const fields = currentSection.value?.data || {};
  return Object.entries(fields).map(([key, field]) => ({
    key,
    field: field as EditorField,
  }));
});

const containerField = computed(
  () =>
    currentFields.value.find((entry) => entry.key === "container")?.field ||
    null,
);
const containerLabel = computed(
  () => containerField.value?.label || "Container",
);

const containerColorValue = computed(
  () => containerField.value?.data?.color?.value || "#ffffff",
);
const containerBlurValue = computed(
  () => containerField.value?.data?.blur?.value || 0,
);
const hasContainerBlur = computed(() =>
  Boolean(containerField.value?.data?.blur),
);

const containerOpacityValue = computed(
  () => containerField.value?.data?.opacity?.value || 0,
);

const colorFields = computed(() =>
  currentFields.value.filter(
    (entry) => entry.key !== "container" && entry.field.type === "color",
  ),
);

const svgToggleField = computed(
  () =>
    currentFields.value.find(
      (entry) => entry.key === "svg_color" && entry.field.type === "toggle",
    )?.field || null,
);

function updateValue(
  fieldKey: string,
  value: unknown,
  nestedKey?: string,
): void {
  appearanceStore.updateEditingPresetField(
    "colors",
    fieldKey,
    value,
    nestedKey,
  );
}

function toBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === "1";
}

function toHexColor(value: unknown): string {
  if (typeof value !== "string") return "#ffffff";
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

  if (rgbaMatch) {
    const r = Math.max(0, Math.min(255, Number(rgbaMatch[1]) || 0));
    const g = Math.max(0, Math.min(255, Number(rgbaMatch[2]) || 0));
    const b = Math.max(0, Math.min(255, Number(rgbaMatch[3]) || 0));
    return `#${[r, g, b]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")}`;
  }

  return "#ffffff";
}

function toHexLabel(value: unknown): string {
  return toHexColor(value).replace("#", "").toUpperCase();
}

function opacityPercent(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  const rgbaMatch = normalized.match(
    /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*([01]?\.?\d*)\s*\)$/i,
  );
  if (!rgbaMatch) return null;
  const alpha = Math.max(0, Math.min(1, Number(rgbaMatch[1]) || 0));
  return Math.round(alpha * 100);
}
</script>

<style scoped lang="scss">
.ccb-appearance-content-colors {
  &__body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__row-wrap {
    display: flex;
    align-items: stretch;
    gap: 4px;
  }

  &__row {
    flex: 1 1 auto;
    max-height: 48px;
    background: var(--ccb-input-normal);
    border-radius: 12px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__value {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__mini-row {
    width: 80px;
    min-height: 48px;
    background: var(--ccb-input-normal);
    border-radius: 12px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
  }

  &__text-wrap {
    min-width: 0;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  &__label {
    font-size: 12px;
    line-height: 12px;
    color: var(--ccb-font-comment);
    text-transform: capitalize;
  }

  &__value-row {
    display: flex;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
  }

  &__value {
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.2px;
    color: var(--ccb-font-labels);
    text-transform: uppercase;
  }

  &__opacity {
    margin-left: auto;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.2px;
    color: var(--ccb-font-labels);
  }

  &__mini-input {
    width: 100%;
    border: 0;
    background: transparent;
    color: var(--ccb-font-labels);
    font-size: 16px;
    line-height: 20px;
    outline: none;
    padding: 0;
    height: 26px;
    min-height: 26px;

    &:focus {
      outline: none;
      box-shadow: none;
    }
  }

  &__toggle {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    cursor: pointer;
    margin-top: 2px;
    position: relative;
  }

  &__toggle-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    pointer-events: none;
  }

  &__toggle-ui {
    width: 40px;
    height: 24px;
    border-radius: 99px;
    border: 1px solid var(--ccb-input-border);
    background: var(--ccb-input-normal);
    position: relative;
    flex-shrink: 0;
    transition: background 0.2s ease;

    &::after {
      content: "";
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--ccb-font-labels);
      transition: transform 0.2s ease;
    }
  }

  &__toggle-input:checked + &__toggle-ui {
    &::after {
      transform: translateX(16px);
      background: var(--ccb-blue-fg-normal);
    }
  }

  &__toggle-label {
    color: var(--ccb-font-labels);
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.2px;
  }
}
</style>
