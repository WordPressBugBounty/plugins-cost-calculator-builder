<template>
  <div class="ccb-default-radio">
    <label
      v-for="(option, idx) in options"
      :class="{
        'ccb-option-disabled': field.disableOptions.includes(idx),
      }"
    >
      <input
        type="radio"
        :name="getName"
        :value="option.optionValue"
        :checked="idx === 0"
      />
      <span class="ccb-radio-label">{{ option.optionText }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from "vue";
import { IOptions, IRadioField } from "@/widget/shared/types/fields";
import { useSingleOptionChildShared } from "@/widget/actions/fields/composable/useSingleOptionChildShared.ts";

const emit = defineEmits<{
  (event: "update", option: IOptions): void;
}>();

const props = defineProps<{
  field: IRadioField;
}>();
const { field } = toRefs(props);

const options = computed(() => {
  return field.value.options;
});

const { getName } = useSingleOptionChildShared(
  {
    options: field.value.options,
    alias: field.value.alias,
    current: field.value.selectedOption,
    repeater: field.value.repeaterIdx,
    field: field.value,
  },
  emit,
);

import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const { borderColor, containerColor } = useAppearanceColors();
</script>

<style lang="scss" scoped>
.ccb-default-radio {
  display: flex;
  gap: 10px;
  font-size: var(--ccb-field-size);
  font-weight: var(--ccb-field-weight);
  padding: 5px 0px;
  flex-direction: flex-start;
  flex-wrap: wrap;

  @media only screen and (max-width: 480px) {
    font-size: var(--ccb-mobile-field-size);
    font-weight: var(--ccb-mobile-field-weight);
  }

  &.ccb-vertical-radio {
    flex-direction: column;
  }

  label {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 0;
    margin: 0;
    cursor: pointer;
    line-height: 1;
    width: fit-content;
    word-break: break-all;
    pointer-events: none;

    input {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
      max-width: 20px;
      min-width: 20px;
      max-height: 20px;
      min-height: 20px;
      border-radius: 50%;
      position: relative;
      border: 2px solid v-bind(borderColor);
      background-color: v-bind(containerColor);
      -webkit-appearance: none;
      margin-right: 7px;
      margin-top: 0;
      outline: none !important;
      box-shadow: none !important;
      box-sizing: border-box;
      padding: 0px;
      margin: 0px;
      margin-right: 7px;
      transition: 300ms ease;

      &:before {
        content: "" !important;
        width: 10px !important;
        min-width: 10px !important;
        height: 10px !important;
        display: block !important;
        margin: 0 !important;
        border-radius: 50% !important;
        line-height: unset !important;
        background-color: v-bind(containerColor);
      }
    }
  }
}

.ccb-vertical-radio {
  .ccb-default-radio {
    flex-direction: column;
  }
}

.ccb-horizontal {
  .ccb-default-radio {
    flex-direction: row;
  }
}
</style>
