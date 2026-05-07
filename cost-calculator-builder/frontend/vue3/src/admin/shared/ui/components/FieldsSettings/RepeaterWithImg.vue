<template>
  <div class="ccb-fields-repeater-img">
    <transition-group
      name="repeater-img-row"
      tag="div"
      class="ccb-fields-repeater-img__list"
    >
      <div
        v-for="(row, index) in rows"
        :key="row._key"
        class="ccb-fields-repeater-img__row"
        :class="{
          'is-active': focusedRow === index,
          'is-dragging': isDragging && index === draggedIndex,
          'is-drop-before': isDragging && dropTargetIndex === index,
          'is-drop-after': isDragging && dropTargetIndex === index + 1,
        }"
        @focusin="focusedRow = index"
        @dragover.prevent="onDragOver(index, $event)"
        @drop.prevent="onDrop"
      >
        <div class="ccb-fields-repeater-img__actions">
          <button
            class="ccb-fields-repeater-img__drag"
            type="button"
            tabindex="-1"
            draggable="true"
            :aria-label="translations.dragOption"
            @dragstart="onDragStart(index, $event)"
            @dragend="onDragEnd"
          >
            <i class="ccb-icon-drag-dots"></i>
          </button>
        </div>

        <div class="ccb-fields-repeater-img__content">
          <div class="ccb-fields-repeater-img__top-row ccb-first-child">
            <div class="ccb-fields-repeater-img__field">
              <span class="ccb-fields-repeater-img__label">{{
                translations.label
              }}</span>
              <input
                v-model="row.optionText"
                class="ccb-fields-repeater-img__input"
                :placeholder="optionLabelPlaceholder"
                type="text"
                @input="emitRows"
              />
              <button
                class="ccb-fields-repeater-img__image-btn"
                type="button"
                :aria-label="translations.selectImage"
                @click="openMedia(index)"
              >
                <img
                  v-if="row.src"
                  class="ccb-fields-repeater-img__image-preview"
                  :src="row.src"
                  :alt="translations.optionImage"
                />
                <i v-else class="ccb-icon-ic_add-image"></i>
              </button>
            </div>

            <button
              class="ccb-fields-repeater-img__remove"
              type="button"
              :disabled="rows.length <= minRows"
              :aria-label="translations.removeOption"
              @click="removeRow(index)"
            >
              <i class="ccb-icon-close-x"></i>
            </button>
          </div>

          <div class="ccb-fields-repeater-img__field ccb-last-child">
            <span class="ccb-fields-repeater-img__label">{{
              translations.value
            }}</span>
            <input
              v-model="row.optionValue"
              class="ccb-fields-repeater-img__input"
              :placeholder="optionValuePlaceholder"
              type="text"
              @input="emitRows"
            />
          </div>
        </div>
      </div>
    </transition-group>

    <Button
      type="green-ghost"
      size="m"
      iconLeft="ccb-icon-ic_plus_big"
      :label="addButtonLabel"
      class="ccb-fields-repeater-img__add"
      :disabled="rows.length >= maxRows"
      @click="addRow"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Button } from "@/admin/shared/ui/UIKit";
import type { IOptions } from "@/admin/shared/types/fields.type";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";

type InternalRow = IOptions & {
  _key: string;
  optionHint: string;
  src: string;
  icon: string;
};

const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);

const props = withDefaults(
  defineProps<{
    modelValue: IOptions[];
    addButtonLabel?: string;
    optionLabelPlaceholder?: string;
    optionValuePlaceholder?: string;
    minRows?: number;
    maxRows?: number;
    name?: string;
  }>(),
  {
    addButtonLabel: "Add Option",
    optionLabelPlaceholder: "Option label",
    optionValuePlaceholder: "Option value",
    minRows: 1,
    maxRows: 100,
    name: "",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: IOptions[]): void;
  (e: "change", name: string, value: IOptions[]): void;
}>();

const rows = ref<InternalRow[]>([]);
const focusedRow = ref<number>(-1);
const minRows = computed(() => Math.max(1, Number(props.minRows || 1)));
const maxRows = computed(() =>
  Math.max(minRows.value, Number(props.maxRows || 100)),
);
const isInternalEmit = ref<boolean>(false);

const draggedIndex = ref<number | null>(null);
const isDragging = ref<boolean>(false);
const dropTargetIndex = ref<number | null>(null);

const allowedMimes = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const createKey = (): string =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createRow = (row?: IOptions, key?: string): InternalRow => {
  const image = String(row?.src || row?.icon || "");
  return {
    _key: key || createKey(),
    optionText: String(row?.optionText || ""),
    optionValue: String(row?.optionValue || ""),
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
      optionHint: String(item.optionHint || ""),
      src: String(item.src || item.icon || ""),
    })),
  );

const emitRows = (): void => {
  const payload = rows.value.map(({ _key, ...rest }) => ({
    optionText: String(rest.optionText || "").trim(),
    optionValue: String(rest.optionValue || "").trim(),
    optionHint: String(rest.optionHint || "").trim(),
    src: String(rest.src || "").trim(),
    icon: String(rest.src || "").trim(),
  }));

  isInternalEmit.value = true;
  emit("update:modelValue", payload);
  emit("change", props.name, payload);
  queueMicrotask(() => {
    isInternalEmit.value = false;
  });
};

const setRowImage = (index: number, imageUrl: string): void => {
  if (!rows.value[index]) return;
  rows.value[index].src = imageUrl;
  rows.value[index].icon = imageUrl;
  emitRows();
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
  rows.value.push(createRow());
  focusedRow.value = rows.value.length - 1;
  emitRows();
};

const removeRow = (index: number): void => {
  if (rows.value.length <= minRows.value) return;
  rows.value.splice(index, 1);
  if (focusedRow.value >= rows.value.length) {
    focusedRow.value = rows.value.length - 1;
  }
  emitRows();
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
        focusedRow.value = toIndex;
        emitRows();
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
  },
  { deep: true, immediate: true },
);
</script>

<style scoped lang="scss">
.ccb-fields-repeater-img {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__list {
    display: flex;
    flex-direction: column;
    border-radius: 16px;
    gap: 8px;
  }

  &__row {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: stretch;
    gap: 8px;
    border-radius: 12px;
    padding: 8px;
    background: var(--ccb-blue-bg-dull-disabled);
    transition: var(--ccb-transition-normal);

    &.is-active {
      background: var(--ccb-blue-bg-dull-hover);
    }

    &.is-dragging {
      opacity: 0.92;
      transform: scale(0.99);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    }

    &.is-drop-before {
      box-shadow: inset 0 2px 0 var(--ccb-blue-bg-normal);
    }

    &.is-drop-after {
      box-shadow: inset 0 -2px 0 var(--ccb-blue-bg-normal);
    }
  }

  &__actions {
    display: flex;
    align-items: flex-start;
    padding-top: 8px;
  }

  &__drag {
    border: none;
    background: transparent;
    color: var(--ccb-font-labels);
    opacity: 0.7;
    cursor: grab;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 16px;
    }

    &:active {
      cursor: grabbing;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    .ccb-first-child {
      input {
        border-top-left-radius: 14px;
        border-top-right-radius: 14px;
      }
    }

    .ccb-last-child {
      input {
        border-bottom-left-radius: 14px;
        border-bottom-right-radius: 14px;
      }
    }
  }

  &__top-row {
    display: grid;
    grid-template-columns: 1fr 28px 20px;
    align-items: center;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    position: relative;
    width: 216px;
  }

  &__label {
    color: var(--ccb-font-comment);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.2;
    padding-left: 2px;
    position: absolute;
    top: 4px;
    left: 0;
    margin-left: 12px;
  }

  &__input {
    width: 100%;
    height: 48px;
    border: 1px solid var(--ccb-input-border);
    padding: 20px 8px 8px 11px;
    background: var(--ccb-input-normal);
    color: var(--ccb-font-labels);
    font-size: 16px;
    font-weight: 500;
    line-height: 1.2;
    border-radius: 4px;

    &::placeholder {
      color: var(--ccb-font-comment);
      font-size: 14px;
      font-weight: 400;
    }

    &:focus {
      outline: none;
      border-color: transparent !important;
      box-shadow: none !important;
    }
  }

  &__image-btn {
    width: 44px;
    height: 44px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: var(--ccb-input-normal);
    color: var(--ccb-font-labels);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    position: absolute;
    top: 2px;
    right: 3px;

    i {
      font-size: 18px;
      opacity: 0.8;
    }
  }

  &__image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__remove {
    border: none;
    background: transparent;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ccb-font-labels);
    cursor: pointer;

    i {
      font-size: 10px;
      opacity: 0.8;
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  &__add {
    width: max-content;
  }
}

.repeater-img-row-move {
  transition: transform 220ms ease;
}

.repeater-img-row-enter-active,
.repeater-img-row-leave-active {
  transition: all 180ms ease;
}

.repeater-img-row-enter-from,
.repeater-img-row-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
