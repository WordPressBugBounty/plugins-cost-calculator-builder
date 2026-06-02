<template>
  <div class="ccb-field-cell">
    <div
      v-if="field.rowBreak"
      class="ccb-field-row-break"
      aria-hidden="true"
    ></div>
    <div
      class="ccb-field"
      :class="['ccb_field_with_' + field.fieldName]"
      :style="{ width: fieldWidth }"
      :data-id="field.alias"
      :data-repeater="field.repeaterIdx"
    >
      <component
        v-if="FieldComponent"
        :is="FieldComponent"
        :field="field"
        :key="field.alias"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue";
import {
  fieldRegistry,
  IFields,
} from "@/widget/actions/fields/fieldRegistry.ts";
import { Field } from "@/widget/shared/types/fields";

type Props = {
  name: string;
  field: Field;
};

const props = defineProps<Props>();
const { field, name } = toRefs(props);
const FieldComponent = computed(() => {
  const key: keyof IFields = name.value as keyof IFields;
  return fieldRegistry[key];
});

const fieldWidth = computed(() => {
  const isMObile = window.innerWidth < 540;
  if (isMObile) {
    return "100%";
  }

  if (field.value.width) {
    return field.value.width + "%";
  }

  return "100%";
});
</script>

<style lang="scss">
.ccb-field-cell {
  display: contents;
}

.ccb-field-row-break {
  flex-basis: 100%;
  width: 100%;
  height: 0;
  margin: calc(var(--ccb-field-spacing, 0px) * -1) 0 0 0;
  padding: 0;
  pointer-events: none;
}

.ccb-field {
  padding: 0 4px;
  box-sizing: border-box;
  @media (min-width: 1025px) {
    min-width: 0;
    &.field-width-25 {
      .ccb-field__description {
        white-space: normal;
        word-break: break-word;
        overflow-wrap: anywhere;
        font-size: calc(var(--ccb-description-size) - 3px);
      }
    }
  }
}

.ccb-field__descriptions {
  display: flex;
  flex-direction: column;

  &.ccb-before {
    margin-bottom: 5px;
  }

  &.ccb-after {
    margin-top: 5px;
  }

  & > div {
    width: 100%;
  }
}

.ccb-option-disabled {
  opacity: 0.5 !important;
  pointer-events: none !important;
}
</style>
