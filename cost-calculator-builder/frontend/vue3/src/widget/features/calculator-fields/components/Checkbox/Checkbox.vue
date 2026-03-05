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
        :values="fieldValue"
        @update="applyChanges"
        :field="field"
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
import { useMultiOptionsFieldShared } from "@/widget/actions/fields/composable/useMultiOptionsFieldShared.ts";
import RequiredHint from "@/widget/shared/ui/components/Required-hint/RequiredHint.vue";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore";

type Props = {
  field: IMultiOptionsField;
};

const props = defineProps<Props>();
const { field } = toRefs(props);
const translationsStore = useTranslationsStore();
const appearanceStore = useAppearanceStore();
const { applyChanges, isRequired, fieldValue, requiredWarningText } =
  useMultiOptionsFieldShared(props);

const currentComponents = computed(() => {
  const style = field.value?.styles?.style || "default";

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
  return field.value?.additionalStyles || "";
});
</script>

<style lang="scss">
@use "@/styles/widget/_mixins.scss" as mixins;
.ccb-field {
  &.ccb-checkbox-field {
    @for $i from 1 through 8 {
      &.ccb-field-element-columns-#{$i} {
        .ccb-checkbox-grid {
          grid-template-columns: repeat($i, 1fr);
        }
        > * {
          width: 100%;
        }
      }
    }
    .ccb-checkbox-grid {
      display: grid;
      gap: 10px;
    }
    &.ccb-field-element-columns-2 {
      .ccb-box-checkbox {
        label {
          padding-left: 20px;
          padding-right: 20px;
          text-align: center;
        }
      }
    }
    &.ccb-field-element-columns-3 {
      .ccb-box-with-heading-checkbox-and-description {
        gap: 8px;
        label {
          padding-right: 35px;
          .ccb-checkbox-label {
            .label {
              font-size: calc(var(--ccb-fields-button-size) + 2px);
            }
          }
          &:before {
            right: 8px;
          }
          &:after {
            right: 12px;
          }
        }
      }
    }
    &.ccb-field-element-columns-4 {
      .ccb-box-with-heading-checkbox-and-description {
        gap: 6px;
        label {
          padding-right: 15px;
          flex-direction: column;
          align-items: flex-start;
          .ccb-checkbox-label {
            .label {
              font-size: calc(var(--ccb-fields-button-size) + 2px);
            }
          }
          &:before {
            position: relative;
            top: 0;
            left: 0;
            right: auto;
          }
          &:after {
            top: 22px;
            left: 20px;
            right: auto;
          }
        }
      }
    }
    &.ccb-field-element-columns-3,
    &.ccb-field-element-columns-4 {
      .ccb-box-checkbox {
        label {
          padding: 12px;
          text-align: center;
        }
      }
      .ccb-box-with-checkbox {
        gap: 6px;
        label {
          padding-left: 30px;
          &:before {
            left: 6px;
          }
          &:after {
            left: 12px;
          }
        }
      }
      .ccb-box-with-checkbox-and-description {
        gap: 6px;
        label {
          padding-left: 35px;
          padding-right: 10px;
          &:before {
            left: 8px;
          }
          &:after {
            left: 14px;
          }
        }
      }
    }
    &.ccb-field-element-columns-5,
    &.ccb-field-element-columns-6 {
      .ccb-default-checkbox {
        column-gap: 6px;
        .ccb-checkbox-wrapper {
          label {
            padding-left: 0;
            flex-direction: column;
            align-items: flex-start;
            &:before {
              position: relative;
            }
            &:after {
              top: 7px;
            }
          }
        }
      }
      .ccb-box-checkbox {
        gap: 6px;
        label {
          padding: 8px;
          text-align: center;
        }
      }
      .ccb-box-with-checkbox {
        gap: 6px;
        label {
          padding-left: 8px;
          padding-right: 8px;
          flex-direction: column;
          align-items: flex-start;
          &:before {
            left: 0;
            position: relative;
          }
          &:after {
            left: 14px;
            top: 22px;
          }
          .ccb-checkbox-label {
            font-size: calc(var(--ccb-fields-button-size) - 1px);
          }
        }
      }
      .ccb-box-with-checkbox-and-description {
        gap: 6px;
        label {
          padding-left: 10px;
          padding-right: 10px;
          flex-direction: column;
          align-items: flex-start;
          row-gap: 4px;
          .ccb-checkbox-label {
            font-size: calc(var(--ccb-fields-button-size) - 2px);
          }
          &:before {
            left: 0;
            top: 0;
            position: relative;
          }
          &:after {
            left: 16px;
          }
        }
      }
      .ccb-box-with-heading-checkbox-and-description {
        gap: 6px;
        label {
          padding-right: 10px;
          padding-left: 10px;
          flex-direction: column;
          align-items: flex-start;
          row-gap: 4px;
          .ccb-checkbox-label {
            .label {
              font-size: var(--ccb-fields-button-size);
            }
          }
          &:before {
            position: relative;
            top: 0;
            left: 0;
            right: auto;
          }
          &:after {
            top: 22px;
            left: 16px;
            right: auto;
          }
        }
      }
    }
    &.ccb-field-element-columns-7,
    &.ccb-field-element-columns-8 {
      .ccb-default-checkbox {
        column-gap: 6px;
        .ccb-checkbox-wrapper {
          flex-direction: column;
          align-items: flex-start;
          .ccb-toggle-item__postfix {
            .ccb-hint {
              margin-left: 0;
            }
          }
          label {
            padding-left: 0;
            flex-direction: column;
            align-items: flex-start;
            &:before {
              position: relative;
            }
            &:after {
              top: 7px;
            }
          }
          .ccb-checkbox-label {
            font-size: calc(var(--ccb-fields-button-size) - 2px);
          }
        }
      }
      .ccb-box-checkbox {
        gap: 6px;
        label {
          padding: 8px 4px;
          text-align: center;
          .ccb-checkbox-label {
            font-size: calc(var(--ccb-fields-button-size) - 2px);
          }
        }
      }
      .ccb-box-with-checkbox {
        gap: 4px;
        label {
          padding-left: 8px;
          padding-right: 8px;
          flex-direction: column;
          align-items: flex-start;
          &:before {
            left: 0;
            position: relative;
          }
          &:after {
            left: 14px;
            top: 22px;
          }
          .ccb-checkbox-label {
            font-size: calc(var(--ccb-fields-button-size) - 2px);
          }
        }
      }
      .ccb-box-with-checkbox-and-description {
        gap: 6px;
        label {
          padding-left: 10px;
          padding-right: 10px;
          flex-direction: column;
          align-items: flex-start;
          row-gap: 4px;
          .ccb-checkbox-label {
            font-size: calc(var(--ccb-fields-button-size) - 3px);
          }
          &:before {
            left: 0;
            top: 0;
            position: relative;
          }
          &:after {
            left: 14px;
          }
        }
      }
      .ccb-box-with-heading-checkbox-and-description {
        gap: 6px;
        label {
          padding-right: 8px;
          padding-left: 8px;
          flex-direction: column;
          align-items: flex-start;
          row-gap: 4px;
          .ccb-checkbox-label {
            .label {
              font-size: calc(var(--ccb-fields-button-size) - 2px);
            }
          }
          &:before {
            position: relative;
            top: 0;
            left: 0;
            right: auto;
          }
          &:after {
            top: 22px;
            left: 14px;
            right: auto;
          }
        }
      }
    }
  }
  &.field-width-25 {
    .ccb-field-element-columns-1 {
      .ccb-box-with-heading-checkbox-and-description {
        label {
          flex-direction: column;
          align-items: flex-start;
          padding: 30px 6px 6px 6px !important;
          .ccb-checkbox-label {
            .label {
              font-size: calc(var(--ccb-fields-button-size) + 3px);
            }
          }
          &:before {
            top: 8px;
            right: 8px;
          }
          &:after {
            top: 15px;
            right: 12px;
          }
        }
      }
    }
    .ccb-field-element-columns-2,
    .ccb-field-element-columns-3,
    .ccb-field-element-columns-4,
    .ccb-field-element-columns-5,
    .ccb-field-element-columns-6,
    .ccb-field-element-columns-7,
    .ccb-field-element-columns-8 {
      .ccb-checkbox-grid {
        gap: 10px;
        grid-template-columns: repeat(2, 1fr);
      }
      .ccb-default-checkbox {
        .ccb-checkbox-wrapper {
          flex-direction: column;
          align-items: flex-start;
          .ccb-toggle-item__postfix {
            .ccb-hint {
              margin-top: 4px;
              margin-left: 0;
            }
          }
          label {
            flex-direction: column;
            padding-left: 0;
            gap: 4px;
            align-items: flex-start;
            min-height: 20px;
            line-height: 20px;
            .ccb-checkbox-label {
              font-size: calc(var(--ccb-fields-button-size) - 2px) !important;
            }
            &:before {
              position: relative;
            }
            &:after {
              top: 7px;
            }
          }
        }
      }
      .ccb-box-checkbox {
        gap: 6px;
        label {
          padding: 6px !important;
        }
      }
      .ccb-box-with-checkbox {
        gap: 6px;
        label {
          flex-direction: column;
          align-items: flex-start;
          padding: 6px !important;
          gap: 4px;
          &:before {
            position: relative;
            left: 0 !important;
          }
          &:after {
            top: 13px;
          }
        }
      }
      .ccb-box-with-checkbox-and-description {
        gap: 6px;
        label {
          flex-direction: column;
          align-items: flex-start;
          padding: 6px !important;
          gap: 4px;
          &:before {
            left: 0 !important;
            top: 0 !important;
            position: relative;
          }
          &:after {
            left: 12px;
            top: 14px;
          }
        }
      }
      .ccb-box-with-heading-checkbox-and-description {
        gap: 6px;
        label {
          flex-direction: column;
          align-items: flex-start;
          padding: 30px 6px 6px 6px !important;
          .ccb-checkbox-label {
            .label {
              font-size: calc(var(--ccb-fields-button-size) + 1px);
            }
          }
          &:before {
            top: 8px;
            right: auto;
            left: 6px;
            position: absolute;
          }
          &:after {
            top: 15px;
            right: auto;
            left: 12px;
          }
        }
      }
    }
  }
  &.field-width-50 {
    .ccb-field-element-columns-3 {
      .ccb-checkbox-grid {
        &.ccb-default-checkbox {
          .ccb-checkbox-wrapper {
            flex-wrap: wrap;
            label {
              padding-left: 0;
              gap: 4px;
              flex-wrap: wrap;
              &:before {
                position: relative;
              }
              &:after {
                top: 7px;
              }
            }
            .ccb-toggle-item__postfix {
              .ccb-hint {
                margin-left: 0;
              }
            }
          }
        }
      }
      .ccb-box-with-checkbox {
        label {
          padding-left: 10px;
          flex-wrap: wrap;
          &:before {
            position: relative;
            left: 0;
          }
          &:after {
            top: 22px;
            left: 16px;
          }
        }
      }
      .ccb-box-with-checkbox-and-description {
        label {
          padding-left: 10px;
          flex-wrap: wrap;
          &:before {
            position: relative;
            left: 0;
            top: 0;
          }
          &:after {
            top: 22px;
            left: 16px;
          }
        }
      }
    }
    .ccb-field-element-columns-4,
    .ccb-field-element-columns-5,
    .ccb-field-element-columns-6,
    .ccb-field-element-columns-7,
    .ccb-field-element-columns-8 {
      .ccb-checkbox-grid {
        gap: 10px;
        grid-template-columns: repeat(4, 1fr);
      }
      .ccb-default-checkbox {
        .ccb-checkbox-wrapper {
          flex-wrap: wrap;
          align-items: flex-start;
          label {
            padding-left: 0;
            gap: 4px;
            flex-wrap: wrap;
            &:before {
              position: relative;
            }
            &:after {
              top: 7px;
            }
          }
          .ccb-toggle-item__postfix {
            .ccb-hint {
              margin-left: 0;
            }
          }
        }
      }
      .ccb-box-checkbox {
        label {
          padding: 8px;
          .ccb-checkbox-label {
            font-size: var(--ccb-fields-button-size);
          }
        }
      }
      .ccb-box-with-checkbox {
        label {
          padding-left: 8px !important;
          padding-right: 8px !important;
          flex-wrap: wrap;
          font-size: calc(var(--ccb-fields-button-size) - 1px) !important;
          .ccb-checkbox-label {
            font-size: calc(var(--ccb-fields-button-size) - 1px) !important;
          }
          &:before {
            position: relative;
            left: 0;
          }
          &:after {
            top: 22px;
            left: 14px;
          }
        }
      }
      .ccb-box-with-checkbox-and-description {
        label {
          padding-left: 6px;
          padding-right: 6px;
          flex-wrap: wrap;
          font-size: calc(var(--ccb-fields-button-size) - 1px) !important;
          .ccb-checkbox-label {
            font-size: calc(var(--ccb-fields-button-size) - 1px) !important;
          }
          &:before {
            position: relative;
            left: 0;
            top: 0;
          }
          &:after {
            top: 22px;
            left: 12px;
          }
        }
      }
      .ccb-box-with-heading-checkbox-and-description {
        label {
          padding-right: 10px;
          padding-left: 10px;
          gap: 5px;
          flex-direction: row-reverse;
          align-items: flex-start;
          &:before {
            position: relative;
            top: 0;
            left: 0;
            right: auto;
          }
          &:after {
            top: 22px;
            right: 14px;
            left: unset;
          }
          .ccb-checkbox-label {
            .label {
              font-size: calc(var(--ccb-fields-button-size) + 2px);
            }
          }
        }
      }
    }
    .ccb-field-element-columns-1 {
      .ccb-checkbox-grid {
        gap: 10px;
        grid-template-columns: repeat(1, 1fr);
        &.ccb-box-with-heading-checkbox-and-description {
          label {
            flex-direction: row;
            &:before {
              position: absolute;
              top: 22px;
              right: 15px;
              left: unset;
            }
            &:after {
              top: 28px;
              left: unset;
              right: 20px;
            }
          }
        }
      }
    }
    .ccb-field-element-columns-2 {
      .ccb-checkbox-grid {
        &.ccb-box-with-heading-checkbox-and-description {
          label {
            padding: 10px 15px;
            flex-direction: column;
            align-items: flex-start;
            &:before {
              top: 0;
              right: unset;
              left: 0;
              position: relative;
            }
            &:after {
              top: 17px;
              left: 21px;
              right: unset;
            }
          }
        }
      }
    }
    .ccb-field-element-columns-3,
    .ccb-field-element-columns-4,
    .ccb-field-element-columns-5,
    .ccb-field-element-columns-6,
    .ccb-field-element-columns-7,
    .ccb-field-element-columns-8 {
      .ccb-checkbox-grid {
        &.ccb-box-with-heading-checkbox-and-description {
          label {
            padding: 8px 8px;
            flex-direction: column;
            align-items: flex-start;
            &:before {
              top: 0;
              right: unset;
              left: 0;
              position: relative;
            }
            &:after {
              top: 15px;
              left: 14px;
              right: unset;
            }
          }
        }
      }
    }
  }
  &.field-width-75 {
    .ccb-field-element-columns-1,
    .ccb-field-element-columns-2,
    .ccb-field-element-columns-3,
    .ccb-field-element-columns-4,
    .ccb-field-element-columns-5,
    .ccb-field-element-columns-6,
    .ccb-field-element-columns-7,
    .ccb-field-element-columns-8 {
      .ccb-checkbox-grid {
        gap: 10px;
        grid-template-columns: repeat(6, 1fr);
      }
      .ccb-default-checkbox {
        .ccb-checkbox-wrapper {
          flex-direction: row;
          align-items: flex-start;
          .ccb-toggle-item__postfix {
            .ccb-hint {
              margin-top: 4px;
              margin-left: 4px;
            }
          }
          label {
            flex-direction: row;
            padding-left: 25px;
            align-items: flex-start;
            min-height: 20px;
            line-height: 20px;
            .ccb-checkbox-label {
              font-size: var(--ccb-fields-button-size) !important;
            }
            &:before {
              position: absolute;
            }
            &:after {
              top: 7px;
            }
          }
        }
      }
      .ccb-box-checkbox {
        label {
          padding: 12px;
          .ccb-checkbox-label {
            font-size: var(--ccb-fields-button-size);
          }
        }
      }
      .ccb-box-with-checkbox {
        label {
          flex-direction: row;
          align-items: flex-start;
          padding: 15px 10px 15px 35px;
          .ccb-checkbox-label {
            font-size: var(--ccb-fields-button-size);
          }
          &:before {
            position: absolute;
            left: 10px;
          }
          &:after {
            top: unset;
            left: 16px;
          }
        }
      }
      .ccb-box-with-checkbox-and-description {
        label {
          flex-direction: row;
          align-items: flex-start;
          padding: 15px 10px 15px 35px;
          .ccb-checkbox-label {
            font-size: var(--ccb-fields-button-size);
          }
          &:before {
            left: 8px;
            top: 15px;
            position: absolute;
          }
          &:after {
            left: 14px;
          }
        }
      }
      .ccb-box-with-heading-checkbox-and-description {
        label {
          padding-right: 10px;
          padding-left: 10px;
          gap: 5px;
          flex-direction: row-reverse;
          align-items: flex-start;
          &:before {
            position: relative;
            top: 0;
            left: 0;
            right: auto;
          }
          &:after {
            top: 22px;
            right: 14px;
            left: unset;
          }
          .ccb-checkbox-label {
            .label {
              font-size: calc(var(--ccb-fields-button-size) + 2px);
            }
          }
        }
      }
    }
    .ccb-field-element-columns-1 {
      .ccb-checkbox-grid {
        gap: 10px;
        grid-template-columns: repeat(1, 1fr);
        &.ccb-box-with-heading-checkbox-and-description {
          label {
            flex-direction: row;
            &:before {
              position: absolute;
              top: 22px;
              right: 15px;
              left: unset;
            }
            &:after {
              top: 28px;
              left: unset;
              right: 20px;
            }
          }
        }
      }
    }
    .ccb-field-element-columns-2 {
      .ccb-checkbox-grid {
        gap: 10px;
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .ccb-field-element-columns-3 {
      .ccb-checkbox-grid {
        gap: 10px;
        grid-template-columns: repeat(3, 1fr);
        &.ccb-box-checkbox {
          label {
            padding-left: 6px;
            padding-right: 6px;
          }
        }
      }
    }
    .ccb-field-element-columns-4 {
      .ccb-checkbox-grid {
        gap: 10px;
        grid-template-columns: repeat(4, 1fr);
        &.ccb-default-checkbox {
          .ccb-checkbox-wrapper {
            label {
              flex-direction: column;
              padding-left: 0;
              align-items: flex-start;
              &:before {
                position: relative;
              }
              &:after {
                top: 7px;
              }
            }
          }
        }
        &.ccb-box-checkbox {
          label {
            padding-left: 6px;
            padding-right: 6px;
          }
        }
        &.ccb-box-with-checkbox {
          label {
            padding-left: 10px;
            padding-right: 10px;
            flex-direction: column;
            &:before {
              position: relative;
              left: 0;
            }
            &:after {
              top: 22px;
            }
          }
        }
        &.ccb-box-with-checkbox-and-description {
          label {
            padding: 10px;
            flex-direction: column;
            gap: 4px;
            &:before {
              position: relative;
              left: 0;
              top: 0;
            }
            &:after {
              top: 18px;
              left: 16px;
            }
          }
        }
        &.ccb-box-with-heading-checkbox-and-description {
          label {
            flex-direction: column;
            padding: 8px;
            &:after {
              top: 15px;
              left: 14px;
            }
          }
        }
      }
    }
    .ccb-field-element-columns-5 {
      .ccb-checkbox-grid {
        gap: 8px;
        grid-template-columns: repeat(5, 1fr);
        &.ccb-default-checkbox {
          .ccb-checkbox-wrapper {
            label {
              flex-direction: column;
              padding-left: 0;
              align-items: flex-start;
              &:before {
                position: relative;
              }
              &:after {
                top: 7px;
              }
            }
          }
        }
        &.ccb-box-checkbox {
          label {
            padding-left: 6px;
            padding-right: 6px;
          }
        }
        &.ccb-box-with-checkbox {
          label {
            padding-left: 10px;
            padding-right: 10px;
            flex-direction: column;
            &:before {
              position: relative;
              left: 0;
            }
            &:after {
              top: 22px;
            }
          }
        }
        &.ccb-box-with-checkbox-and-description {
          label {
            padding: 6px;
            flex-direction: column;
            gap: 4px;
            &:before {
              position: relative;
              left: 0;
              top: 0;
            }
            &:after {
              top: 14px;
              left: 12px;
            }
          }
        }
        &.ccb-box-with-heading-checkbox-and-description {
          label {
            flex-direction: column;
            padding: 8px;
            &:after {
              top: 15px;
              left: 14px;
            }
          }
        }
      }
    }
    .ccb-field-element-columns-6 {
      .ccb-checkbox-grid {
        gap: 6px;
        grid-template-columns: repeat(6, 1fr);
        &.ccb-default-checkbox {
          .ccb-checkbox-wrapper {
            label {
              flex-direction: column;
              padding-left: 0;
              align-items: flex-start;
              &:before {
                position: relative;
              }
              &:after {
                top: 7px;
              }
            }
          }
        }
        &.ccb-box-checkbox {
          label {
            padding-left: 6px;
            padding-right: 6px;
          }
        }
        &.ccb-box-with-checkbox {
          label {
            padding-left: 6px;
            padding-right: 6px;
            flex-direction: column;
            gap: 4px;
            &:before {
              position: relative;
              left: 0;
            }
            &:after {
              top: 22px;
              left: 12px;
            }
          }
        }
        &.ccb-box-with-checkbox-and-description {
          label {
            padding: 6px;
            flex-direction: column;
            gap: 4px;
            &:before {
              position: relative;
              left: 0;
              top: 0;
            }
            &:after {
              top: 14px;
              left: 12px;
            }
          }
        }
        &.ccb-box-with-heading-checkbox-and-description {
          label {
            flex-direction: column;
            padding: 6px;
            &:after {
              top: 13px;
              left: 12px;
            }
          }
        }
      }
    }
    .ccb-field-element-columns-7 {
      .ccb-checkbox-grid {
        gap: 6px;
        grid-template-columns: repeat(6, 1fr);
        &.ccb-default-checkbox {
          .ccb-checkbox-wrapper {
            label {
              flex-direction: column;
              padding-left: 0;
              align-items: flex-start;
              &:before {
                position: relative;
              }
              &:after {
                top: 7px;
              }
            }
          }
        }
        &.ccb-box-with-checkbox {
          label {
            padding-left: 6px;
            padding-right: 6px;
            flex-direction: column;
            gap: 4px;
            &:before {
              position: relative;
              left: 0;
            }
            &:after {
              top: 22px;
              left: 12px;
            }
          }
        }
        &.ccb-box-checkbox {
          label {
            padding-left: 6px;
            padding-right: 6px;
          }
        }
        &.ccb-box-with-checkbox-and-description {
          label {
            padding: 6px;
            flex-direction: column;
            gap: 4px;
            &:before {
              position: relative;
              left: 0;
              top: 0;
            }
            &:after {
              top: 14px;
              left: 12px;
            }
          }
        }
        &.ccb-box-with-heading-checkbox-and-description {
          label {
            flex-direction: column;
            padding: 6px;
            &:after {
              top: 13px;
              left: 12px;
            }
          }
        }
      }
    }
    .ccb-field-element-columns-8 {
      .ccb-checkbox-grid {
        gap: 6px;
        grid-template-columns: repeat(6, 1fr);
        &.ccb-default-checkbox {
          .ccb-checkbox-wrapper {
            label {
              flex-direction: column;
              padding-left: 0;
              align-items: flex-start;
              &:before {
                position: relative;
              }
              &:after {
                top: 7px;
              }
            }
          }
        }
        &.ccb-box-checkbox {
          label {
            padding-left: 6px;
            padding-right: 6px;
          }
        }
        &.ccb-box-with-checkbox {
          label {
            padding-left: 6px;
            padding-right: 6px;
            flex-direction: column;
            gap: 4px;
            &:before {
              position: relative;
              left: 0;
            }
            &:after {
              top: 22px;
              left: 12px;
            }
          }
        }
        &.ccb-box-with-checkbox-and-description {
          label {
            padding: 6px;
            flex-direction: column;
            gap: 4px;
            &:before {
              position: relative;
              left: 0;
              top: 0;
            }
            &:after {
              top: 14px;
              left: 12px;
            }
          }
        }
        &.ccb-box-with-heading-checkbox-and-description {
          label {
            flex-direction: column;
            padding: 6px;
            &:after {
              top: 13px;
              left: 12px;
            }
          }
        }
      }
    }
  }
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
  font-size: var(--ccb-fields-button-size);

  @media only screen and (max-width: 480px) {
    font-size: var(--ccb-mobile-fields-button-size);
  }
}
</style>
