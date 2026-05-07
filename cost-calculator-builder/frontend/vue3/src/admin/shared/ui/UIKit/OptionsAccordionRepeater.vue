<template>
  <div class="ccb-options-accordion">
    <transition-group
      name="options-accordion-item"
      tag="div"
      class="ccb-options-accordion__list"
    >
      <div
        v-for="(row, index) in rows"
        :key="row._key"
        class="ccb-options-accordion__item"
        :class="{
          'is-expanded': expandedRowKey === row._key,
          'is-dragging': isDragging && draggedIndex === index,
          'is-drop-before': isDragging && dropTargetIndex === index,
          'is-drop-after': isDragging && dropTargetIndex === index + 1,
        }"
        @dragover.prevent="onDragOver(index, $event)"
        @drop.prevent="onDrop"
      >
        <div class="ccb-options-accordion__card">
          <button
            type="button"
            class="ccb-options-accordion__summary"
            @click="toggleExpanded(row._key)"
          >
            <span
              class="ccb-options-accordion__drag"
              draggable="true"
              :aria-label="dragLabel"
              @click.stop
              @dragstart="onDragStart(index, $event)"
              @dragend="onDragEnd"
            >
              <i class="ccb-icon-drag-dots"></i>
            </span>

            <div class="ccb-options-accordion__content">
              <span class="ccb-options-accordion__title">
                {{ getRowTitle(row, index) }}
              </span>
              <span class="ccb-options-accordion__meta">
                {{ getRowMeta(row, index) }}
              </span>
            </div>

            <i
              class="ccb-icon-Path-3514 ccb-options-accordion__caret"
              :class="{ 'is-open': expandedRowKey === row._key }"
            ></i>
          </button>

          <div
            v-if="expandedRowKey === row._key"
            class="ccb-options-accordion__body"
          >
            <Input
              v-model="row.optionText"
              :placeholder="optionLabelPlaceholder"
            />

            <div
              class="ccb-options-accordion__grid"
              :class="{
                'is-single-column': !showHint && !showImage,
                'is-image-mode': showImage,
              }"
            >
              <Input
                v-model="row.optionValue"
                :placeholder="optionValuePlaceholder"
                :allowDecimal="true"
              />
              <Input
                v-if="showHint"
                v-model="row.optionHint"
                :placeholder="optionHintPlaceholder"
              />
              <div
                v-else-if="showImage"
                class="ccb-options-accordion__image-field"
              >
                <button
                  type="button"
                  class="ccb-options-accordion__image-button"
                  :class="{ 'is-active': row.src }"
                  @click="openMedia(index)"
                >
                  <img
                    v-if="row.src"
                    class="ccb-options-accordion__image-preview"
                    :src="row.src"
                    alt="Option image"
                  />
                  <span v-else class="ccb-options-accordion__image-placeholder">
                    <i class="ccb-icon-ic_add-image"></i>
                    <span>Upload image</span>
                  </span>
                </button>

                <button
                  v-if="row.src"
                  type="button"
                  class="ccb-options-accordion__image-clear"
                  @click="clearImage(index)"
                >
                  Remove image
                </button>
              </div>
            </div>

            <div class="ccb-options-accordion__actions">
              <Button
                type="red-ghost"
                size="xs"
                textSize="xs"
                textWeight="medium"
                label="Remove"
                :disabled="rows.length <= minRows"
                @click.stop="removeRow(index)"
              />
            </div>
          </div>
        </div>
      </div>
    </transition-group>

    <button
      type="button"
      class="ccb-options-accordion__add"
      :disabled="rows.length >= maxRows"
      @click="addRow"
    >
      <i class="ccb-icon-ic_plus_big"></i>
      <span>{{ addButtonLabel }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Button from "./Button.vue";
import Input from "./Input.vue";
import type { IOptions } from "../../types/fields.type";

type InternalRow = IOptions & {
  _key: string;
  optionHint: string;
  src: string;
  icon: string;
};

const props = withDefaults(
  defineProps<{
    modelValue: IOptions[];
    addButtonLabel?: string;
    optionLabelPlaceholder?: string;
    optionValuePlaceholder?: string;
    optionHintPlaceholder?: string;
    showHint?: boolean;
    showImage?: boolean;
    minRows?: number;
    maxRows?: number;
    name?: string;
    dragLabel?: string;
  }>(),
  {
    addButtonLabel: "Add Option",
    optionLabelPlaceholder: "Option label",
    optionValuePlaceholder: "Option value",
    optionHintPlaceholder: "Hint",
    showHint: true,
    showImage: false,
    minRows: 1,
    maxRows: 100,
    name: "",
    dragLabel: "Drag option",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: IOptions[]): void;
  (e: "change", name: string, value: IOptions[]): void;
}>();

const rows = ref<InternalRow[]>([]);
const expandedRowKey = ref<string>("");
const isInternalEmit = ref(false);
const draggedIndex = ref<number | null>(null);
const isDragging = ref(false);
const dropTargetIndex = ref<number | null>(null);
const allowedMimes = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const minRows = computed(() => Math.max(1, Number(props.minRows || 1)));
const maxRows = computed(() =>
  Math.max(minRows.value, Number(props.maxRows || 100)),
);

const createKey = (): string =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const sanitizeNumericValue = (value: unknown): string => {
  const normalized = String(value ?? "").replace(/,/g, ".");
  const clean = normalized.replace(/[^\d.]/g, "");
  const [integerPart, ...fractionParts] = clean.split(".");

  if (!fractionParts.length) return integerPart;
  return `${integerPart}.${fractionParts.join("")}`;
};

const createRow = (row?: IOptions, key?: string): InternalRow => {
  const image = String(row?.src || row?.icon || "");

  return {
    _key: key || createKey(),
    optionText: String(row?.optionText || ""),
    optionValue: sanitizeNumericValue(row?.optionValue || ""),
    optionHint: String(row?.optionHint || ""),
    src: image,
    icon: image,
  };
};

const normalize = (
  value: IOptions[],
  previous: InternalRow[] = [],
): InternalRow[] => {
  const list = Array.isArray(value) ? value : [];
  const next = list
    .slice(0, maxRows.value)
    .map((item, index) => createRow(item, previous[index]?._key));

  while (next.length < minRows.value) {
    next.push(createRow(undefined, previous[next.length]?._key));
  }

  return next;
};

const toComparable = (list: Array<IOptions | InternalRow>): string =>
  JSON.stringify(
    list.map((item) => ({
      optionText: String(item.optionText || ""),
      optionValue: String(item.optionValue || ""),
      ...(props.showHint ? { optionHint: String(item.optionHint || "") } : {}),
      ...(props.showImage ? { src: String(item.src || item.icon || "") } : {}),
    })),
  );

const emitRows = (): void => {
  const payload = rows.value.map(({ _key, ...rest }) => {
    const item: IOptions = {
      optionText: String(rest.optionText || "").trim(),
      optionValue: sanitizeNumericValue(rest.optionValue || ""),
    };

    if (props.showHint) {
      item.optionHint = String(rest.optionHint || "").trim();
    }

    if (props.showImage) {
      const image = String(rest.src || rest.icon || "").trim();
      item.src = image;
      item.icon = image;
    }

    return item;
  });

  isInternalEmit.value = true;
  emit("update:modelValue", payload);
  emit("change", props.name, payload);
  queueMicrotask(() => {
    isInternalEmit.value = false;
  });
};

const ensureExpandedRow = (): void => {
  if (!rows.value.length) {
    expandedRowKey.value = "";
    return;
  }

  // Keep "all collapsed" state intact during reorder/update.
  if (!expandedRowKey.value) return;

  const hasExpandedRow = rows.value.some(
    (row) => row._key === expandedRowKey.value,
  );
  if (!hasExpandedRow) {
    expandedRowKey.value = rows.value[0]?._key || "";
  }
};

const toggleExpanded = (rowKey: string): void => {
  expandedRowKey.value = expandedRowKey.value === rowKey ? "" : rowKey;
};

const setRowImage = (index: number, imageUrl: string): void => {
  if (!rows.value[index]) return;

  rows.value[index].src = imageUrl;
  rows.value[index].icon = imageUrl;
};

const clearImage = (index: number): void => {
  if (!rows.value[index]) return;

  rows.value[index].src = "";
  rows.value[index].icon = "";
};

const openMedia = (index: number): void => {
  const anyWindow = window as unknown as {
    wp?: {
      media?: {
        editor?: {
          open: () => void;
          send: {
            attachment?: (
              _props: unknown,
              attachment: { mime?: string; url?: string },
            ) => void;
          };
          insert?: (htmlString: string) => void;
        };
      };
    };
  };

  if (anyWindow?.wp?.media?.editor) {
    const wp = anyWindow.wp;
    wp.media?.editor?.open();

    if (wp.media?.editor?.send) {
      wp.media.editor.send.attachment = (_props, attachment) => {
        const mime = String(attachment?.mime || "");
        const url = String(attachment?.url || "");

        if (url && (!mime || allowedMimes.includes(mime))) {
          setRowImage(index, url);
        }
      };
    }

    wp.media!.editor!.insert = (htmlString: string) => {
      const regex = /<img[^>]+src="([^"]+)"[^>]*>/i;
      const match = htmlString.match(regex);

      if (match && match[1]) {
        setRowImage(index, match[1]);
      }
    };
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file || !allowedMimes.includes(file.type)) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRowImage(index, String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };
  input.click();
};

const addRow = (): void => {
  if (rows.value.length >= maxRows.value) return;

  const newRow = createRow();
  rows.value.push(newRow);
  expandedRowKey.value = newRow._key;
};

const removeRow = (index: number): void => {
  if (rows.value.length <= minRows.value) return;

  const removedKey = rows.value[index]?._key;
  rows.value.splice(index, 1);

  if (expandedRowKey.value === removedKey) {
    expandedRowKey.value =
      rows.value[index]?._key || rows.value[index - 1]?._key || "";
  }
};

const getRowTitle = (row: InternalRow, index: number): string =>
  String(row.optionText || "").trim() || `Option ${index + 1}`;

const getRowMeta = (row: InternalRow, index: number): string => {
  const parts = [String(row.optionValue || "").trim() || `Value ${index + 1}`];

  const hint = String(row.optionHint || "").trim();
  if (props.showHint && hint) {
    parts.push(hint);
  }

  if (props.showImage && row.src) {
    parts.push("image added");
  }

  if (expandedRowKey.value === row._key) {
    parts.push("editing");
  }

  return parts.join(" • ");
};

const onDragStart = (index: number, event: DragEvent): void => {
  isDragging.value = true;
  draggedIndex.value = index;
  dropTargetIndex.value = index;

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  }
};

const onDragOver = (index: number, event: DragEvent): void => {
  if (draggedIndex.value === null) return;

  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const isAfterHalf = event.clientY > rect.top + rect.height / 2;
  let nextIndex = index + (isAfterHalf ? 1 : 0);
  nextIndex = Math.max(0, Math.min(nextIndex, rows.value.length));
  dropTargetIndex.value = nextIndex;
};

const onDrop = (): void => {
  if (draggedIndex.value !== null && dropTargetIndex.value !== null) {
    const fromIndex = draggedIndex.value;
    let toIndex = dropTargetIndex.value;

    if (toIndex > fromIndex) {
      toIndex -= 1;
    }

    if (toIndex !== fromIndex) {
      const cloned = [...rows.value];
      const [moved] = cloned.splice(fromIndex, 1);

      if (moved) {
        cloned.splice(toIndex, 0, moved);
        rows.value = cloned;
      }
    }
  }

  isDragging.value = false;
  dropTargetIndex.value = null;
  draggedIndex.value = null;
};

const onDragEnd = (): void => {
  isDragging.value = false;
  dropTargetIndex.value = null;
  draggedIndex.value = null;
};

watch(
  () => props.modelValue,
  (value) => {
    if (isInternalEmit.value) return;

    const normalized = normalize(value, rows.value);
    if (toComparable(rows.value) === toComparable(normalized)) return;

    rows.value = normalized;
    ensureExpandedRow();
  },
  { deep: true, immediate: true },
);

watch(
  rows,
  () => {
    ensureExpandedRow();
    emitRows();
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
.ccb-options-accordion {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__item {
    transition: var(--ccb-transition-normal);

    &.is-dragging {
      opacity: 0.92;
      transform: scale(0.99);
    }

    &.is-drop-before {
      box-shadow: inset 0 2px 0 var(--ccb-green-bg-normal);
      border-radius: 18px;
    }

    &.is-drop-after {
      box-shadow: inset 0 -2px 0 var(--ccb-green-bg-normal);
      border-radius: 18px;
    }
  }

  &__card {
    border: 1px solid var(--ccb-border-normal);
    border-radius: 8px;
    overflow: hidden;
    transition: var(--ccb-transition-normal);
  }

  &__item.is-expanded &__card {
    border-color: var(--ccb-green-bg-normal);
    background: var(--ccb-green-bg-dull-normal);
  }

  &__summary {
    width: 100%;
    border: none;
    background: transparent;
    padding: 3px 8px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
    align-items: center;
    cursor: pointer;
    text-align: left;
  }

  &__drag {
    color: var(--ccb-font-comment);
    cursor: grab;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-top: 2px;

    i {
      font-size: 12px;
    }

    &:active {
      cursor: grabbing;
    }
  }

  &__content {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__title,
  &__meta {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__title {
    color: var(--ccb-font-labels);
    font-size: 12px;
    font-weight: 600;
  }

  &__item.is-expanded &__title,
  &__item.is-expanded &__meta,
  &__item.is-expanded &__caret {
    color: var(--ccb-green-fg-normal);
  }

  &__meta {
    color: var(--ccb-font-comment);
    font-size: 11px;
    line-height: 1.1;
  }

  &__caret {
    color: var(--ccb-font-comment);
    font-size: 10px;
    transition:
      transform 180ms ease,
      color 180ms ease;
    align-self: center;

    &.is-open {
      transform: rotate(180deg);
    }
  }

  &__body {
    padding: 4px 6px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    .ccb-input {
      &__label {
        color: red;
        input {
          border-radius: 8px !important;
        }
      }
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;

    &.is-single-column {
      grid-template-columns: minmax(0, 1fr);
    }

    &.is-image-mode {
      grid-template-columns: minmax(0, 1fr) 120px;
      align-items: start;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-start;

    button {
      padding: 0 6px;
      height: 36px;
    }
  }

  &__image-field {
    display: flex;
    gap: 6px;
    height: 36px;
  }

  &__image-button {
    background: var(--ccb-input-normal);
    transition: var(--ccb-transition-normal);
    border: none;
    border-radius: 12px;
  }

  &__image-clear {
    background: var(--ccb-red-bg-dull-normal);
    color: var(--ccb-red-bg-normal);
    transition: var(--ccb-transition-normal);
    border: none;
    border-radius: 12px;
  }

  &__image-button {
    width: 100%;
    padding: 0;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;

    &.is-active {
      width: 38px;
    }

    &:hover {
      border-color: var(--ccb-green-bg-normal);
    }
  }

  &__image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--ccb-font-comment);
    font-size: 12px;
    font-weight: 500;

    i {
      font-size: 18px;
    }
  }

  &__image-preview {
    width: 100%;
    object-fit: cover;
    display: block;
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  &__image-clear {
    min-height: 32px;
    color: var(--ccb-red-bg-normal);
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    width: 74px;

    &:hover {
      background: var(--ccb-red-bg-dull-normal);
      border-color: var(--ccb-red-bg-normal);
    }
  }

  &__add {
    width: 100%;
    border-radius: 8px;
    border: 1px dashed var(--ccb-green-bg-normal);
    background: var(--ccb-green-bg-dull-normal);
    color: var(--ccb-green-fg-normal);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 6px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--ccb-transition-normal);
    height: 36px;

    &:hover:not(:disabled) {
      background: var(--ccb-green-bg-dull-hover);
      color: var(--ccb-green-fg-hover);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.options-accordion-item-move {
  transition: transform 220ms ease;
}

.options-accordion-item-enter-active,
.options-accordion-item-leave-active {
  transition: all 180ms ease;
}

.options-accordion-item-enter-from,
.options-accordion-item-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
