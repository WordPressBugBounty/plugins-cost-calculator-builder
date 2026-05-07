<template>
  <div class="ccb-fields-repeater-date">
    <transition-group
      name="repeater-date-row"
      tag="div"
      class="ccb-fields-repeater-date__list"
    >
      <div
        v-for="(row, index) in rows"
        :key="row._key"
        class="ccb-fields-repeater-date__row"
      >
        <VueDatePicker
          v-model="row.value"
          class="ccb-fields-repeater-date__picker"
          :range="true"
          :format="formatRange"
          model-type="dd/MM/yyyy"
          :enable-time-picker="false"
          :auto-apply="true"
          :clearable="false"
          :placeholder="translations.selectPeriod"
          @update:model-value="onRangeChange(index, $event)"
        />

        <button
          class="ccb-fields-repeater-date__remove"
          type="button"
          :disabled="rows.length <= minRows"
          :aria-label="translations.removePeriod"
          @click="removeRow(index)"
        >
          <i class="ccb-icon-close-x"></i>
        </button>
      </div>
    </transition-group>

    <Button
      type="green-ghost"
      size="m"
      iconLeft="ccb-icon-ic_plus_big"
      :label="addButtonLabel"
      class="ccb-fields-repeater-date__add"
      :disabled="rows.length >= maxRows"
      @click="addRow"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

import { Button } from "@/admin/shared/ui/UIKit";
import type { IPeriod } from "@/admin/shared/types/fields.type";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";

type InternalRow = {
  _key: string;
  value: [string, string] | null;
};

const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);

const props = withDefaults(
  defineProps<{
    modelValue: IPeriod[];
    addButtonLabel?: string;
    minRows?: number;
    maxRows?: number;
    name?: string;
  }>(),
  {
    addButtonLabel: "Add Period",
    minRows: 1,
    maxRows: 100,
    name: "",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: IPeriod[]): void;
  (e: "change", name: string, value: IPeriod[]): void;
}>();

const rows = ref<InternalRow[]>([]);
const minRows = computed(() => Math.max(1, Number(props.minRows || 1)));
const maxRows = computed(() =>
  Math.max(minRows.value, Number(props.maxRows || 100)),
);
const isInternalEmit = ref<boolean>(false);

const createKey = (): string =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const toRange = (period?: IPeriod): [string, string] | null => {
  const start = period?.start ? String(period.start) : "";
  const end = period?.end ? String(period.end) : "";
  return start && end ? [start, end] : null;
};

const createRow = (period?: IPeriod, key?: string): InternalRow => ({
  _key: key || createKey(),
  value: toRange(period),
});

const normalize = (
  value: IPeriod[],
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

const toComparable = (list: Array<IPeriod | InternalRow>): string =>
  JSON.stringify(
    list.map((item) => {
      if ("value" in item) {
        return {
          start: item.value?.[0] || null,
          end: item.value?.[1] || null,
        };
      }

      return {
        start: item.start || null,
        end: item.end || null,
      };
    }),
  );

const emitRows = (): void => {
  const payload = rows.value.map((item) => ({
    start: item.value?.[0] || null,
    end: item.value?.[1] || null,
  }));

  isInternalEmit.value = true;
  emit("update:modelValue", payload);
  emit("change", props.name, payload);
  queueMicrotask(() => {
    isInternalEmit.value = false;
  });
};

const onRangeChange = (index: number, value: [string, string] | null): void => {
  if (!rows.value[index]) return;
  rows.value[index].value = value;
  emitRows();
};

const addRow = (): void => {
  if (rows.value.length >= maxRows.value) return;
  rows.value.push(createRow());
  emitRows();
};

const removeRow = (index: number): void => {
  if (rows.value.length <= minRows.value) return;
  rows.value.splice(index, 1);
  emitRows();
};

const formatRange = (value: Date[]): string => {
  if (
    !Array.isArray(value) ||
    value.length < 2 ||
    !(value[0] instanceof Date) ||
    !(value[1] instanceof Date)
  ) {
    return "";
  }

  const formatDate = (date: Date): string => {
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    const year = date.getFullYear();
    return `${month}.${day}.${year}`;
  };

  return `${formatDate(value[0])} - ${formatDate(value[1])}`;
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
.ccb-fields-repeater-date {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
    height: 48px;
    border-radius: 16px;
    background: var(--ccb-blue-bg-dull-disabled);
    position: relative;
  }

  &__picker {
    flex: 1;
    min-width: 0;
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
    position: absolute;
    right: 14px;
    top: 20px;

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

:deep(.ccb-fields-repeater-date__picker) {
  .dp__input_wrap {
    .dp__input_icon {
      display: none;
    }

    .dp__input {
      border: 1px solid transparent;
      border-radius: 16px;
      background: var(--ccb-input-normal);
      font-size: 16px;
      font-weight: 500;
      line-height: 1.2;
      color: var(--ccb-font-labels);
      padding: 10px 16px;
      width: 232px;

      &::placeholder {
        color: var(--ccb-font-comment);
      }

      &:focus {
        box-shadow: none;
      }
    }
  }

  .dp__menu {
    border: none;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.repeater-date-row-move {
  transition: transform 220ms ease;
}

.repeater-date-row-enter-active,
.repeater-date-row-leave-active {
  transition: all 180ms ease;
}

.repeater-date-row-enter-from,
.repeater-date-row-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
