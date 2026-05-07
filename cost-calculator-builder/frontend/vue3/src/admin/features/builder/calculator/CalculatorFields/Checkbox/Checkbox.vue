<template>
  <div
    class="ccb-field ccb-checkbox-field"
    :class="{
      required: isRequired,
      'ccb-field-disabled': field.disabled,
      [additionalClasses]: true,
      [`ccb-field-element-columns-${field.styles?.elementColumns}`]:
        field.styles?.elementColumns,
    }"
  >
    <div class="ccb-field__label">
      <RequiredHint
        v-if="
          isRequired &&
          field.selectedOption &&
          field.selectedOption.length < field.minAllowedOptions
        "
        :text="
          field.minAllowedOptions === 1
            ? field.minAllowedOptions +
              ' ' +
              translationsStore.getTranslations.minRequiredSingle
            : field.minAllowedOptions +
              ' ' +
              translationsStore.getTranslations.minRequiredPlural
        "
      />
      <RequiredHint v-else-if="isRequired" :text="requiredWarningText" />
      <div class="ccb-field__title">
        {{ field.label.trim()
        }}<span v-if="field.required" class="ccb-field-required-mark">*</span>
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
      <component
        :is="currentComponents"
        :field="field"
        :values="field.options"
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
import { toRefs, computed, defineAsyncComponent } from "vue";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import { IMultiOptionsField } from "@/widget/shared/types/fields";
import RequiredHint from "@/widget/shared/ui/components/Required-hint/RequiredHint.vue";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore";

const props = defineProps<{
  field: IMultiOptionsField;
}>();
const { field } = toRefs(props);

const translationsStore = useTranslationsStore();
const appearanceStore = useAppearanceStore();

const isRequired = computed(() => {
  return false;
});

const requiredWarningText = computed(() => {
  return "";
});

const currentComponents = computed(() => {
  const style = field.value.styles?.style || "default";

  if (style === "default") {
    return defineAsyncComponent(() => import("./styles/DefaultStyle.vue"));
  } else if (style === "box") {
    return defineAsyncComponent(() => import("./styles/Box.vue"));
  } else if (style === "box-with-checkbox") {
    return defineAsyncComponent(() => import("./styles/BoxWithCheckbox.vue"));
  } else if (style === "box-with-checkbox-and-description") {
    return defineAsyncComponent(
      () => import("./styles/BoxWithCheckboxAndDescription.vue"),
    );
  } else if (style === "box-with-heading-checkbox-and-description") {
    return defineAsyncComponent(
      () => import("./styles/BoxWithHeadingCheckboxAndDescription.vue"),
    );
  }

  return "";
});

const additionalClasses = computed(() => {
  return field.value.additionalStyles || "";
});
</script>

<style lang="scss">
@use "@/styles/widget/_mixins.scss" as mixins;
.ccb-field {
  @media (min-width: 1025px) {
    &.field-width-25 {
      .ccb-checkbox-field {
        .ccb-box-with-heading-checkbox-description {
          label {
            padding: 10px 30px 10px 10px;
            .ccb-checkbox-label {
              .label {
                font-size: calc(var(--ccb-fields-button-size) - 2px);
              }
            }
            &:before {
              right: 6px;
              top: 12px;
            }
            &:after {
              right: 10px;
              top: 19px;
            }
          }
        }
        .ccb-box-with-checkbox-description {
          label {
            padding: 10px 10px 10px 30px;
            &:before {
              left: 6px;
              top: 8px;
            }
            &:after {
              left: 12px;
              top: 15px;
            }
          }
        }
        .ccb-box-with-checkbox {
          label {
            padding: 10px 10px 10px 30px;
            &:before {
              left: 6px;
            }
            &:after {
              left: 12px;
            }
          }
        }
        .ccb-box-checkbox {
          label {
            padding: 8px 16px;
            .ccb-checkbox-label {
              text-align: center;
            }
          }
        }
        .ccb-checkbox-label {
          font-size: calc(var(--ccb-fields-button-size) - 2px) !important;
        }
      }
    }
  }
}
.ccb-checkbox-label {
  font-size: var(--ccb-fields-button-size) !important;

  @media only screen and (max-width: 480px) {
    font-size: var(--ccb-mobile-fields-button-size) !important;
  }
}
</style>
