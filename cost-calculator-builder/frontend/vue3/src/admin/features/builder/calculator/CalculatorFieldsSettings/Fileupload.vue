<template>
  <div class="ccb-fields-settings-container ccb-custom-scrollbar">
    <div class="ccb-fields-settings__content ccb-custom-scrollbar">
      <div class="ccb-fields-settings ccb-field-sidebar">
        <div
          class="ccb-fields-settings-back"
          @click="builderStore.setSelectedField(null)"
        >
          <i class="ccb-icon-ic_back"></i>
          <Text text="Back to Fields" size="s" weight="medium" />
        </div>
        <div class="ccb-field-sidebar__header">
          <Text
            :text="field.label"
            size="m"
            weight="bold"
            class="ccb-field-sidebar__label"
          />
          <Text
            :text="field.alias"
            size="m"
            weight="medium"
            class="ccb-field-sidebar__alias"
          />
        </div>
        <div class="ccb-field-sidebar__tabs">
          <div class="ccb-field-sidebar__row">
            <Tab :items="fieldTabs" v-model="activeTab" type="regular" />
          </div>
        </div>

        <div class="ccb-field-sidebar__body" v-if="activeTab === 'element'">
          <div class="ccb-field-sidebar__item">
            <Input
              label="Element name"
              placeholder="Field label"
              v-model="draft.label"
            />
          </div>
          <div class="ccb-field-sidebar__item">
            <Input
              label="Description"
              placeholder="Description"
              v-model="draft.description"
            />
          </div>
          <div class="ccb-field-sidebar__item">
            <Range
              v-model="draft.width"
              :min="10"
              :max="100"
              :step="1"
              label="Element Width (%)"
              suffix="%"
            />
          </div>
          <div class="ccb-field-sidebar__item">
            <Toggle
              label="Upload from URL"
              size="m"
              weight="medium"
              v-model="draft.uploadFromUrl"
            />
          </div>
        </div>

        <div class="ccb-field-sidebar__body" v-if="activeTab === 'settings'">
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Required"
              size="m"
              weight="medium"
              v-model="draft.required"
            />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Show in Grand Total"
              size="m"
              weight="medium"
              v-model="draft.addToSummary"
            />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Calculate hidden by default"
              size="m"
              weight="medium"
              v-model="draft.calculateHidden"
            />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Hidden by Default"
              size="m"
              weight="medium"
              v-model="draft.hidden"
            />
          </div>
        </div>

        <template v-if="activeTab === 'element'">
          <div class="ccb-fields-settings ccb-field-sidebar">
            <div class="ccb-field-sidebar__header">
              <Text text="Properties" size="m" weight="bold" />
            </div>
            <div class="ccb-field-sidebar__body">
              <div class="ccb-field-sidebar__row">
                <div class="ccb-field-sidebar__col">
                  <Input
                    label="Max attached files"
                    placeholder="1"
                    v-model="draft.maxAttachedFiles"
                  />
                </div>
                <div class="ccb-field-sidebar__col">
                  <Input
                    label="Max file size (MB)"
                    placeholder="0"
                    v-model="draft.maxFileSize"
                  />
                </div>
              </div>
              <div class="ccb-field-sidebar__row">
                <Notice type="info">
                  Server file size limit: 300 MB Server file upload limit: 20
                  files
                  <a
                    href="https://docs.stylemixthemes.com/cost-calculator-builder/calculator-elements/file-upload/how-to-increase-maximum-file-upload-size-in-wordpress"
                    target="_blank"
                    >Read more</a
                  >
                </Notice>
              </div>
              <div class="ccb-field-sidebar__row">
                <MultiSelect
                  label="Allowed formats"
                  :items="fileFormats"
                  placeholder="Select Formats"
                  v-model="draft.fileFormats"
                />
              </div>
              <div class="ccb-field-sidebar__row">
                <Notice type="info">
                  You can enable all file types by editing the wp-config.php
                  file.
                  <a
                    href="https://docs.stylemixthemes.com/cost-calculator-builder/calculator-elements/file-upload/how-to-allow-additional-file-types-in-wordpress"
                    target="_blank"
                    >Read more</a
                  >
                </Notice>
              </div>
              <div class="ccb-field-sidebar__row">
                <Toggle
                  label="Set Price for File Uploads"
                  size="m"
                  weight="medium"
                  v-model="draft.allowPrice"
                />
              </div>
              <template v-if="draft.allowPrice">
                <div class="ccb-field-sidebar__row">
                  <Toggle
                    label="Sum prices for each file"
                    size="m"
                    weight="medium"
                    v-model="draft.calculatePerEach"
                  />
                </div>
                <div class="ccb-field-sidebar__item">
                  <Input label="Price" placeholder="0" v-model="draft.price" />
                </div>
              </template>
            </div>
          </div>

          <div class="ccb-fields-settings ccb-field-sidebar">
            <div class="ccb-field-sidebar__header">
              <Text text="Measurement Unit" size="m" weight="bold" />
            </div>
            <div class="ccb-field-sidebar__body">
              <div class="ccb-field-sidebar__item">
                <Toggle
                  label="Use currency sign"
                  size="m"
                  weight="medium"
                  v-model="draft.allowCurrency"
                  @change="() => updateToggle('allowCurrency')"
                />
              </div>
              <div class="ccb-field-sidebar__item">
                <Toggle
                  label="Set measurement unit"
                  size="m"
                  weight="medium"
                  placeholder="Kg"
                  v-model="draft.fieldCurrency"
                  @change="() => updateToggle('fieldCurrency')"
                />
              </div>
            </div>
            <div
              class="ccb-field-sidebar__body"
              style="margin-top: 26px"
              v-if="draft.fieldCurrency && activeTab === 'element'"
            >
              <div class="ccb-field-sidebar__row">
                <div class="ccb-field-sidebar__col">
                  <Input
                    label="Unit Symbol"
                    placeholder="Enter prefix"
                    v-model="draft.fieldCurrencySettings.currency"
                  />
                </div>
                <div class="ccb-field-sidebar__col">
                  <Dropdown
                    label="Position"
                    :items="CURRENCY_POSITION_ITEMS"
                    v-model="draft.fieldCurrencySettings.currencyPosition"
                  />
                </div>
              </div>
              <div class="ccb-field-sidebar_row">
                <Dropdown
                  label="Thousands Separator"
                  :items="THOUSANDS_SEPARATOR_ITEMS"
                  v-model="draft.fieldCurrencySettings.thousands_separator"
                />
              </div>
              <div class="ccb-field-sidebar_row">
                <Input
                  label="Number of Decimals"
                  placeholder="Enter number of decimals"
                  v-model="draft.fieldCurrencySettings.num_after_integer"
                />
              </div>
              <div class="ccb-field-sidebar_row">
                <Dropdown
                  label="Decimal Separator"
                  :items="DECIMAL_SEPARATOR_ITEMS"
                  v-model="draft.fieldCurrencySettings.decimal_separator"
                />
              </div>
            </div>
          </div>
        </template>

        <template v-if="activeTab === 'settings'">
          <div class="ccb-fields-settings ccb-field-sidebar">
            <div class="ccb-field-sidebar__header">
              <Text text="Additional Classes" size="m" weight="bold" />
            </div>
            <div class="ccb-field-sidebar__body">
              <div class="ccb-field-sidebar__row">
                <Textarea
                  height="120px"
                  placeholder="Enter additional classes"
                  v-model="draft.additionalClasses"
                />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from "vue";
import {
  Text,
  Input,
  Toggle,
  Textarea,
  Notice,
  MultiSelect,
  Dropdown,
  Range,
} from "@/admin/shared/ui/UIKit";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import type { IField } from "@/admin/shared/types/fields.type";
import {
  CURRENCY_POSITION_ITEMS,
  DECIMAL_SEPARATOR_ITEMS,
  THOUSANDS_SEPARATOR_ITEMS,
  clampWidth,
  syncCurrencySettings,
} from "./field-settings.constants";
import { useFieldWidthSync } from "./useFieldWidthSync";
import { useAutoSyncDraft } from "./useAutoSyncDraft";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();

interface IFileUploadDraft {
  label: string;
  fieldName: string;
  description: string;
  width: number;
  fileFormats: string[];
  maxAttachedFiles: string;
  maxFileSize: string;
  required: boolean;
  addToSummary: boolean;
  allowCurrency: boolean;
  calculateHidden: boolean;
  hidden: boolean;
  uploadFromUrl: boolean;
  allowPrice: boolean;
  price: string;
  calculatePerEach: boolean;
  additionalClasses: string;
  useCurrencySign: boolean;
  fieldCurrency: boolean;
  fieldCurrencySettings: {
    currency: string;
    currencyPosition: string;
    thousands_separator: string;
    num_after_integer: number;
    decimal_separator: string;
  };
}

const draft = reactive<IFileUploadDraft>({
  label: "",
  fieldName: "",
  description: "",
  width: 100,
  fileFormats: [],
  maxAttachedFiles: "1",
  maxFileSize: "0",
  required: false,
  addToSummary: true,
  allowCurrency: false,
  calculateHidden: false,
  hidden: false,
  uploadFromUrl: false,
  allowPrice: true,
  price: "0",
  calculatePerEach: false,
  additionalClasses: "",
  useCurrencySign: false,
  fieldCurrency: false,
  fieldCurrencySettings: {
    currency: "",
    currencyPosition: "",
    thousands_separator: "",
    num_after_integer: 0,
    decimal_separator: "",
  },
});

const fieldTabs = [
  { id: "element", label: "Element" },
  { id: "settings", label: "Settings" },
];

const activeTab = ref<string>("element");

useFieldWidthSync(() => props.field, draft);

const { suppressAutoSync, restoredVersion } = useAutoSyncDraft(
  () => props.field,
  draft,
  {
    additionalClasses: "additionalStyles",
    maxAttachedFiles: "max_attached_files",
    maxFileSize: "max_file_size",
  },
);

const updateToggle = (key: string): void => {
  if (key === "allowCurrency" && draft.allowCurrency && draft.fieldCurrency) {
    draft.fieldCurrency = false;
  }

  if (key === "fieldCurrency" && draft.fieldCurrency && draft.allowCurrency) {
    draft.allowCurrency = false;
  }
};

const syncDraftFromField = (): void => {
  const source = props.field as IField & {
    fileFormats?: string[];
    max_attached_files?: number;
    max_file_size?: number | false;
    required?: boolean;
    addToSummary?: boolean;
    allowCurrency?: boolean;
    calculateHidden?: boolean;
    uploadFromUrl?: boolean;
    allowPrice?: boolean;
    price?: number;
    calculatePerEach?: boolean;
    additionalStyles?: string;
    useCurrencySign?: boolean;
    fieldCurrency?: boolean;
    fieldCurrencySettings?: {
      currency: string;
      currencyPosition: string;
      thousands_separator: string;
      num_after_integer: number;
      decimal_separator: string;
    };
  };

  draft.label = String(source.label || "");
  draft.fieldName = String(source.fieldName || "");
  draft.description = String(source.description || "");
  draft.width = clampWidth(source.width);
  draft.fileFormats = source.fileFormats || [];
  draft.maxAttachedFiles = String(source.max_attached_files ?? 1);
  draft.maxFileSize = String(
    source.max_file_size === false ? 0 : (source.max_file_size ?? 0),
  );
  draft.required = Boolean(source.required);
  draft.addToSummary = Boolean(source.addToSummary);
  draft.allowCurrency = Boolean(source.allowCurrency);
  draft.calculateHidden = Boolean(source.calculateHidden);
  draft.hidden = Boolean(source.hidden);
  draft.uploadFromUrl = Boolean(source.uploadFromUrl);
  draft.allowPrice = Boolean(source.allowPrice ?? true);
  draft.price = String(source.price ?? 0);
  draft.calculatePerEach = Boolean(source.calculatePerEach);
  draft.additionalClasses = String(source.additionalStyles || "");
  draft.useCurrencySign = Boolean(source.useCurrencySign);
  draft.fieldCurrency = Boolean(source.fieldCurrency);
  draft.fieldCurrencySettings = syncCurrencySettings(
    source.fieldCurrencySettings,
  );
};

const fileFormats = [
  //Images
  { value: "png", label: "PNG" },
  { value: "jpg/jpeg", label: "JPG/JPEG" },
  { value: "gif", label: "GIF" },
  { value: "webp", label: "WEBP" },
  { value: "svg", label: "SVG" },
  { value: "tiff", label: "TIFF" },
  { value: "tif", label: "TIF" },
  //Documents
  { value: "pdf", label: "PDF" },
  { value: "csv", label: "CSV" },
  { value: "doc/docx", label: "DOC/DOCX" },
  { value: "ppt/pptx", label: "PPT/PPTX" },
  { value: "pps/ppsx", label: "PPS/PPSX" },
  { value: "odt", label: "ODT" },
  { value: "xls/xlsx", label: "XLS/XLSX" },
  { value: "psd", label: "PSD" },
  { value: "key", label: "KEY" },
  { value: "ai", label: "AI" },
  { value: "cdr", label: "CDR" },
  { value: "dxf", label: "DXF" },
  { value: "dwg", label: "DWG" },
  //Audio
  { value: "mp3", label: "MP3" },
  { value: "m4a", label: "M4A" },
  { name: "ogg", label: "OGG" },
  { value: "wav", label: "WAV" },
  //Video
  { value: "mp4", label: "MP4" },
  { value: "mov", label: "MOV" },
  { value: "avi", label: "AVI" },
  { value: "mpg", label: "MPG" },
  { value: "ogv", label: "OGV" },
  { value: "3gp", label: "3GP" },
  { value: "3g2", label: "3G2" },
  //Compression
  { value: "zip", label: "ZIP" },
  { value: "rar", label: "RAR" },
];

watch(
  () => [props.field.alias, restoredVersion.value],
  () => suppressAutoSync(() => syncDraftFromField()),
  { immediate: true },
);
</script>

<style scoped lang="scss">
@use "@/admin/features/builder/field-settings";
</style>
