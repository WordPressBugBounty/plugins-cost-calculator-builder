<template>
  <div
    class="ccb-field ccb-file-upload"
    :class="{
      'ccb-field-disabled': field.disabled,
      [additionalClasses]: true,
    }"
  >
    <div class="ccb-field__label">
      <div class="ccb-field__title">
        {{ field.label
        }}<span v-if="field.required" class="ccb-field-required-mark">*</span
        ><ProBadge />
        <Hint>
          <template #content>
            Supported file types:
            {{ getAllowedFormats.map((item) => `.${item}`).join(", ") }} <br />
            File size: {{ computedMaxFileSize }} MB <br />
            Max {{ computedMaxAttachedFiles }} files
          </template>
        </Hint>
      </div>
      <div class="ccb-field__hidden" v-if="field.hidden">
        <i class="ccb-icon-ic_eye_crossed"></i>
      </div>
    </div>

    <div
      v-if="appearanceStore.getAppearanceDescriptionPosition === 'before'"
      class="ccb-field__descriptions ccb-before"
    >
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>

    <div class="ccb-file-upload__input">
      <input type="file" />
    </div>

    <div class="ccb-file-upload__buttons">
      <button
        :class="{ 'ccb-btn-disableWrong file formatd': checkLimit }"
        @click="chooseFileBtn"
        class="upload"
      >
        Choose File
      </button>
      <button
        :class="{ 'ccb-btn-disabled': checkLimit }"
        @click="uploadFromUrlBtn"
        v-if="field.uploadFromUrl"
        class="upload-url"
      >
        Upload from URL
      </button>
    </div>

    <div v-if="uploadFromUrl" class="ccb-file-upload__upload-url">
      <div class="ccb-field__input-wrapper">
        <input
          v-model="fileUploadUrl"
          type="text"
          :placeholder="translationsStore.getTranslations.enterFileUrl"
          @input="changeUploadUrl"
        />
      </div>
      <div>
        <button
          class="upload"
          :class="{ 'ccb-btn-disabled': !fileUploadUrl.length }"
          @click="uploadFileFromUrl"
        >
          Upload
        </button>
      </div>
    </div>

    <div v-if="uploadedFiles.length > 0">
      <div
        v-if="uploadedFiles.length > 3"
        class="ccb-file-upload__file-list"
        @click="allowList = !allowList"
      >
        <span
          >{{ uploadedFiles.length }}
          {{ translationsStore.getTranslations.filesUploaded }}</span
        >
      </div>
      <div
        v-if="uploadedFiles.length <= 3 || allowList"
        class="ccb-file-upload__files"
      >
        <div
          v-for="(file, idx) in uploadedFiles"
          :key="idx"
          class="ccb-file-upload__file"
        >
          <span class="name">{{ file.name }}</span>
          <span class="action" @click="() => removeFile(idx)">
            <i class="ccb-icon-close"></i>
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="appearanceStore.getAppearanceDescriptionPosition === 'after'"
      class="ccb-field__descriptions ccb-after"
    >
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>

    <input
      ref="fileElement"
      style="display: none"
      type="file"
      :accept="getAllowedFormats.map((item) => `.${item}`).join(',')"
      :multiple="(field.maxAttachedFiles || 1) > 1"
      @change="addFiles"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, ref } from "vue";
import { IFileUploadField } from "@/widget/shared/types/fields";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore.ts";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
const { borderColor, formFieldsColor, textColor, accentColor, containerColor } =
  useAppearanceColors();

const props = defineProps<{
  field: IFileUploadField;
}>();
const { field } = toRefs(props);

const appearanceStore = useAppearanceStore();
const translationsStore = useTranslationsStore();
const fileElement = ref<HTMLDivElement | null>(null);
const uploadedFiles = ref<File[]>([]);
const fileUploadUrl = ref<string>("");
const uploadFromUrl = ref<boolean>(false);
const requiredType = ref<string>("");
const allowList = ref<boolean>(false);

const additionalClasses = computed(() => {
  return field.value.additionalStyles || "";
});

const checkLimit = computed(() => {
  return field.value.maxAttachedFiles <= uploadedFiles.value.length;
});

const chooseFileBtn = () => {
  if (!checkLimit.value) {
    uploadFromUrl.value = false;
    fileElement?.value?.click();
  }
};

const uploadFromUrlBtn = () => {
  if (!checkLimit.value) {
    uploadFromUrl.value = !uploadFromUrl.value;
    fileUploadUrl.value = "";
  }
};

const changeUploadUrl = () => (requiredType.value = "");

const computedMaxAttachedFiles = computed(() => {
  return field.value.maxAttachedFiles || 1;
});

const computedMaxFileSize = computed(() => {
  return field.value.maxFileSize || 1;
});

const addFiles = (event: Event) => {
  requiredType.value = "";
  const target = event.target as HTMLInputElement;

  let innerUploadedFiles: File[] = [...uploadedFiles.value];
  let newFiles = Array.from(target?.files || []);

  newFiles.forEach((file: File) => {
    let fileName = file.name;
    let fileExtension = "";
    let dotIndex = fileName.lastIndexOf(".");

    if (dotIndex !== -1) {
      fileExtension = fileName.slice(dotIndex);
      fileName = fileName.slice(0, dotIndex);
    }

    let duplicateCount = innerUploadedFiles.filter((f) =>
      f.name.startsWith(fileName),
    ).length;

    if (duplicateCount > 0) {
      fileName = `${fileName}(${duplicateCount})`;
    }

    let newFile = new File([file], fileName + fileExtension, {
      type: file.type,
    });
    innerUploadedFiles.push(newFile);
  });

  innerUploadedFiles = innerUploadedFiles.filter((file) => validateFile(file));

  if (field.value.maxAttachedFiles < innerUploadedFiles.length) {
    let amountToRemove =
      innerUploadedFiles.length - field.value.maxAttachedFiles;
    innerUploadedFiles.splice(
      innerUploadedFiles.length - amountToRemove,
      amountToRemove,
    );
  }

  uploadedFiles.value = innerUploadedFiles;
};

const removeFile = (fileIndex: number): void => {
  requiredType.value = "";
  uploadedFiles.value.splice(fileIndex, 1);
  if (fileElement.value && "value" in fileElement.value) {
    fileElement.value.value = "";
  }
};

const uploadFileFromUrl = (): void => {
  let innerUploadedFiles = [...uploadedFiles.value];
  if (field.value.maxAttachedFiles < innerUploadedFiles.length + 1) {
    return;
  }

  let fileName: string =
    fileUploadUrl.value?.split("/")?.pop()?.split("#")[0]?.split("?")[0] || "";

  fetch(fileUploadUrl.value)
    .then(async (response: Response) => {
      if (!response.ok) {
        requiredType.value = "upload_url";
        return false;
      }

      return response.blob();
    })
    .then((blob: Blob | boolean) => {
      if (
        blob &&
        typeof blob !== "boolean" &&
        requiredType.value !== "upload_url"
      ) {
        if (fileName.lastIndexOf(".") === -1) {
          let extension = blob.type.split("/")[1].toLowerCase();
          fileName = fileName + "." + extension;
        }

        let file = new File([blob], fileName, { type: blob.type });
        if (validateFile(file)) {
          uploadedFiles.value.push(file);
        }
      }
    })
    .catch(() => {
      requiredType.value = "upload_url";
    });

  fileUploadUrl.value = "";
};

const validateFile = (file: File): boolean => {
  let fileSizeInMB: number = Number((file.size / (1024 * 1024)).toFixed(2));

  if (field.value.maxFileSize < fileSizeInMB) {
    requiredType.value = "big_file_size";
    return false;
  }

  const last: string = file?.name?.split(".")?.pop()?.toLowerCase() || "";
  if (!getAllowedFormats.value.includes(last)) {
    requiredType.value = "wrong_format";
    return false;
  }

  return true;
};

const getAllowedFormats = computed(() => {
  return field.value.fileFormats;
});
</script>

<style lang="scss">
.ccb-field {
  @media (min-width: 1025px) {
    &.field-width-25 {
      .ccb-file-upload {
        .ccb-file-upload__files {
          .ccb-file-upload__file {
            padding: 5px 6px;
            .name {
              font-size: 12px;
            }
          }
        }
        .ccb-file-upload__buttons {
          flex-wrap: wrap;
          button {
            font-size: calc(var(--ccb-fields-button-size) - 2px);
          }
        }
        .ccb-hint {
          position: absolute;
        }
      }
    }
  }
}
.ccb-file-upload {
  position: relative;
  pointer-events: none;

  .ccb-required-hint-wrapper {
    top: -28px;
    position: absolute;
  }

  &__input {
    input {
      display: none;
    }
  }

  &__file-list {
    span {
      cursor: pointer;
      font-size: calc(var(--ccb-field-size) - 2px);
      font-weight: var(--ccb-field-weight);
      color: v-bind(textColor);

      @media only screen and (max-width: 480px) {
        font-size: calc(var(--ccb-mobile-field-size) - 2px);
        font-weight: calc(var(--ccb-mobile-field-weight) - 2px);
      }
    }
  }

  &__files {
    display: flex;
    gap: 10px;
    padding: 10px 0;
    flex-wrap: wrap;
  }

  &__file {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 5px 10px 6px;
    text-transform: capitalize;
    border-radius: 5px;
    background-color: v-bind(containerColor);
    color: v-bind(textColor);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.3;
    word-break: break-all;

    .action {
      cursor: pointer;
      display: inline-block;
      margin-left: 10px;
      font-size: 11px;
      opacity: 0.7;
      transition: ease-in-out 200ms;
      line-height: 0.3;
    }
  }

  &__buttons {
    display: flex;
    gap: 10px;

    button {
      padding: 10px 0px;
      margin: 0;
      border: none;
      flex: 1;
      border-radius: var(--ccb-fields-border-radius);
      cursor: pointer;
      transition: 300ms ease;
      font-size: var(--ccb-fields-button-size);
      font-weight: var(--ccb-fields-button-weight);

      @media only screen and (max-width: 480px) {
        font-size: var(--ccb-mobile-fields-button-size);
        font-weight: var(--ccb-mobile-fields-button-weight);
      }
    }

    .upload {
      background: v-bind(accentColor);
      color: v-bind(formFieldsColor);

      &:hover {
        background: hsl(from v-bind(accentColor) h s calc(l - 5));
      }
    }

    .ccb-btn-disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    .upload-url {
      background: (v-bind(formFieldsColor));
      color: v-bind(textColor);
      border: 1px solid v-bind(borderColor);

      &:hover {
        background: hsl(from v-bind(formFieldsColor) h s calc(l - 1));
      }
    }
  }

  &__upload-url {
    margin-top: 10px;
    display: flex;
    column-gap: 10px;
    overflow: hidden;
    align-items: center;

    input {
      font-weight: 500;

      &::placeholder {
        color: v-bind(textColor);
      }
    }

    button {
      padding: 10px 0px;
      margin: 0;
      border: none;
      flex: 1;
      border-radius: var(--ccb-fields-border-radius);
      cursor: pointer;
      transition: 300ms ease;
      font-size: var(--ccb-fields-button-size);
      font-weight: var(--ccb-fields-button-weight);
      background: v-bind(accentColor);
      color: v-bind(textColor);
      min-width: 100px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: var(--ccb-field-button-height);
      @media only screen and (max-width: 480px) {
        min-height: var(--ccb-mobile-field-button-height);
        font-size: var(--ccb-mobile-fields-button-size);
        font-weight: var(--ccb-mobile-fields-button-weight);
      }

      &:hover {
        background: hsl(from var(--ccb-accent-color) h s calc(l - 5));
      }

      &.ccb-btn-disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }
  }
}
</style>
