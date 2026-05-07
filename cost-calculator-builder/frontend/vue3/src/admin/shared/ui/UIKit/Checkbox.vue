<template>
  <div
    class="ccb-checkbox-group"
    :class="{
      'ccb-checkbox-group--columns': template === 'columns',
      'ccb-checkbox-group--rows': template === 'rows',
    }"
  >
    <template v-if="options?.length">
      <label
        v-for="item in options || []"
        :key="String(item.value)"
        class="ccb-checkbox"
        :class="{
          'ccb-checkbox--checked': isChecked(item.value),
          'ccb-checkbox--disabled': disabled || item.disabled,
        }"
      >
        <input
          type="checkbox"
          class="ccb-checkbox__input"
          :checked="isChecked(item.value)"
          :disabled="disabled || item.disabled"
          @change="onChange($event, item)"
        />

        <span class="ccb-checkbox__box">
          <span
            class="ccb-checkbox__checkmark"
            v-if="isChecked(item.value)"
          ></span>
        </span>

        <Text
          v-if="item.label"
          class="ccb-checkbox__label"
          :text="item.label"
          size="m"
          weight="medium"
        />
      </label>
    </template>
    <template v-else>
      <label
        class="ccb-checkbox"
        :class="{
          'ccb-checkbox--checked': modelValue as boolean,
          'ccb-checkbox--disabled': disabled,
        }"
      >
        <input
          type="checkbox"
          class="ccb-checkbox__input"
          :checked="modelValue as boolean"
          :disabled="disabled"
          @change="onChangeSingle"
        />
        <span class="ccb-checkbox__box">
          <span class="ccb-checkbox__checkmark" v-if="modelValue"></span>
        </span>
        <Text
          v-if="label"
          class="ccb-checkbox__label"
          :text="label"
          size="m"
          weight="medium"
        />
      </label>
    </template>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import Text from "./Text.vue";
import { ICheckbox, ICheckboxOption } from "@/admin/shared/types/uikit.type";

const props = defineProps<ICheckbox>();
const { name, modelValue, disabled, template, options, label } = toRefs(props);

const emit = defineEmits<{
  (
    e: "update:modelValue",
    value:
      | Array<string | number | boolean | number>
      | string
      | number
      | boolean,
  ): void;
  (
    e: "change",
    name: string,
    value:
      | Array<string | number | boolean | number>
      | string
      | number
      | boolean,
  ): void;
  (e: "change-single", value: boolean): void;
}>();

const toArray = (value: unknown): Array<string | number | boolean> => {
  if (Array.isArray(value)) return value as Array<string | number | boolean>;
  if (value === null || value === undefined) return [];
  return [value as string | number | boolean];
};

const isChecked = (value: string | number | boolean) => {
  const current = toArray(modelValue.value);
  return current.some((x) => x === value);
};

const onChangeSingle = (e: Event) => {
  if (props.disabled) return;
  const target = e.target as HTMLInputElement;
  emit("change-single", target.checked);
};

const onChange = (e: Event, item: ICheckboxOption) => {
  if (disabled.value || item.disabled) return;

  const checked = (e.target as HTMLInputElement).checked;

  const current = toArray(modelValue.value);
  const next = checked
    ? addItem(current, item.value)
    : removeItem(current, item.value);

  const shouldEmitScalar = (options.value?.length || 0) === 1;
  const emittedNext = shouldEmitScalar
    ? checked
      ? item.value
      : typeof item.value === "boolean"
        ? false
        : []
    : next;

  emit("update:modelValue", emittedNext as any);
  emit("change", name.value || "", emittedNext as any);
};

const addItem = (
  arr: Array<string | number | boolean | number>,
  value: string | number | boolean | number,
) => {
  if (arr.some((x) => x === value)) return arr;
  return [...arr, value];
};

function removeItem(
  arr: Array<string | number | boolean | number>,
  value: string | number | boolean | number,
) {
  return arr.filter((x) => x !== value);
}
</script>

<style scoped lang="scss">
.ccb-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &--columns {
    flex-direction: column;
  }

  &--rows {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

.ccb-checkbox {
  display: inline-flex;
  align-items: flex-start;
  cursor: pointer;
  user-select: none;
  gap: 16px;

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__input {
    opacity: 0;
    position: absolute;
    width: 0;
    height: 0;
    margin: 0;
    display: none;
  }

  &__box {
    width: 20px;
    height: 20px;
    border: 2px solid var(--ccb-border-normal);
    border-radius: 8px;
    background: var(--ccb-input-normal);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    transition: var(--ccb-transition-normal);

    .ccb-checkbox--checked & {
      border-color: var(--ccb-border-normal);
      background: var(--ccb-input-normal);
    }

    .ccb-checkbox--disabled & {
      background: var(--ccb-input-normal);
    }
  }

  &__checkmark {
    position: absolute;
    display: block;
    width: 10px;
    height: 6px;
    border: solid var(--ccb-font-labels);
    border-width: 0 0px 1px 1px;
    transform: rotate(-45deg);
    top: 23%;
    left: 3px;
    transition: border-color var(--ccb-transition-normal);
  }
}
</style>
