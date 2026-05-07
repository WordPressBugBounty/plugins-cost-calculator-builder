<template>
  <div class="ccb-box-with-radio ccb-vertical-radio">
    <label
      class="ccb-radio-label"
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
import { toRefs } from "vue";
import { IOptions, ISingleOptionsField } from "@/widget/shared/types/fields";
import { useSingleOptionChildShared } from "@/widget/actions/fields/composable/useSingleOptionChildShared.ts";

const emit = defineEmits<{
  (event: "update", option: IOptions): void;
}>();

type Props = {
  options: IOptions[];
  alias: string;
  current?: IOptions;
  repeater?: number;
  field: ISingleOptionsField;
};

const props = defineProps<Props>();
const { options, field } = toRefs(props);

const { getName } = useSingleOptionChildShared(props, emit);

import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const {
  borderColor,
  formFieldsColor,
  textColor,
  accentColor,
  accentColorAlpha,
} = useAppearanceColors();
</script>

<style lang="scss" scoped>
.ccb-vertical-radio {
  .ccb-box-with-radio {
    flex-direction: column;
  }
}

.ccb-box-with-radio {
  display: flex;
  gap: 10px;
  font-size: var(--ccb-field-size);
  font-weight: var(--ccb-field-weight);
  color: var(--ccb-text-color);
  padding: 5px 0;
  flex-wrap: wrap;

  @media only screen and (max-width: 480px) {
    font-size: var(--ccb-mobile-field-size);
    font-weight: var(--ccb-mobile-field-weight);
  }

  label {
    margin: 0;
    padding: 12px 30px 12px 15px;
    background: v-bind(formFieldsColor);
    border: 1px solid v-bind(borderColor);
    border-radius: var(--ccb-fields-border-radius);
    color: v-bind(textColor);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    line-height: 1.25;
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
      background-color: v-bind(formFieldsColor);
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

      &[type="radio"]:checked {
        border-color: v-bind(accentColor);
        background-color: v-bind(accentColor);
      }

      &:before {
        content: "";
        width: 10px;
        min-width: 10px;
        height: 10px;
        display: block;
        border-radius: 50%;
        background-color: v-bind(formFieldsColor);
      }
    }
  }

  label:has(input[type="radio"]:checked) {
    border-color: v-bind(accentColor);
    background: v-bind(accentColorAlpha);
  }
}
</style>
