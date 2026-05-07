<template>
  <div class="ccb-repeater">
    <div class="ccb-repeater__header" v-if="label">
      <Text
        v-if="label"
        :text="label"
        size="s"
        weight="medium"
        class="ccb-repeater__label"
      />
      <span class="ccb-repeater__required">*</span>
    </div>

    <div class="ccb-repeater__list">
      <div
        v-for="(row, rowIndex) in rows"
        :key="row._key"
        class="ccb-repeater__row"
      >
        <div class="ccb-repeater__grid" :style="{ gridTemplateColumns }">
          <div
            v-for="(field, fieldIndex) in schema"
            :key="field.key"
            class="ccb-repeater__field"
          >
            <input
              class="ccb-repeater__input"
              :placeholder="field.placeholder ?? ''"
              v-model="row[field.key]"
            />
            <span
              class="ccb-repeater__input-separator"
              v-if="fieldIndex < schema.length - 1"
            ></span>
          </div>
        </div>
        <button
          v-if="rows.length > minRows"
          class="ccb-repeater__remove"
          type="button"
          @click="removeRow(rowIndex)"
        >
          <i class="ccb-icon-cross-circle-fill"></i>
        </button>
      </div>
    </div>

    <div class="ccb-repeater__actions">
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
import Button from "./Button.vue";
import Text from "./Text.vue";
import { IRepeaterField } from "@/admin/shared/types/uikit.type";

type AnyRow = Record<string, any>;

type InternalRow = AnyRow & { _key: string };

const props = withDefaults(
  defineProps<{
    modelValue: AnyRow[];
    schema: IRepeaterField[];
    name?: string;

    label?: string;

    minRows?: number;
    maxRows?: number;
  }>(),
  {
    minRows: 1,
    maxRows: 3,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: AnyRow[]): void;
  (e: "change", name: string, value: AnyRow[]): void;
}>();

const minRows = computed(() => Math.max(0, props.minRows));
const maxRows = computed(() => Math.max(minRows.value, props.maxRows));

const makeKey = () => {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
};

const buildEmptyRow = (): InternalRow => {
  const row: InternalRow = { _key: makeKey() };
  props.schema.forEach((f) => {
    if ("defaultValue" in f) {
      row[f.key] = f.defaultValue || "";
    } else if ("default_value" in f) {
      row[f.key] = f.default_value || "";
    } else {
      row[f.key] = "";
    }
  });
  return row;
};

const normalize = (list: AnyRow[]): InternalRow[] => {
  const safe = Array.isArray(list) ? list : [];
  const rows = safe.slice(0, maxRows.value).map((r) => {
    const row: InternalRow = { _key: makeKey() };
    props.schema.forEach((f) => {
      const existing = r?.[f.key];
      if (existing !== undefined && existing !== null) {
        row[f.key] = existing;
      } else if ("defaultValue" in f) {
        row[f.key] = f.defaultValue || "";
      } else if ("default_value" in f) {
        row[f.key] = f.default_value || "";
      } else {
        row[f.key] = "";
      }
    });
    return row;
  });

  while (rows.length < minRows.value) {
    rows.push(buildEmptyRow());
  }

  return rows;
};

const rows = reactive<InternalRow[]>(normalize(props.modelValue));

const gridTemplateColumns = computed(() =>
  props.schema.map((f) => f.width ?? "1fr").join(" "),
);

const emitValue = () => {
  emit(
    "update:modelValue",
    rows.map(({ _key, ...rest }) => rest),
  );
  emit(
    "change",
    props.name || "",
    rows.map(({ _key, ...rest }) => rest),
  );
};

// const setValue = (rowIndex: number, key: string, value: any) => {
//   rows[rowIndex][key] = value;
//   emitValue();
//   emit(
//     'change',
//     props.name || '',
//     rows.map(({ _key, ...rest }) => rest)
//   );
// };

const addRow = () => {
  if (rows.length >= maxRows.value) return;
  rows.push(buildEmptyRow());
  emitValue();
};

const removeRow = (index: number) => {
  if (rows.length <= minRows.value) return;
  rows.splice(index, 1);
  emitValue();
  emit(
    "change",
    props.name || "",
    rows.map(({ _key, ...rest }) => rest),
  );
};

watch(
  rows,
  () => {
    emitValue();
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
.ccb-repeater {
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
    overflow: hidden;
    border: 4px solid var(--ccb-blue-bg-dull-disabled);
  }

  &__field {
    display: flex;
    align-items: center;
  }

  &__input {
    width: 100%;
    border: none;
    padding: 0 12px;
    font-size: 14px;
    height: 40px;
    background: var(--ccb-input-normal);

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
  }
}
</style>
