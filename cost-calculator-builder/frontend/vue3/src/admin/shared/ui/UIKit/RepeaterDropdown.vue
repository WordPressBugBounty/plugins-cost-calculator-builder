<template>
  <div class="ccb-dropdown-repeater">
    <div class="ccb-dropdown-repeater__header" v-if="label || hint">
      <Text
        :text="label"
        size="s"
        weight="medium"
        class="ccb-dropdown-repeater__label"
        v-if="label"
      />
      <span class="ccb-dropdown-repeater__required">*</span>
    </div>

    <div class="ccb-dropdown-repeater__list">
      <div
        v-for="(row, rowIndex) in rows"
        :key="row._key"
        class="ccb-dropdown-repeater__row"
      >
        <div
          class="ccb-dropdown-repeater__grid"
          :style="{ gridTemplateColumns }"
        >
          <div
            v-for="(field, fieldIndex) in schema"
            :key="field.key"
            class="ccb-dropdown-repeater__field"
          >
            <Dropdown
              class="ccb-dropdown-repeater__dropdown"
              :class="{
                'first-field': fieldIndex === 0,
                'last-field': fieldIndex === schema.length - 1,
              }"
              :label="field.placeholder || ''"
              :items="resolveOptions(field, publicRow(row), rowIndex)"
              :name="field.key"
              :modelValue="normalizeDropdownValue(row[field.key])"
              @change="(_name, value) => setValue(rowIndex, field.key, value)"
            />
            <span
              class="ccb-dropdown-repeater__dropdown-separator"
              v-if="fieldIndex !== schema.length - 1"
            ></span>
          </div>
        </div>

        <button
          v-if="rows.length > minRows"
          class="ccb-dropdown-repeater__remove"
          type="button"
          @click="removeRow(rowIndex)"
        >
          <i class="ccb-icon-cross-circle-fill"></i>
        </button>
      </div>
    </div>

    <div class="ccb-dropdown-repeater__actions">
      <Button
        type="green-ghost"
        size="m"
        iconLeft="ccb-icon-ic_plus_big"
        label="add new"
        v-if="rows.length < maxRows"
        @click="addRow"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import {
  IRepeaterDropdownField,
  IRepeaterDropdownSelectOption,
} from "@/admin/shared/types/uikit.type";
import Dropdown from "./Dropdown.vue";
import Button from "./Button.vue";
import Text from "./Text.vue";

type AnyRow = Record<string, any>;

type InternalRow = AnyRow & { _key: string | number };

const props = withDefaults(
  defineProps<{
    modelValue: AnyRow[] | string[];
    schema: IRepeaterDropdownField[];
    name: string;

    label: string;
    hint?: string;

    minRows?: number;
    maxRows?: number;
    addLabel?: string;
  }>(),
  {
    minRows: 1,
    maxRows: 3,
    addLabel: "Add row",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
  (e: "change", name: string, value: any): void;
}>();

const minRows = computed(() => Math.max(1, props.minRows));
const maxRows = computed(() => Math.max(minRows.value, props.maxRows));

function makeKey() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function normalizeDropdownValue(val: unknown): string {
  if (val && typeof val === "object" && "value" in (val as any)) {
    return String((val as any).value ?? "");
  }
  if (typeof val === "string" || typeof val === "number") {
    return String(val);
  }
  return "";
}

function buildEmptyRow(): InternalRow {
  const row: InternalRow = { _key: makeKey() };
  props.schema.forEach((f) => {
    row[f.key] = "";
  });
  return row;
}

const rows = reactive<InternalRow[]>([]);

function publicRow(row: InternalRow): AnyRow {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _key, ...rest } = row;
  return rest;
}

const gridTemplateColumns = computed(() =>
  props.schema.map((f) => f.width ?? "1fr").join(" "),
);

function emitValue() {
  emit(
    "update:modelValue",
    rows.map((r) => publicRow(r)),
  );
  emit(
    "change",
    props.name,
    rows.map((r) => publicRow(r)),
  );
}

function resolveOptions(
  field: IRepeaterDropdownField,
  row: AnyRow,
  rowIndex: number,
): IRepeaterDropdownSelectOption[] {
  return typeof (field as any).options === "function"
    ? (field as any).options(row, rowIndex)
    : field.options;
}

function syncFromModelValue(list: AnyRow[] | string[]) {
  const safe = Array.isArray(list) ? list : [];
  const next = safe.slice(0, maxRows.value);

  // 1) Update existing rows in-place (keep _key)
  const commonLen = Math.min(rows.length, next.length);
  for (let i = 0; i < commonLen; i++) {
    const source = (next[i] as AnyRow) || {};
    props.schema.forEach((f) => {
      rows[i][f.key] = normalizeDropdownValue(source?.[f.key]);
    });
  }

  // 2) If next has fewer rows — remove extra
  if (rows.length > next.length) {
    rows.splice(next.length);
  }

  // 3) If next has more rows — append new
  for (let i = rows.length; i < next.length; i++) {
    const row: InternalRow = { _key: makeKey() };
    props.schema.forEach((f) => {
      row[f.key] = normalizeDropdownValue((next[i] as AnyRow)?.[f.key]);
    });
    rows.push(row);
  }

  // 4) Ensure minRows
  while (rows.length < minRows.value) {
    rows.push(buildEmptyRow());
  }
}

function setValue(rowIndex: number, key: string, value: any) {
  const row = rows[rowIndex];
  if (!row) return;
  row[key] = value;
  emitValue();
}

function addRow() {
  if (rows.length >= maxRows.value) return;
  rows.push(buildEmptyRow());
  emitValue();
}

function removeRow(index: number) {
  if (rows.length <= minRows.value) return;
  rows.splice(index, 1);
  emitValue();
}

// init
syncFromModelValue(props.modelValue);

// emit on any local change (instant v-model)
watch(
  rows,
  () => {
    emitValue();
  },
  { deep: true },
);

// sync from outside
watch(
  () => props.modelValue,
  (val) => {
    syncFromModelValue(val);
  },
  { deep: true },
);

// if schema changes, rebuild rows to ensure keys exist
watch(
  () => props.schema,
  () => {
    syncFromModelValue(props.modelValue);
  },
  { deep: true },
);
</script>

<style lang="scss">
.ccb-dropdown-repeater {
  display: grid;
  gap: 4px;

  &__header {
    display: flex;
    gap: 4px;
    align-items: baseline;
  }

  &__label {
    color: var(--ccb-font-comment);
    padding-left: 16px;
  }

  &__required {
    color: var(--ccb-red-bg-normal);
  }

  &__list {
    display: grid;
    gap: 4px;
  }

  &__row {
    display: grid;
    align-items: start;
    position: relative;
  }

  &__grid {
    display: grid;
    gap: 0px;
    border-radius: 16px;
    border: 4px solid var(--ccb-blue-bg-dull-disabled);
  }

  &__field {
    display: flex;
    align-items: center;
  }

  &__dropdown {
    width: 100%;
    border: none;
    height: fit-content;

    .ccb-dropdown-input {
      border: none;
      border-radius: 0;
    }

    &.first-field {
      .ccb-dropdown-input {
        border-top-left-radius: 16px;
        border-bottom-left-radius: 16px;
      }
    }

    &.last-field {
      .ccb-dropdown-input {
        border-top-right-radius: 16px;
        border-bottom-right-radius: 16px;
      }
    }

    &-separator {
      width: 4px;
      height: 40px;
      background: var(--ccb-blue-bg-dull-disabled);
    }

    &:focus {
      outline: none;
    }
  }

  &__actions {
    button {
      height: 32px;
    }
  }

  &__remove {
    width: 16px;
    height: 16px;
    border-radius: 10px;
    border: none;
    color: var(--ccb-orange-bg-normal);
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    position: absolute;
    right: -5px;
    top: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
