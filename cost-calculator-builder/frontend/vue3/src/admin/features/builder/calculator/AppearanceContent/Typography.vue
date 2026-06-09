<template>
  <div class="ccb-appearance-content-typography">
    <AppearanceHeader
      title="Typography"
      section-key="typography"
      :show-device-switch="true"
      v-model:deviceType="deviceType"
    />
    <div class="ccb-appearance-content-typography__body">
      <div class="ccb-appearance-content-typography__field-wrap">
        <Toggle
          label="Hide Calculator Title"
          size="m"
          weight="medium"
          :model-value="booleanFieldValue('header_hide')"
          @update:model-value="
            (value) => updateValue('header_hide', value ? 1 : 0)
          "
        />
      </div>
      <div
        class="ccb-appearance-content-typography__pair"
        v-for="row in mainRows"
        :key="row.sizeKey"
      >
        <div class="ccb-appearance-content-typography__field-wrap">
          <div class="ccb-appearance-content-typography__field">
            <Input
              placeholder="Select size"
              :model-value="fieldValue(row.sizeKey)"
              variant="innerLabel"
              :label="row.label"
              inputType="number"
              :max="100"
              :min="1"
              :step="1"
              @update:model-value="
                (value) => updateValue(row.sizeKey, Number(value))
              "
            />
          </div>

          <div class="ccb-appearance-content-typography__field">
            <Dropdown
              :label="row.label"
              :items="numberOptions(row.weightKey)"
              :model-value="fieldValue(row.weightKey)"
              variant="innerLabel"
              @update:model-value="
                (value) => updateValue(row.weightKey, Number(value))
              "
            />
          </div>
        </div>
      </div>
      <div class="ccb-appearance-content-typography__pair">
        <div class="ccb-appearance-content-typography__field-wrap">
          <div class="ccb-appearance-content-typography__field">
            <Input
              placeholder="Select size"
              variant="innerLabel"
              label="Summary Text"
              :model-value="fieldValue('total_field_font_size')"
              inputType="number"
              @update:model-value="
                (value) => updateValue('total_field_font_size', Number(value))
              "
            />
          </div>
          <div class="ccb-appearance-content-typography__field">
            <Dropdown
              label="Summary Text"
              :items="numberOptions('total_field_font_weight')"
              :model-value="fieldValue('total_field_font_weight')"
              variant="innerLabel"
              @update:model-value="
                (value) => updateValue('total_field_font_weight', Number(value))
              "
            />
          </div>
        </div>
        <div
          class="ccb-appearance-content-typography__field-wrap"
          style="margin-top: 10px"
        >
          <div class="ccb-appearance-content-typography__field">
            <Dropdown
              label=""
              :items="numberOptions('total_text_transform')"
              :model-value="fieldValue('total_text_transform')"
              @update:model-value="
                (value) => updateValue('total_text_transform', value)
              "
            />
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
import { Input, Dropdown, Toggle } from "@/admin/shared/ui/UIKit";

const appearanceStore = useAppearanceStore();

const deviceType = computed<"desktop" | "mobile">({
  get: () => appearanceStore.getEditorDevice,
  set: (value) => appearanceStore.setEditorDevice(value),
});

type EditorField = Record<string, any>;
type Option = { value: string | number; label: string };

const currentSection = computed<Record<string, any> | null>(() => {
  const preset = appearanceStore.getEditingPreset as Record<string, any> | null;
  if (!preset) return null;

  const deviceData = preset[deviceType.value] as
    | Record<string, any>
    | undefined;
  if (!deviceData || typeof deviceData !== "object") return null;

  const section = deviceData.typography;
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

const mainRows = [
  {
    label: "Header",
    sizeKey: "header_font_size",
    weightKey: "header_font_weight",
  },
  {
    label: "Label",
    sizeKey: "label_font_size",
    weightKey: "label_font_weight",
  },
  {
    label: "Description",
    sizeKey: "description_font_size",
    weightKey: "description_font_weight",
  },
  {
    label: "Grand Totals",
    sizeKey: "total_font_size",
    weightKey: "total_font_weight",
  },
  {
    label: "Fields & Buttons",
    sizeKey: "fields_btn_font_size",
    weightKey: "fields_btn_font_weight",
  },
  {
    label: "Summary Header",
    sizeKey: "summary_header_size",
    weightKey: "summary_header_font_weight",
  },
] as const;

function updateValue(fieldKey: string, value: unknown): void {
  appearanceStore.updateEditingPresetField("typography", fieldKey, value);
}

function fieldValue(fieldKey: string): string | number {
  return fieldsMap.value[fieldKey]?.value ?? "";
}

function booleanFieldValue(fieldKey: string): boolean {
  return toBoolean(fieldsMap.value[fieldKey]?.value);
}

function toBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === "1";
}

function numberOptions(fieldKey: string): Option[] {
  const field = fieldsMap.value[fieldKey];
  let optionsData = {};

  if (field?.data?.options) {
    optionsData = field.data.options;
  }

  const options: Option[] = [];
  for (const key of Object.keys(optionsData)) {
    if (
      typeof optionsData === "object" &&
      optionsData !== null &&
      typeof optionsData[key as keyof typeof optionsData] === "string"
    ) {
      options.push({
        value: String(key),
        label: String(optionsData[key as keyof typeof optionsData]),
      });
    }
  }

  return options;
}

// function normalizeOptions(options: any): Option[] {
//   if (!options) return [];

//   if (Array.isArray(options)) {
//     return options.map((option) => {
//       if (typeof option === "object" && option !== null) {
//         return {
//           value: String(option.value ?? option.id ?? ""),
//           label: String(option.label ?? option.title ?? option.value ?? ""),
//         };
//       }

//       return { value: String(option), label: String(option) };
//     });
//   }

//   if (typeof options === "object") {
//     return Object.entries(options).map(([value, label]) => ({
//       value: String(value),
//       label: String(label),
//     }));
//   }

//   return [];
// }
</script>

<style scoped lang="scss">
.ccb-appearance-content-typography {
  &__body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__pair {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__label-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__field {
    flex: 1;
    width: 48.5%;
    height: 48px;

    .ccb-input {
      height: 100%;
    }

    .ccb-dropdown {
      height: 100%;
    }
  }

  &__label {
    color: var(--ccb-font-comment);
    text-indent: 5px;
    height: 100%;
  }

  &__field-wrap {
    display: flex;
    align-items: center;
    column-gap: 8px;
    justify-content: space-between;
  }

  &__icon {
    color: var(--ccb-font-comment);
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.2px;
  }
}
</style>
