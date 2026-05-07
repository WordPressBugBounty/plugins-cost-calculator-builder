<template>
  <div
    class="ccb-field ccb-text-field"
    :class="{
      'ccb-field-disabled': field.disabled,
      [additionalClasses]: true,
    }"
  >
    <div class="ccb-field__label">
      <div class="ccb-field__title">
        <span>{{ field.label }}</span>
        <span v-if="field.required" class="ccb-field-required-mark">*</span>
      </div>
      <div class="ccb-field__hidden" v-if="field.hidden">
        <i class="ccb-icon-ic_eye_crossed"></i>
      </div>
    </div>

    <div
      v-if="appearanceStore.getAppearanceDescriptionPosition === 'before'"
      class="ccb-field__descriptions ccb-before"
    >
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>

    <div class="ccb-field__input-wrapper">
      <textarea
        :value="field.displayValue"
        :placeholder="field.placeholder"
        @input="onInput"
      />
    </div>

    <div
      v-if="appearanceStore.getAppearanceDescriptionPosition === 'after'"
      class="ccb-field__descriptions ccb-after"
    >
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed, ref } from "vue";
import { ITextField } from "@/widget/shared/types/fields";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const props = defineProps<{
  field: ITextField;
}>();
const { field } = toRefs(props);

const fieldStore = useFieldsStore();
const appearanceStore = useAppearanceStore();

const requitedType = ref<string>("required");

const updateValue = (value: string) => {
  requitedType.value = "required";
  let displayValue: string = value;
  field.value.value = 0;
  field.value.displayValue = displayValue;

  const length = field.value.displayValue?.length;

  if (field.value.numberOfCharacters === 0) {
    field.value.numberOfCharacters = 150;
  }
  if (!field.value.numberOfCharacters) {
    fieldStore.updateField(field.value.alias, field.value);
    return;
  }

  requitedType.value =
    length > field.value.numberOfCharacters ? "limit" : "required";

  fieldStore.updateField(field.value.alias, field.value);
};

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value: string = target.value;
  updateValue(value);
};

const additionalClasses = computed(() => {
  return field.value?.additionalStyles || "";
});

const { textColor, borderColor, formFieldsColor } = useAppearanceColors();
</script>

<style lang="scss">
@use "@/styles/widget/_mixins.scss" as mixins;

.ccb-text-field {
  pointer-events: none;

  .ccb-field__title {
    color: v-bind(textColor);
  }

  textarea {
    resize: vertical;
    min-height: var(--ccb-field-button-height);
    color: v-bind(textColor);
    border-color: v-bind(borderColor);
    background-color: v-bind(formFieldsColor);
    padding: 10px;

    @media only screen and (max-width: 480px) {
      padding: 0 var(--ccb-mobile-field-side-indent);
      min-height: var(--ccb-mobile-field-button-height);
    }
  }
}
</style>
