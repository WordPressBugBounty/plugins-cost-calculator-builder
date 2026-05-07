<template>
  <div class="ccb-fields-repeater">
    <div class="ccb-fields-repeater__head">
      <span class="ccb-fields-repeater__head-item">{{
        translations.options
      }}</span>
      <span class="ccb-fields-repeater__head-item">{{
        translations.values
      }}</span>
    </div>

    <transition-group
      name="repeater-row"
      tag="div"
      class="ccb-fields-repeater__list"
    >
      <div
        v-for="(row, index) in rows"
        :key="row._key"
        class="ccb-fields-repeater__row"
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
        <template
          v-if="shouldRenderInput(row._key, 'optionText', row.optionText)"
        >
          <input
            :ref="(el) => setInputRef(row._key, 'optionText', el)"
            v-model="row.optionText"
            class="ccb-fields-repeater__input"
            :placeholder="optionLabelPlaceholder"
            type="text"
            @focus="startEditing(row._key, 'optionText')"
            @blur="stopEditing(row._key, 'optionText')"
            @input="emitRows"
          />
        </template>
        <button
          v-else
          class="ccb-fields-repeater__value"
          type="button"
          @click="startEditing(row._key, 'optionText', true)"
        >
          {{ row.optionText }}
        </button>

        <template
          v-if="shouldRenderInput(row._key, 'optionValue', row.optionValue)"
        >
          <input
            :ref="(el) => setInputRef(row._key, 'optionValue', el)"
            v-model="row.optionValue"
            class="ccb-fields-repeater__input"
            :placeholder="optionValuePlaceholder"
            type="text"
            @focus="startEditing(row._key, 'optionValue')"
            @blur="stopEditing(row._key, 'optionValue')"
            @input="emitRows"
          />
        </template>
        <button
          v-else
          class="ccb-fields-repeater__value"
          type="button"
          @click="startEditing(row._key, 'optionValue', true)"
        >
          {{ row.optionValue }}
        </button>

        <div class="ccb-fields-repeater__actions">
          <button
            class="ccb-fields-repeater__drag"
            type="button"
            tabindex="-1"
            draggable="true"
            :aria-label="translations.dragOption"
            @dragstart="onDragStart(index, $event)"
            @dragend="onDragEnd"
          >
            <i class="ccb-icon-drag-dots"></i>
          </button>
          <button
            class="ccb-fields-repeater__remove"
            type="button"
            :disabled="rows.length <= minRows"
            :aria-label="translations.removeOption"
            @click="removeRow(index)"
          >
            <i class="ccb-icon-close-x"></i>
          </button>
        </div>
      </div>
    </transition-group>

    <Button
      type="green-ghost"
      size="s"
      iconLeft="ccb-icon-ic_plus_big"
      :label="addButtonLabel"
      class="ccb-fields-repeater__add"
      :disabled="rows.length >= maxRows"
      @click="addRow"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { Button } from "@/admin/shared/ui/UIKit";
import type { IOptions } from "@/admin/shared/types/fields.type";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";

type InternalRow = IOptions & { _key: string };
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
const activeCell = ref<string>("");
const inputRefs = ref<Record<string, HTMLInputElement | null>>({});

const createKey = (): string =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const makeCellKey = (
  rowKey: string,
  field: "optionText" | "optionValue",
): string => `${rowKey}:${field}`;

const createRow = (row?: IOptions, key?: string): InternalRow => ({
  _key: key || createKey(),
  optionText: String(row?.optionText || ""),
  optionValue: String(row?.optionValue || ""),
});

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
    })),
  );

const emitRows = (): void => {
  const payload = rows.value.map(({ _key, ...rest }) => ({
    optionText: String(rest.optionText || "").trim(),
    optionValue: String(rest.optionValue || "").trim(),
  }));

  isInternalEmit.value = true;
  emit("update:modelValue", payload);
  emit("change", props.name, payload);
  queueMicrotask(() => {
    isInternalEmit.value = false;
  });
};

const hasValue = (value: unknown): boolean =>
  String(value ?? "").trim().length > 0;

const setInputRef = (
  rowKey: string,
  field: "optionText" | "optionValue",
  el: unknown,
): void => {
  inputRefs.value[makeCellKey(rowKey, field)] =
    el instanceof HTMLInputElement ? el : null;
};

const shouldRenderInput = (
  rowKey: string,
  field: "optionText" | "optionValue",
  value: string,
): boolean => {
  if (!hasValue(value)) return true;
  return activeCell.value === makeCellKey(rowKey, field);
};

const startEditing = async (
  rowKey: string,
  field: "optionText" | "optionValue",
  focusInput = false,
): Promise<void> => {
  activeCell.value = makeCellKey(rowKey, field);
  if (!focusInput) return;
  await nextTick();
  const target = inputRefs.value[activeCell.value];
  target?.focus();
  target?.select();
};

const stopEditing = (
  rowKey: string,
  field: "optionText" | "optionValue",
): void => {
  const key = makeCellKey(rowKey, field);
  if (activeCell.value === key) {
    activeCell.value = "";
  }
};

const addRow = (): void => {
  if (rows.value.length >= maxRows.value) return;
  rows.value.push(createRow());
  focusedRow.value = rows.value.length - 1;
  emitRows();
};

const draggedIndex = ref<number | null>(null);
const isDragging = ref<boolean>(false);
const dropTargetIndex = ref<number | null>(null);

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

const onDragEnd = (): void => {
  isDragging.value = false;
  dropTargetIndex.value = null;
  draggedIndex.value = null;
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

const removeRow = (index: number): void => {
  if (rows.value.length <= minRows.value) return;
  rows.value.splice(index, 1);
  if (focusedRow.value >= rows.value.length) {
    focusedRow.value = rows.value.length - 1;
  }
  emitRows();
};

watch(
  () => props.modelValue,
  (value) => {
    if (isInternalEmit.value) return;

    const normalized = normalize(value, rows.value);
    const currentComparable = toComparable(rows.value);
    const nextComparable = toComparable(normalized);

    if (currentComparable === nextComparable) return;
    rows.value = normalized;
  },
  { deep: true, immediate: true },
);
</script>

<style scoped lang="scss">
.ccb-fields-repeater {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__head {
    display: grid;
    grid-template-columns: 1fr 1fr 48px;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
    background: var(--ccb-bw-dull-normal);
    border-radius: 16px;
  }

  &__head-item {
    color: var(--ccb-font-comment);
    font-size: 13px;
    font-weight: 500;
    line-height: 1.2;
    padding: 7px 7px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    background: var(--ccb-input-normal);
    border-radius: 16px;
    padding: 4px;
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    align-items: center;
    border-radius: 12px;
    padding: 4px;
    background: transparent;
    transition: var(--ccb-transition-normal);

    &.is-active {
      background: var(--ccb-blue-bg-dull-disabled);
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

  &__input {
    width: 100%;
    height: 32px;
    border: 1px solid var(--ccb-input-border);
    border-radius: 10px;
    padding: 8px;
    background: var(--ccb-input-normal);
    color: var(--ccb-font-labels);
    font-size: 16px;
    font-weight: 500;
    line-height: 1.2;

    &::placeholder {
      color: var(--ccb-font-comment);
      font-size: 14px;
      font-weight: 400;
    }

    &:focus {
      outline: none;
      box-shadow: none;
      border-color: transparent !important;
    }
  }

  &__value {
    width: 100%;
    height: 32px;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 8px;
    background: transparent;
    color: var(--ccb-font-labels);
    font-size: 16px;
    font-weight: 500;
    line-height: 0.2;
    text-align: left;
    cursor: text;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: var(--ccb-transition-normal);

    &:hover {
      background: var(--ccb-bw-dull-normal);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 6px;
  }

  &__drag,
  &__remove {
    border: none;
    background: transparent;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--ccb-font-labels);
    transition: var(--ccb-transition-normal);
  }

  &__drag {
    cursor: grab;
    opacity: 0.7;

    i {
      font-size: 16px;
    }

    &:active {
      cursor: grabbing;
    }
  }

  &__remove {
    opacity: 0.8;

    i {
      font-size: 10px;
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  &__add {
    width: max-content;
    margin-left: 16px;
  }
}

.repeater-row-move {
  transition: transform 220ms ease;
}

.repeater-row-enter-active,
.repeater-row-leave-active {
  transition: all 180ms ease;
}

.repeater-row-enter-from,
.repeater-row-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
