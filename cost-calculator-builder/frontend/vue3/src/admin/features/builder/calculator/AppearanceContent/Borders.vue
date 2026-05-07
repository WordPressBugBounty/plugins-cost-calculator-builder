<template>
  <div class="ccb-appearance-content-borders">
    <AppearanceHeader title="Borders" section-key="borders" />
    <div class="ccb-appearance-content-borders__body">
      <div
        class="ccb-appearance-content-borders__group"
        v-for="entry in borderEntries"
        :key="entry.key"
      >
        <div class="ccb-appearance-content-borders__group-label">
          {{ entry.field.label || entry.key }}
        </div>

        <div class="ccb-appearance-content-borders__row">
          <div class="ccb-appearance-content-borders__control">
            <span class="ccb-appearance-content-borders__control-label"
              >Weight</span
            >
            <input
              class="ccb-appearance-content-borders__control-input"
              type="number"
              :value="Number(entry.field?.data?.border_width?.value ?? 0)"
              :min="entry.field?.data?.border_width?.data?.min ?? 0"
              :max="entry.field?.data?.border_width?.data?.max ?? 100"
              :step="entry.field?.data?.border_width?.data?.step ?? 1"
              @input="
                updateBorderValue(
                  entry.key,
                  'border_width',
                  Number(($event.target as HTMLInputElement).value || 0),
                )
              "
            />
          </div>

          <div class="ccb-appearance-content-borders__control">
            <span class="ccb-appearance-content-borders__control-label"
              >Radius</span
            >
            <input
              class="ccb-appearance-content-borders__control-input"
              type="number"
              :value="Number(entry.field?.data?.border_radius?.value ?? 0)"
              :min="entry.field?.data?.border_radius?.data?.min ?? 0"
              :max="entry.field?.data?.border_radius?.data?.max ?? 100"
              :step="entry.field?.data?.border_radius?.data?.step ?? 1"
              @input="
                updateBorderValue(
                  entry.key,
                  'border_radius',
                  Number(($event.target as HTMLInputElement).value || 0),
                )
              "
            />
          </div>

          <div class="ccb-appearance-content-borders__control">
            <span class="ccb-appearance-content-borders__control-label"
              >Style</span
            >
            <select
              class="ccb-appearance-content-borders__control-input ccb-appearance-content-borders__control-input--select"
              :value="String(entry.field?.data?.border_type?.value ?? '')"
              @change="
                updateBorderValue(
                  entry.key,
                  'border_type',
                  ($event.target as HTMLSelectElement).value,
                )
              "
            >
              <option
                v-for="option in normalizeOptions(
                  entry.field?.data?.border_type?.data?.options,
                )"
                :key="String(option.value)"
                :value="String(option.value)"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
import AppearanceHeader from "./AppearanceHeader.vue";

type EditorField = Record<string, any>;

const appearanceStore = useAppearanceStore();
const editorDevice = computed(() => appearanceStore.getEditorDevice);

const currentSection = computed<Record<string, any> | null>(() => {
  const preset = appearanceStore.getEditingPreset as Record<string, any> | null;
  if (!preset) return null;

  const activeDeviceData = preset[editorDevice.value] as
    | Record<string, any>
    | undefined;
  const desktopData = preset.desktop as Record<string, any> | undefined;
  const section = activeDeviceData?.borders ?? desktopData?.borders;

  return section && typeof section === "object"
    ? (section as Record<string, any>)
    : null;
});

const borderEntries = computed(() => {
  const fields = currentSection.value?.data || {};
  return Object.entries(fields)
    .map(([key, field]) => ({ key, field: field as EditorField }))
    .filter((entry) => entry.field?.type === "border");
});

function updateNestedValue(
  fieldKey: string,
  nestedKey: string,
  value: unknown,
): void {
  appearanceStore.updateEditingPresetField(
    "borders",
    fieldKey,
    value,
    nestedKey,
  );
}

function updateBorderValue(
  fieldKey: string,
  nestedKey: "border_type" | "border_width" | "border_radius",
  value: unknown,
): void {
  updateNestedValue(fieldKey, nestedKey, value);

  const field = currentSection.value?.data?.[fieldKey] as
    | EditorField
    | undefined;
  const currentValue =
    field?.value && typeof field.value === "object"
      ? (field.value as Record<string, unknown>)
      : {};

  const valueKeyMap: Record<
    "border_type" | "border_width" | "border_radius",
    "type" | "width" | "radius"
  > = {
    border_type: "type",
    border_width: "width",
    border_radius: "radius",
  };

  appearanceStore.updateEditingPresetField("borders", fieldKey, {
    ...currentValue,
    [valueKeyMap[nestedKey]]: value,
  });
}

function normalizeOptions(
  options: any,
): Array<{ value: string; label: string }> {
  if (!options) return [];

  if (Array.isArray(options)) {
    return options.map((option) => {
      if (typeof option === "object" && option !== null) {
        return {
          value: String(option.value ?? option.id ?? ""),
          label: String(option.label ?? option.title ?? option.value ?? ""),
        };
      }

      return { value: String(option), label: String(option) };
    });
  }

  if (typeof options === "object") {
    return Object.entries(options).map(([value, label]) => ({
      value: String(value),
      label: String(label),
    }));
  }

  return [];
}
</script>

<style scoped lang="scss">
.ccb-appearance-content-borders {
  &__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__group-label {
    padding: 0 16px;
    color: var(--ccb-font-comment);
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.2px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__control {
    flex: 1 1 0;
    min-width: 0;
    height: 48px;
    border-radius: 12px;
    background: var(--ccb-input-normal);
    padding: 6px 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    box-sizing: border-box;
  }

  &__control-label {
    color: var(--ccb-font-comment);
    font-size: 12px;
    line-height: 12px;
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

  &__control-input--select {
    appearance: none;
    background-image:
      linear-gradient(45deg, transparent 50%, var(--ccb-font-comment) 50%),
      linear-gradient(135deg, var(--ccb-font-comment) 50%, transparent 50%);
    background-position:
      calc(100% - 10px) calc(50% - 2px),
      calc(100% - 5px) calc(50% - 2px);
    background-size:
      5px 5px,
      5px 5px;
    background-repeat: no-repeat;
    padding-right: 18px;
    font-size: 16px;
  }
}
</style>
