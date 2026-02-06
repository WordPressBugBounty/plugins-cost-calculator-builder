<template>
  <div
    class="ccb-field"
    :class="[
      'ccb_field_with_' + field.fieldName,
      `field-width-${field.width ? field.width : '100'}`,
    ]"
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
</script>

<style lang="scss">
.ccb-field {
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
