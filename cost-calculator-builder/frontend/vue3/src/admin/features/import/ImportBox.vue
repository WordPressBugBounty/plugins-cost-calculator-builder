<template>
  <div class="ccb-import">
    <div class="ccb-import__header">
      <img :src="uploadIcon" alt="upload-icon" />
    </div>
    <div class="ccb-import__text-box">
      <Text
        class="ccb-import__title"
        :text="isImporting ? 'In Progress' : 'Import Calculators'"
        size="l"
        weight="bold"
      />
      <Text
        class="ccb-import__description"
        :text="
          isImporting
            ? 'The file is uploading and may take a moment.'
            : 'Import prebuilt calculators or upload exported calculator file'
        "
        size="m"
        weight="regular"
      />
    </div>

    <div
      v-if="!isImporting"
      class="ccb-import__process-box"
      :class="{ 'is-drag-over': isDragOver }"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <span class="ccb-import__process-box-text ccb-text-m ccb-regular">
        Drop your file here, or
        <button
          class="ccb-import__upload-link"
          type="button"
          @click="openPicker"
        >
          Upload
        </button>
        from computer.
      </span>
      <input
        ref="fileInputRef"
        class="ccb-import__file-input"
        type="file"
        accept=".txt,.json"
        @change="onFileSelected"
      />
    </div>

    <div v-else class="ccb-import__progress-wrap">
      <div class="ccb-import__progress-track">
        <div
          class="ccb-import__progress-fill"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import uploadIcon from "@/images/upload.svg";
import { Text } from "@/admin/shared/ui/UIKit";
import { useImportExportStore } from "@/admin/app/providers/stores/useImportExportStore";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const importExportStore = useImportExportStore();
const fileInputRef = ref<HTMLInputElement | null>(null);

const isImporting = computed(() => importExportStore.isImporting);
const isDragOver = computed(() => importExportStore.isDragOver);
const progress = computed(() => importExportStore.progress);

const openPicker = (): void => {
  if (importExportStore.isImporting || importExportStore.isLoadingTotal) return;
  fileInputRef.value?.click();
};

const runFileImport = async (file: File): Promise<void> => {
  const prepared = await importExportStore.prepareCustomImport(file);
  if (!prepared) return;

  const imported = await importExportStore.startImport();
  if (imported) {
    emit("close");
  }
};

const onFileSelected = async (event: Event): Promise<void> => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  await runFileImport(file);
  target.value = "";
};

const onDragOver = (): void => {
  importExportStore.setDragOver(true);
};

const onDragLeave = (): void => {
  importExportStore.setDragOver(false);
};

const onDrop = async (event: DragEvent): Promise<void> => {
  importExportStore.setDragOver(false);
  if (importExportStore.isImporting || importExportStore.isLoadingTotal) return;
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  await runFileImport(file);
};

onMounted(() => {
  importExportStore.reset();
});

onBeforeUnmount(() => {
  importExportStore.reset();
});
</script>

<style scoped lang="scss">
.ccb-import {
  display: flex;
  flex-direction: column;
  row-gap: 40px;
  align-items: center;
  border: none;

  &__header {
  }

  &__text-box {
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    align-items: center;

    .ccb-import__title {
      color: var(--ccb-font-heads);
    }

    .ccb-import__description {
      color: var(--ccb-font-comment);
    }
  }

  &__process-box {
    width: 100%;
    height: 100%;
    background: var(--ccb-bgr-overlay);
    width: 640px;
    min-height: 160px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;

    border-radius: 16px;
    border: 1px dashed var(--ccb-border-normal);

    &-text {
      color: var(--ccb-font-comment);
    }

    &.is-drag-over {
      border-color: var(--ccb-blue-bg-normal);
      background: var(--ccb-bgr-menu);
    }
  }

  &__file-input {
    display: none;
  }

  &__upload-link {
    border: 0;
    padding: 0;
    background: transparent;
    color: var(--ccb-blue-bg-normal);
    cursor: pointer;
    font: inherit;
  }

  &__progress-wrap {
    width: 640px;
    min-height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__progress-track {
    width: 440px;
    height: 24px;
    border-radius: 99px;
    overflow: hidden;
    background: var(--ccb-bgr-menu);
  }

  &__progress-fill {
    height: 100%;
    border-radius: 99px;
    background: var(--ccb-blue-bg-normal);
    transition: width 0.2s ease;
  }
}
</style>
