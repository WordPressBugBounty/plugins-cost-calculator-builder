<template>
  <div
    class="ccb-field ccb-toggle-field"
    :class="{
      required: isRequired,
      'ccb-field-disabled': field.disabled,
      [`ccb-field-element-columns-${field.styles?.elementColumns}`]:
        field.styles?.elementColumns,
      [additionalClasses]: true,
    }"
  >
    <div class="ccb-field__label">
      <RequiredHint v-if="isRequired" :text="requiredWarningText" />
      <div class="ccb-field__title">
        {{ field.label
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
import { IMultiOptionsField } from "@/widget/shared/types/fields";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import { useMultiOptionsFieldShared } from "@/widget/actions/fields/composable/useMultiOptionsFieldShared.ts";
import RequiredHint from "@/widget/shared/ui/components/Required-hint/RequiredHint.vue";

type Props = {
  field: IMultiOptionsField;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const appearanceStore = useAppearanceStore();

const { applyChanges, isRequired, fieldValue, requiredWarningText } =
  useMultiOptionsFieldShared(props);

const currentComponents = computed(() => {
  const style = field.value?.styles?.style || "default";
  if (style === "default") {
    return defineAsyncComponent(
      () =>
        import(
          "@/widget/features/calculator-fields/components/Toggle/styles/Default.vue"
        ),
    );
  } else if (style === "box-with-toggle-and-description") {
    return defineAsyncComponent(
      () => import("./styles/BoxToggleWithDescription.vue"),
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
  &.ccb-toggle-field {
    @for $i from 1 through 8 {
      &.ccb-field-element-columns-#{$i} {
        .ccb-toggle-grid {
          grid-template-columns: repeat($i, 1fr);
        }
        > * {
          width: 100%;
        }
      }
    }
    .ccb-toggle-grid {
      display: grid;
      gap: 10px;
    }
  }
  &.field-width-25 {
    .ccb-default-toggle {
      align-items: flex-start;
      gap: 4px;
      .ccb-toggle-item {
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 6px;
        .ccb-toggle-item__label-wrap {
          .ccb-toggle-item__label {
            word-break: break-all;
          }
        }
        .ccb-hint {
          margin-left: 0;
        }
        .ccb-toggle-wrapper {
          margin-left: 0;
          flex-basis: 100%;
        }
      }
    }
    .ccb-field-element-columns-1 {
      .ccb-box-toggle {
        .ccb-toggle-item {
          padding: 10px;
        }
      }
    }
    .ccb-field-element-columns-1,
    .ccb-field-element-columns-2 {
      .ccb-box-toggle {
        gap: 6px;
        .ccb-toggle-item {
          padding: 8px;
          flex-direction: column;
          align-items: flex-start;
          row-gap: 6px;
        }
      }
    }
    .ccb-field-element-columns-2 {
      .ccb-box-toggle {
        .ccb-toggle-item {
          .ccb-toggle-wrapper {
            margin-right: 0;
          }
          .ccb-toggle-item__label-wrap {
            .ccb-toggle-item__label {
              font-size: calc(var(--ccb-fields-button-size) - 2px);
            }
            .ccb-toggle-item__description {
              font-size: calc(var(--ccb-field-size) - 2px);
            }
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
      .ccb-default-toggle {
        grid-template-columns: repeat(2, 1fr);
        gap: 4px;
        .ccb-toggle-item {
          gap: 6px;
          .ccb-toggle-item__label-wrap {
            .ccb-toggle-item__label,
            .ccb-toggle-item__description {
              font-size: calc(var(--ccb-fields-button-size) - 1px);
            }
          }
          .ccb-toggle-wrapper {
            margin-left: 0;
            label {
              width: 40px;
            }
            input:checked + label:after {
              left: 19px;
            }
          }
        }
      }
      .ccb-box-toggle {
        grid-template-columns: repeat(2, 1fr);
        gap: 2px;
        .ccb-toggle-item {
          padding: 6px 2px !important;
          flex-direction: column;
          align-items: flex-start;
          row-gap: 6px !important;
          .ccb-toggle-item__label-wrap {
            .ccb-toggle-item__label,
            .ccb-toggle-item__description {
              font-size: calc(var(--ccb-fields-button-size) - 3px) !important;
            }
          }
          .ccb-toggle-wrapper {
            label {
              width: 36px;
            }
            input:checked + label:after {
              left: 15px;
            }
          }
        }
      }
    }
  }
  &.field-width-50 {
    .ccb-default-toggle {
      align-items: flex-start;
      .ccb-toggle-item {
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 6px;
        .ccb-toggle-item__label-wrap {
          .ccb-toggle-item__label {
            word-break: break-all;
          }
        }
        .ccb-hint {
          margin-left: 0;
        }
        .ccb-toggle-wrapper {
          margin-left: 0;
          flex-basis: 100%;
        }
      }
    }
    .ccb-field-element-columns-1 {
      .ccb-box-toggle {
        .ccb-toggle-item {
          padding: 10px;
        }
      }
    }
    .ccb-field-element-columns-2,
    .ccb-field-element-columns-3 {
      .ccb-box-toggle {
        gap: 6px;
        .ccb-toggle-item {
          padding: 8px;
          flex-direction: column;
          align-items: flex-start;
          row-gap: 6px;
        }
      }
    }
    .ccb-field-element-columns-3 {
      .ccb-box-toggle {
        .ccb-toggle-item {
          .ccb-toggle-wrapper {
            margin-right: 0;
          }
          .ccb-toggle-item__label-wrap {
            .ccb-toggle-item__label {
              font-size: calc(var(--ccb-fields-button-size) - 2px);
            }
            .ccb-toggle-item__description {
              font-size: calc(var(--ccb-field-size) - 2px);
            }
          }
        }
      }
    }
    .ccb-field-element-columns-4,
    .ccb-field-element-columns-5,
    .ccb-field-element-columns-6,
    .ccb-field-element-columns-7,
    .ccb-field-element-columns-8 {
      .ccb-default-toggle {
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
        .ccb-toggle-item {
          gap: 6px;
          .ccb-toggle-item__label-wrap {
            .ccb-toggle-item__label,
            .ccb-toggle-item__description {
              font-size: calc(var(--ccb-fields-button-size) - 1px);
            }
          }
          .ccb-toggle-wrapper {
            margin-left: 0;
            label {
              width: 44px;
            }
            input:checked + label:after {
              left: 23px;
            }
          }
        }
      }
      .ccb-box-toggle {
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
        .ccb-toggle-item {
          padding: 6px 3px;
          flex-direction: column;
          align-items: flex-start;
          row-gap: 6px;
          .ccb-toggle-item__label-wrap {
            .ccb-toggle-item__label,
            .ccb-toggle-item__description {
              font-size: calc(var(--ccb-fields-button-size) - 3px);
            }
          }
          .ccb-toggle-wrapper {
            label {
              width: 36px;
            }
            input:checked + label:after {
              left: 15px;
            }
          }
        }
      }
    }
  }

  &.field-width-75 {
    .ccb-default-toggle {
      align-items: flex-start;
      .ccb-toggle-item {
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 6px;
        .ccb-toggle-item__label-wrap {
          .ccb-toggle-item__label {
            word-break: break-all;
          }
        }
        .ccb-hint {
          margin-left: 0;
        }
        .ccb-toggle-wrapper {
          margin-left: 0;
          flex-basis: 100%;
        }
      }
    }
    .ccb-field-element-columns-2 {
      .ccb-box-toggle {
        .ccb-toggle-item {
          padding: 10px;
        }
      }
    }
    .ccb-field-element-columns-3,
    .ccb-field-element-columns-4 {
      .ccb-box-toggle {
        .ccb-toggle-item {
          padding: 10px;
          flex-direction: column;
          align-items: flex-start;
          row-gap: 6px;
        }
      }
    }
    .ccb-field-element-columns-5 {
      .ccb-box-toggle {
        gap: 6px;
        .ccb-toggle-item {
          padding: 6px;
          flex-direction: column;
          align-items: flex-start;
          row-gap: 6px;
          .ccb-toggle-wrapper {
            label {
              width: 40px;
            }
            input:checked + label:after {
              left: 18px;
            }
          }
        }
      }
    }
    .ccb-field-element-columns-6,
    .ccb-field-element-columns-7,
    .ccb-field-element-columns-8 {
      .ccb-default-toggle {
        grid-template-columns: repeat(6, 1fr);
        gap: 4px;
      }
      .ccb-box-toggle {
        grid-template-columns: repeat(6, 1fr);
        gap: 4px;
        .ccb-toggle-item {
          padding: 6px 4px;
          flex-direction: column;
          align-items: flex-start;
          row-gap: 6px;
          .ccb-toggle-item__label-wrap {
            .ccb-toggle-item__label,
            .ccb-toggle-item__description {
              font-size: calc(var(--ccb-fields-button-size) - 2px);
            }
          }
          .ccb-toggle-wrapper {
            label {
              width: 36px;
            }
            input:checked + label:after {
              left: 15px;
            }
          }
        }
      }
    }
  }
  &.ccb-field-element-columns-3 {
    .ccb-box-toggle {
      .ccb-toggle-item {
        padding: 15px 10px;
      }
    }
  }
  &.ccb-field-element-columns-4 {
    .ccb-default-toggle {
      gap: 8px;
      .ccb-toggle-item {
        .ccb-toggle-item__label-wrap {
          .ccb-toggle-item__label {
            font-size: calc(var(--ccb-fields-button-size) - 1px);
          }
        }
        .ccb-toggle-wrapper {
          margin-left: 6px;
        }
      }
    }
    .ccb-box-toggle {
      gap: 8px;
      .ccb-toggle-item {
        padding: 15px 10px;
        flex-direction: column;
        align-items: flex-start;
        row-gap: 6px;
        .ccb-toggle-wrapper {
          margin-right: 0;
        }
      }
    }
  }
  &.ccb-field-element-columns-5 {
    .ccb-default-toggle {
      gap: 8px;
      .ccb-toggle-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        .ccb-toggle-item__label-wrap {
          .ccb-toggle-item__label {
            font-size: calc(var(--ccb-fields-button-size) - 2px);
          }
        }
        .ccb-toggle-wrapper {
          margin-left: 0;
        }
      }
    }
    .ccb-box-toggle {
      gap: 8px;
      .ccb-toggle-item {
        padding: 15px 10px;
        flex-direction: column;
        align-items: flex-start;
        row-gap: 6px;
        .ccb-toggle-wrapper {
          margin-right: 0;
        }
      }
    }
  }
  &.ccb-field-element-columns-6 {
    .ccb-default-toggle {
      .ccb-toggle-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        .ccb-toggle-item__label-wrap {
          .ccb-toggle-item__label {
            font-size: calc(var(--ccb-fields-button-size) - 2px);
          }
        }
        .ccb-toggle-wrapper {
          margin-left: 0;
        }
      }
    }
    .ccb-box-toggle {
      gap: 6px;
      .ccb-toggle-item {
        padding: 12px 6px;
        flex-direction: column;
        align-items: flex-start;
        row-gap: 6px;
        .ccb-toggle-wrapper {
          margin-right: 0;
        }
      }
    }
  }
  &.ccb-field-element-columns-7 {
    .ccb-default-toggle {
      column-gap: 6px;
      row-gap: 10px;
      .ccb-toggle-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        .ccb-toggle-item__label-wrap {
          .ccb-toggle-item__label {
            font-size: calc(var(--ccb-fields-button-size) - 2px);
          }
        }
        .ccb-toggle-wrapper {
          margin-left: 0;
        }
      }
    }
    .ccb-box-toggle {
      gap: 4px;
      .ccb-toggle-item {
        padding: 12px 4px;
        flex-direction: column;
        align-items: flex-start;
        row-gap: 6px;
        .ccb-toggle-wrapper {
          margin-right: 0;
          input:checked + label:after {
            left: 19px;
          }
          label {
            width: 40px;
          }
        }
      }
    }
  }
  &.ccb-field-element-columns-8 {
    .ccb-default-toggle {
      column-gap: 4px;
      row-gap: 10px;
      .ccb-toggle-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        .ccb-toggle-item__label-wrap {
          .ccb-toggle-item__label {
            font-size: calc(var(--ccb-fields-button-size) - 2px);
          }
        }
        .ccb-toggle-wrapper {
          margin-left: 0;
        }
      }
    }
    .ccb-box-toggle {
      gap: 4px;
      .ccb-toggle-item {
        padding: 12px 4px;
        flex-direction: column;
        align-items: flex-start;
        row-gap: 6px;
        .ccb-toggle-wrapper {
          margin-right: 0;
          input:checked + label:after {
            left: 15px;
          }
          label {
            width: 36px;
          }
        }
        .ccb-toggle-item__label-wrap {
          .ccb-toggle-item__label,
          .ccb-toggle-item__description {
            font-size: calc(var(--ccb-fields-button-size) - 3px);
          }
        }
      }
    }
  }
  @media (min-width: 1025px) {
    &.field-width-25 {
      .ccb-toggle-field {
        .ccb-toggle-item__label {
          font-size: calc(var(--ccb-fields-button-size) - 2px) !important;
        }
        .ccb-toggle-item__description {
          font-size: calc(var(--ccb-field-size) - 3px) !important;
        }
        .ccb-box-toggle {
          .ccb-toggle-item {
            flex-wrap: wrap;
            padding: 10px;
            gap: 10px;
          }
        }
        .ccb-default-toggle {
          .ccb-toggle-item {
            flex-wrap: wrap;
            .ccb-toggle-wrapper {
              margin-left: 0;
            }
          }
        }
      }
    }
    &.field-width-100 {
      .ccb-toggle-field {
        &.ccb-field-element-columns-4 {
          .ccb-default-toggle {
            .ccb-toggle-item {
              flex-wrap: wrap;
              gap: 6px;
              .ccb-hint {
                margin-left: 0;
              }
              .ccb-toggle-wrapper {
                margin-left: 0;
              }
            }
          }
        }
      }
    }
  }
}
.ccb-toggle-item__label {
  font-size: var(--ccb-fields-button-size);

  @media only screen and (max-width: 480px) {
    font-size: var(--ccb-mobile-fields-button-size) !important;
  }
}
</style>
