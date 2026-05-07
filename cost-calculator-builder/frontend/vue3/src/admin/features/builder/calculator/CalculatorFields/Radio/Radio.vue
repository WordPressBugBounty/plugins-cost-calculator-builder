<template>
  <div
    class="ccb-field ccb-radio-field"
    :class="{
      required: isRequired,
      'ccb-field-disabled': field.disabled,
      [additionalClasses]: true,
      [`ccb-field-element-columns-${field.styles?.elementColumns}`]:
        field.styles?.elementColumns,
    }"
  >
    <div class="ccb-field__label">
      <RequiredHint v-if="isRequired" :text="requiredWarningText" />
      <div class="ccb-field__title">
        {{ field.label
        }}<span v-if="field.required" class="ccb-field-required-mark">*</span>
      </div>
      <div class="ccb-field__hidden" v-if="field.hidden">
        <i class="ccb-icon-ic_eye_crossed"></i>
      </div>
    </div>

    <div class="ccb-field__input-wrapper">
      <component
        :is="currentComponents"
        :key="getKey"
        :alias="field.alias"
        :options="field.options"
        :field="field"
      ></component>
    </div>

    <div class="ccb-field__descriptions ccb-before">
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed, defineAsyncComponent } from "vue";
import { IRadioField } from "@/widget/shared/types/fields";
import RequiredHint from "@/widget/shared/ui/components/Required-hint/RequiredHint.vue";

const props = defineProps<{
  field: IRadioField;
}>();
const { field } = toRefs(props);

const getKey = computed(() => {
  return 99999;
});

const isRequired = computed(() => {
  return false;
});

const requiredWarningText = computed(() => {
  return "";
});

const currentComponents = computed(() => {
  const style = field.value.styles?.style || "default";
  if (style === "default") {
    return defineAsyncComponent(() => import("./styles/Default.vue"));
  } else if (style === "box") {
    return defineAsyncComponent(() => import("./styles/Box.vue"));
  } else if (style === "box-with-radio") {
    return defineAsyncComponent(() => import("./styles/BoxRadio.vue"));
  }

  return "";
});

const additionalClasses = computed(() => {
  return field.value.additionalStyles || "";
});
</script>

<style lang="scss">
.ccb-field {
  @media (min-width: 1025px) {
    &.field-width-25 {
      &.ccb_field_with_radio {
        .ccb-box-radio {
          label.ccb-radio-label {
            padding: 8px 16px;
            max-width: 100%;
          }
        }
        .ccb-box-with-radio {
          label.ccb-radio-label {
            padding: 8px;
            max-width: 100%;
          }
        }
        .ccb-radio-label {
          font-size: calc(var(--ccb-field-size) - 2px);
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.ccb-radio-label {
  font-size: var(--ccb-fields-button-size) !important;

  @media only screen and (max-width: 480px) {
    font-size: var(--ccb-mobile-fields-button-size) !important;
  }
}
</style>
