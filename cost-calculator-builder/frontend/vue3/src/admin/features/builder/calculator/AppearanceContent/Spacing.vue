<template>
  <div class="ccb-appearance-content-spacing">
    <AppearanceHeader
      title="Spacing"
      section-key="spacing_and_positions"
      :additional-reset-keys="['elements_sizes']"
      :show-device-switch="true"
      v-model:deviceType="deviceType"
    />
    <div class="ccb-appearance-content-spacing__body">
      <div class="ccb-appearance-content-spacing__row">
        <div class="ccb-appearance-content-spacing__control">
          <span class="ccb-appearance-content-spacing__control-label">
            {{ fieldLabel("field_side_indents", "Field Side Indent") }}
          </span>
          <input
            class="ccb-appearance-content-spacing__control-input"
            type="number"
            :value="toNumber(fieldValue('field_side_indents'))"
            :min="fieldMin('field_side_indents')"
            :max="fieldMax('field_side_indents')"
            :step="fieldStep('field_side_indents')"
            @input="
              updateValue(
                'field_side_indents',
                Number(($event.target as HTMLInputElement).value || 0),
              )
            "
          />
        </div>

        <div class="ccb-appearance-content-spacing__control">
          <span class="ccb-appearance-content-spacing__control-label">
            {{ fieldLabel("field_spacing", "Field Spacing") }}
          </span>
          <input
            class="ccb-appearance-content-spacing__control-input"
            type="number"
            :value="toNumber(fieldValue('field_spacing'))"
            :min="fieldMin('field_spacing')"
            :max="fieldMax('field_spacing')"
            :step="fieldStep('field_spacing')"
            @input="
              updateValue(
                'field_spacing',
                Number(($event.target as HTMLInputElement).value || 0),
              )
            "
          />
        </div>
      </div>

      <div
        class="ccb-appearance-content-spacing__row"
        v-if="fieldButtonHeightField"
      >
        <div class="ccb-appearance-content-spacing__control">
          <span class="ccb-appearance-content-spacing__control-label">
            {{ fieldButtonHeightField.label || "Field and Button Height" }}
          </span>
          <input
            class="ccb-appearance-content-spacing__control-input"
            type="number"
            :value="toNumber(fieldButtonHeightField.value)"
            :min="fieldButtonHeightField.data?.min ?? 0"
            :max="fieldButtonHeightField.data?.max ?? 100"
            :step="fieldButtonHeightField.data?.step ?? 1"
            @input="
              updateElementsSizesValue(
                'field_and_buttons_height',
                Number(($event.target as HTMLInputElement).value || 0),
              )
            "
          />
        </div>
      </div>

      <div
        class="ccb-appearance-content-spacing__group"
        v-for="indentGroup in indentGroups"
        :key="indentGroup.key"
      >
        <div class="ccb-appearance-content-spacing__group-label">
          {{ indentGroup.label }}
        </div>

        <div class="ccb-appearance-content-spacing__row">
          <div class="ccb-appearance-content-spacing__control">
            <span class="ccb-appearance-content-spacing__control-label"
              >Top</span
            >
            <input
              class="ccb-appearance-content-spacing__control-input"
              type="number"
              :value="toNumber(indentValue(indentGroup.key, 'top'))"
              @input="
                updateIndentValue(
                  indentGroup.key,
                  'top',
                  Number(($event.target as HTMLInputElement).value || 0),
                )
              "
            />
          </div>

          <div class="ccb-appearance-content-spacing__control">
            <span class="ccb-appearance-content-spacing__control-label"
              >Bottom</span
            >
            <input
              class="ccb-appearance-content-spacing__control-input"
              type="number"
              :value="toNumber(indentValue(indentGroup.key, 'bottom'))"
              @input="
                updateIndentValue(
                  indentGroup.key,
                  'bottom',
                  Number(($event.target as HTMLInputElement).value || 0),
                )
              "
            />
          </div>
        </div>

        <div class="ccb-appearance-content-spacing__row">
          <div class="ccb-appearance-content-spacing__control">
            <span class="ccb-appearance-content-spacing__control-label"
              >Left</span
            >
            <input
              class="ccb-appearance-content-spacing__control-input"
              type="number"
              :value="toNumber(indentValue(indentGroup.key, 'left'))"
              @input="
                updateIndentValue(
                  indentGroup.key,
                  'left',
                  Number(($event.target as HTMLInputElement).value || 0),
                )
              "
            />
          </div>

          <div class="ccb-appearance-content-spacing__control">
            <span class="ccb-appearance-content-spacing__control-label"
              >Right</span
            >
            <input
              class="ccb-appearance-content-spacing__control-input"
              type="number"
              :value="toNumber(indentValue(indentGroup.key, 'right'))"
              @input="
                updateIndentValue(
                  indentGroup.key,
                  'right',
                  Number(($event.target as HTMLInputElement).value || 0),
                )
              "
            />
          </div>
        </div>
      </div>

      <div
        class="ccb-appearance-content-spacing__single"
        v-if="descriptionPositionField"
      >
        <span class="ccb-appearance-content-spacing__single-label">
          {{ descriptionPositionField.label || "Description Position" }}
        </span>
        <select
          class="ccb-appearance-content-spacing__single-select"
          :value="String(descriptionPositionField.value ?? '')"
          @change="
            updateValue(
              'description_position',
              ($event.target as HTMLSelectElement).value,
            )
          "
        >
          <option
            v-for="option in normalizeOptions(
              descriptionPositionField?.data?.options,
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
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
import AppearanceHeader from "./AppearanceHeader.vue";

const appearanceStore = useAppearanceStore();

const deviceType = computed<"desktop" | "mobile">({
  get: () => appearanceStore.getEditorDevice,
  set: (value) => appearanceStore.setEditorDevice(value),
});

type EditorField = Record<string, any>;

const currentSection = computed<Record<string, any> | null>(() => {
  const preset = appearanceStore.getEditingPreset as Record<string, any> | null;
  if (!preset) return null;

  const deviceData = preset[deviceType.value] as
    | Record<string, any>
    | undefined;
  if (!deviceData || typeof deviceData !== "object") return null;
  const section = deviceData.spacing_and_positions;

  return section && typeof section === "object"
    ? (section as Record<string, any>)
    : null;
});

const fieldsMap = computed<Record<string, EditorField>>(() => {
  const fields = currentSection.value?.data as
    | Record<string, EditorField>
    | undefined;
  return fields && typeof fields === "object" ? fields : {};
});

const elementsSizesSection = computed<Record<string, any> | null>(() => {
  const preset = appearanceStore.getEditingPreset as Record<string, any> | null;
  if (!preset) return null;

  const deviceData = preset[deviceType.value] as
    | Record<string, any>
    | undefined;
  if (!deviceData || typeof deviceData !== "object") return null;
  const section = deviceData.elements_sizes;

  return section && typeof section === "object"
    ? (section as Record<string, any>)
    : null;
});

const elementsSizesFields = computed<Record<string, EditorField>>(() => {
  const fields = elementsSizesSection.value?.data as
    | Record<string, EditorField>
    | undefined;
  return fields && typeof fields === "object" ? fields : {};
});

const fieldButtonHeightField = computed(
  () => elementsSizesFields.value.field_and_buttons_height || null,
);

function updateElementsSizesValue(fieldKey: string, value: unknown): void {
  appearanceStore.updateEditingPresetField("elements_sizes", fieldKey, value);
}

const indentGroups = computed(() => [
  {
    key: "container_margin",
    label: fieldLabel("container_margin", "Container Margin"),
  },
  {
    key: "container_padding",
    label: fieldLabel("container_padding", "Container Padding"),
  },
]);

const descriptionPositionField = computed(
  () => fieldsMap.value.description_position || null,
);

function fieldValue(fieldKey: string): unknown {
  return fieldsMap.value[fieldKey]?.value;
}

function fieldLabel(fieldKey: string, fallback: string): string {
  return String(fieldsMap.value[fieldKey]?.label || fallback);
}

function fieldMin(fieldKey: string): number {
  return Number(fieldsMap.value[fieldKey]?.data?.min ?? 0);
}

function fieldMax(fieldKey: string): number {
  return Number(fieldsMap.value[fieldKey]?.data?.max ?? 100);
}

function fieldStep(fieldKey: string): number {
  return Number(fieldsMap.value[fieldKey]?.data?.step ?? 1);
}

function indentValue(
  fieldKey: string,
  side: "top" | "right" | "bottom" | "left",
): unknown {
  const field = fieldsMap.value[fieldKey];
  if (!field) return 0;

  const nested = field.data?.[side]?.value;
  if (nested !== undefined && nested !== null) return nested;

  const sideToIndex: Record<typeof side, number> = {
    top: 0,
    right: 1,
    bottom: 2,
    left: 3,
  };
  const arr = field.value;
  return Array.isArray(arr) ? (arr[sideToIndex[side]] ?? 0) : 0;
}

function updateValue(fieldKey: string, value: unknown): void {
  appearanceStore.updateEditingPresetField(
    "spacing_and_positions",
    fieldKey,
    value,
  );
}

function updateIndentValue(
  fieldKey: string,
  side: "top" | "right" | "bottom" | "left",
  nextValue: number,
): void {
  const field = fieldsMap.value[fieldKey];
  if (!field) return;

  const current = field.value;
  const values = Array.isArray(current) ? [...current] : [0, 0, 0, 0];
  while (values.length < 4) values.push(0);

  const sideToIndex: Record<typeof side, number> = {
    top: 0,
    right: 1,
    bottom: 2,
    left: 3,
  };

  values[sideToIndex[side]] = nextValue;

  if (field.data?.[side]) {
    field.data[side].value = nextValue;
  }

  updateValue(fieldKey, values);
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const normalized = value.replace("px", "").trim();
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
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
.ccb-appearance-content-spacing {
  &__body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__group-label {
    padding: 0 12px;
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
    max-height: 48px;
    border-radius: 12px;
    background: var(--ccb-input-normal);
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
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

  &__single {
    max-height: 48px;
    border-radius: 12px;
    background: var(--ccb-input-normal);
    padding: 8px 14px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
  }

  &__single-label {
    color: var(--ccb-font-comment);
    font-size: 12px;
    line-height: 12px;
    letter-spacing: 0.2px;
  }

  &__single-select {
    width: 100%;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--ccb-font-labels);
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.2px;
    padding: 0;
    appearance: none;
    min-height: 26px;
    height: 26px;
    background-image:
      linear-gradient(45deg, transparent 50%, var(--ccb-font-comment) 50%),
      linear-gradient(135deg, var(--ccb-font-comment) 50%, transparent 50%);
    background-position:
      calc(100% - 12px) calc(50% - 2px),
      calc(100% - 7px) calc(50% - 2px);
    background-size:
      5px 5px,
      5px 5px;
    background-repeat: no-repeat;
    padding-right: 18px;
  }
}
</style>
