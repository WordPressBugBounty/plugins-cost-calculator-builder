<template>
  <div class="ccb-box-checkbox">
    <template v-for="(option, idx) in field.options">
      <label
        :for="getName + '_' + idx"
        :class="{
          'ccb-option-disabled': field.disableOptions.includes(idx),
        }"
        v-if="option.optionText"
      >
        <input
          type="checkbox"
          :id="getName + '_' + idx"
          :name="getName"
          :value="option.optionValue"
          :checked="idx === 0"
        />
        <span class="ccb-checkbox-label">{{ option.optionText }} </span>
      </label>
    </template>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { IMultiOptionsField } from "@/widget/shared/types/fields";
import { useMultiOptionChildShared } from "@/widget/actions/fields/composable/useMultiOptionChildShared.ts";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const { borderColor, formFieldsColor, textColor, accentColor } =
  useAppearanceColors();

const emit = defineEmits<{
  (event: "update", value: string): void;
}>();

type Props = {
  field: IMultiOptionsField;
  values: string[];
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const { getName } = useMultiOptionChildShared(props, emit);
</script>

<style lang="scss" scoped>
.ccb-box-checkbox {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: var(--ccb-field-size);
  font-weight: var(--ccb-field-weight);
  color: v-bind(textColor);
  padding: 5px 0;
  pointer-events: none;

  @media only screen and (max-width: 480px) {
    font-size: var(--ccb-mobile-field-size);
    font-weight: var(--ccb-mobile-field-weight);
  }

  label {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin: 0;
    cursor: pointer;
    line-height: 1.4;
    padding: 12px 30px;
    position: relative;
    background: v-bind(formFieldsColor);
    border: 1px solid v-bind(borderColor);
    border-radius: var(--ccb-fields-border-radius);
    word-break: break-all;

    input {
      display: none;
    }

    &::after,
    &:before {
      display: none !important;
    }
  }

  label:has(input[type="checkbox"]:checked) {
    background: v-bind(accentColor);
    border-color: v-bind(accentColor);
    color: #fff;
  }
}

.ccb-vertical-checkbox {
  .ccb-box-checkbox {
    flex-direction: column;
  }

  .ccb-checkbox-label {
    word-break: break-word;
  }
}
</style>
