<template>
  <div
    class="ccb-field ccb-image-checkbox-field"
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
        }}<span v-if="field.required" class="ccb-field-required-mark">*</span
        ><ProBadge />
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
      ></component>
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
import ProBadge from "@/widget/shared/ui/components/Pro-badge/ProBadge.vue";
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
    return defineAsyncComponent(() => import("./styles/Default.vue"));
  } else if (style === "with-icon") {
    return defineAsyncComponent(() => import("./styles/WithIcon.vue"));
  }

  return "";
});

const additionalClasses = computed(() => {
  return field.value?.additionalStyles || "";
});
</script>

<style lang="scss">
.ccb-field {
  &.ccb-image-checkbox-field {
    .ccb-default-image-checkbox-withicon {
      .ccb-checkbox-image__item {
        position: absolute;
      }
    }
    @for $i from 1 through 8 {
      &.ccb-field-element-columns-#{$i} {
        .ccb-image-checkbox-grid {
          grid-template-columns: repeat($i, 1fr);
        }
        > * {
          width: 100%;
        }
      }
    }
    &.ccb-field-element-columns-3 {
      .ccb-default-checkbox-image {
        .ccb-checkbox-image {
          .ccb-checkbox-image__box {
            padding: 12px;
          }
        }
      }
    }
    &.ccb-field-element-columns-4 {
      .ccb-default-checkbox-image {
        .ccb-checkbox-image {
          .ccb-checkbox-image__box {
            padding: 10px;
          }
        }
      }
    }
    &.ccb-field-element-columns-5 {
      .ccb-default-checkbox-image {
        gap: 6px;
        .ccb-checkbox-image {
          &:before {
            bottom: 8px;
            right: unset;
            left: 8px;
          }
          &:after {
            bottom: 16px;
            right: unset;
            left: 14px;
          }
          .ccb-checkbox-image__box {
            padding: 8px;
          }
          .ccb-checkbox-image__info {
            padding-left: 8px;
            padding-right: 8px;
            padding-bottom: 16px;
          }
          .ccb-checkbox-image__item {
            position: relative;
            right: unset;
            left: 8px;
            bottom: 8px;
          }
        }
      }
      .ccb-default-image-checkbox-withicon {
        gap: 8px;
        label {
          padding: 10px;
        }
      }
    }
    &.ccb-field-element-columns-6 {
      .ccb-default-checkbox-image {
        gap: 6px;
        .ccb-checkbox-image {
          &:before {
            bottom: 8px;
            right: unset;
            left: 8px;
          }
          &:after {
            bottom: 16px;
            right: unset;
            left: 14px;
          }
          .ccb-checkbox-image__box {
            padding: 8px;
          }
          .ccb-checkbox-image__info {
            padding-left: 8px;
            padding-right: 8px;
            padding-bottom: 16px;
            .ccb-checkbox-image__title-box {
              .ccb-checkbox-image__label {
                font-size: calc(var(--ccb-fields-button-size) - 2px) !important;
              }
            }
          }
          .ccb-checkbox-image__item {
            position: relative;
            right: unset;
            left: 8px;
            bottom: 8px;
          }
        }
      }
      .ccb-default-image-checkbox-withicon {
        gap: 6px;
        label {
          padding: 10px 8px;
        }
      }
    }
    &.ccb-field-element-columns-7 {
      .ccb-default-checkbox-image {
        gap: 4px;
        .ccb-checkbox-image {
          &:before {
            bottom: 8px;
            right: unset;
            left: 4px;
          }
          &:after {
            bottom: 16px;
            right: unset;
            left: 10px;
          }
          .ccb-checkbox-image__box {
            padding: 4px;
          }
          .ccb-checkbox-image__info {
            padding-left: 4px;
            padding-right: 4px;
            padding-bottom: 16px;
            .ccb-checkbox-image__title-box {
              .ccb-checkbox-image__label {
                font-size: calc(var(--ccb-fields-button-size) - 2px) !important;
              }
              .ccb-checkbox-image__price {
                font-size: calc(var(--ccb-summary-text-size) - 4px);
              }
            }
          }
          .ccb-checkbox-image__item {
            position: relative;
            right: unset;
            left: 8px;
            bottom: 8px;
          }
        }
      }
      .ccb-default-image-checkbox-withicon {
        gap: 6px;
        label {
          padding: 10px 8px;
          .ccb-checkbox-image__info {
            .ccb-checkbox-image__title-box {
              .ccb-checkbox-image__label {
                font-size: calc(var(--ccb-fields-button-size) - 2px) !important;
              }
            }
          }
        }
      }
    }
    &.ccb-field-element-columns-8 {
      .ccb-default-checkbox-image {
        gap: 4px;
        .ccb-checkbox-image {
          &:before {
            bottom: 8px;
            right: unset;
            left: 4px;
          }
          &:after {
            bottom: 16px;
            right: unset;
            left: 10px;
          }
          .ccb-checkbox-image__box {
            padding: 4px;
          }
          .ccb-checkbox-image__info {
            padding-left: 4px;
            padding-right: 4px;
            padding-bottom: 16px;
            .ccb-checkbox-image__title-box {
              .ccb-checkbox-image__label {
                font-size: calc(var(--ccb-fields-button-size) - 2px) !important;
              }
              .ccb-checkbox-image__price {
                font-size: calc(var(--ccb-summary-text-size) - 4px);
              }
            }
          }
          .ccb-checkbox-image__item {
            position: relative;
            right: unset;
            left: 8px;
            bottom: 8px;
          }
        }
      }
      .ccb-default-image-checkbox-withicon {
        gap: 6px;
        label {
          padding: 10px 6px;
          .ccb-checkbox-image__info {
            .ccb-checkbox-image__title-box {
              .ccb-checkbox-image__label {
                font-size: calc(var(--ccb-fields-button-size) - 3px) !important;
              }
            }
          }
        }
      }
    }
    .ccb-image-checkbox-grid {
      display: grid;
      gap: 10px;
    }
  }
  &.field-width-25 {
    .ccb-image-checkbox-field {
      &.ccb-field-element-columns-2,
      &.ccb-field-element-columns-3,
      &.ccb-field-element-columns-4,
      &.ccb-field-element-columns-5,
      &.ccb-field-element-columns-6,
      &.ccb-field-element-columns-7,
      &.ccb-field-element-columns-8 {
        .ccb-default-checkbox-image {
          gap: 4px;
          grid-template-columns: repeat(2, 1fr);
          .ccb-checkbox-image__item {
            position: absolute;
          }
          .ccb-checkbox-image {
            &:before {
              left: 4px;
            }
            &:after {
              left: 10px;
            }
            .ccb-checkbox-image__box,
            .ccb-checkbox-image__info {
              padding: 4px;
            }
            .ccb-checkbox-image__info {
              padding-bottom: 12px;
            }
            .ccb-checkbox-image__info {
              .ccb-checkbox-image__title-box {
                gap: 6px;
                .ccb-checkbox-image__label {
                  font-size: calc(
                    var(--ccb-fields-button-size) - 3px
                  ) !important;
                }
                .ccb-checkbox-image__price {
                  font-size: calc(
                    var(--ccb-summary-text-size) - 4px
                  ) !important;
                }
              }
            }
          }
        }
        .ccb-default-image-checkbox-withicon {
          gap: 4px;
          grid-template-columns: repeat(2, 1fr);
          .ccb-checkbox-image {
            padding: 6px 4px;
            .ccb-checkbox-image__info {
              .ccb-checkbox-image__title-box {
                .ccb-checkbox-image__label {
                  font-size: calc(
                    var(--ccb-fields-button-size) - 3px
                  ) !important;
                }
              }
            }
          }
        }
      }
      .ccb-default-checkbox-image {
        label.ccb-checkbox-image {
          .ccb-checkbox-image__info {
            width: unset;
            .ccb-checkbox-image__title-box {
              .ccb-checkbox-image__label,
              .ccb-checkbox-image__price {
                word-break: break-word;
              }
            }
          }
          &:before {
            position: relative;
            bottom: 4px;
            left: 8px;
            top: unset;
            order: 4;
          }
          &:after {
            bottom: 12px;
            left: 14px;
            right: unset;
            z-index: 1;
          }
        }
      }
    }
  }
  &.field-width-50 {
    .ccb-image-checkbox-field {
      &.ccb-field-element-columns-1 {
        .ccb-default-checkbox-image {
          .ccb-checkbox-image {
            &:before {
              position: absolute;
              bottom: 10px;
              right: 10px;
              left: unset;
            }
            &:after {
              bottom: 18px;
              right: 14px;
              left: unset;
            }
          }
        }
      }
      &.ccb-field-element-columns-2 {
        .ccb-default-checkbox-image {
          .ccb-checkbox-image {
            .ccb-checkbox-image__box {
              padding: 8px;
            }
            .ccb-checkbox-image__info {
              padding-left: 8px;
              padding-right: 8px;
            }
          }
        }
      }
      &.ccb-field-element-columns-3 {
        .ccb-default-checkbox-image {
          gap: 6px;
          .ccb-checkbox-image {
            &:before {
              left: 6px;
            }
            &:after {
              left: 12px;
            }
            .ccb-checkbox-image__box {
              padding: 6px;
            }
            .ccb-checkbox-image__info {
              padding: 6px 6px 12px 6px;
            }
            .ccb-checkbox-image__item {
              position: absolute;
            }
          }
        }
        .ccb-default-image-checkbox-withicon {
          gap: 6px;
          .ccb-checkbox-image {
            padding: 6px;
            .ccb-checkbox-image__info {
              .ccb-checkbox-image__title-box {
                .ccb-checkbox-image__label {
                  font-size: calc(
                    var(--ccb-fields-button-size) - 2px
                  ) !important;
                }
              }
            }
          }
        }
      }
      &.ccb-field-element-columns-4,
      &.ccb-field-element-columns-5,
      &.ccb-field-element-columns-6,
      &.ccb-field-element-columns-7,
      &.ccb-field-element-columns-8 {
        .ccb-default-checkbox-image {
          gap: 4px;
          grid-template-columns: repeat(4, 1fr);
          .ccb-checkbox-image__item {
            position: absolute;
          }
          .ccb-checkbox-image {
            &:before {
              left: 4px;
            }
            &:after {
              left: 10px;
            }
            .ccb-checkbox-image__box,
            .ccb-checkbox-image__info {
              padding: 4px;
            }
            .ccb-checkbox-image__info {
              padding-bottom: 12px;
            }
            .ccb-checkbox-image__info {
              .ccb-checkbox-image__title-box {
                gap: 6px;
                .ccb-checkbox-image__label {
                  font-size: calc(
                    var(--ccb-fields-button-size) - 3px
                  ) !important;
                }
                .ccb-checkbox-image__price {
                  font-size: calc(
                    var(--ccb-summary-text-size) - 4px
                  ) !important;
                }
              }
            }
          }
        }
        .ccb-default-image-checkbox-withicon {
          gap: 4px;
          grid-template-columns: repeat(4, 1fr);
          .ccb-checkbox-image {
            padding: 6px 4px;
            .ccb-checkbox-image__info {
              .ccb-checkbox-image__title-box {
                .ccb-checkbox-image__label {
                  font-size: calc(
                    var(--ccb-fields-button-size) - 3px
                  ) !important;
                }
              }
            }
          }
        }
      }
      .ccb-default-checkbox-image {
        label.ccb-checkbox-image {
          .ccb-checkbox-image__info {
            width: unset;
            .ccb-checkbox-image__title-box {
              .ccb-checkbox-image__label,
              .ccb-checkbox-image__price {
                word-break: break-word;
              }
            }
          }
          &:before {
            position: relative;
            bottom: 6px;
            left: 8px;
            top: unset;
            order: 4;
          }
          &:after {
            bottom: 14px;
            left: 14px;
            right: unset;
            z-index: 1;
          }
        }
      }
    }
  }
  &.field-width-75 {
    .ccb-image-checkbox-field {
      &.ccb-field-element-columns-3,
      &.ccb-field-element-columns-4,
      &.ccb-field-element-columns-5 {
        .ccb-default-checkbox-image {
          gap: 6px;
          .ccb-checkbox-image {
            &:before {
              left: 6px !important;
            }
            &:after {
              left: 12px !important;
            }
            .ccb-checkbox-image__box {
              padding: 6px;
            }
            .ccb-checkbox-image__info {
              padding: 6px 6px 12px 6px;
            }
            .ccb-checkbox-image__item {
              position: absolute;
            }
          }
        }
        .ccb-default-image-checkbox-withicon {
          gap: 6px;
          .ccb-checkbox-image {
            padding: 6px;
            .ccb-checkbox-image__info {
              .ccb-checkbox-image__title-box {
                .ccb-checkbox-image__label {
                  font-size: calc(
                    var(--ccb-fields-button-size) - 1px
                  ) !important;
                }
              }
            }
          }
        }
      }
      &.ccb-field-element-columns-6,
      &.ccb-field-element-columns-7,
      &.ccb-field-element-columns-8 {
        .ccb-default-checkbox-image {
          gap: 4px;
          grid-template-columns: repeat(6, 1fr);
          .ccb-checkbox-image__item {
            position: absolute;
          }
          .ccb-checkbox-image {
            &:before {
              left: 4px !important;
            }
            &:after {
              left: 10px !important;
            }
            .ccb-checkbox-image__box,
            .ccb-checkbox-image__info {
              padding: 4px;
            }
            .ccb-checkbox-image__info {
              padding-bottom: 12px;
            }
            .ccb-checkbox-image__info {
              .ccb-checkbox-image__title-box {
                gap: 6px;
                .ccb-checkbox-image__label {
                  font-size: calc(
                    var(--ccb-fields-button-size) - 3px
                  ) !important;
                }
                .ccb-checkbox-image__price {
                  font-size: calc(
                    var(--ccb-summary-text-size) - 4px
                  ) !important;
                }
              }
            }
          }
        }
        .ccb-default-image-checkbox-withicon {
          gap: 4px;
          grid-template-columns: repeat(6, 1fr);
          .ccb-checkbox-image {
            padding: 6px 4px;
            .ccb-checkbox-image__info {
              .ccb-checkbox-image__title-box {
                .ccb-checkbox-image__label {
                  font-size: calc(
                    var(--ccb-fields-button-size) - 3px
                  ) !important;
                }
              }
            }
          }
        }
      }
      &:not(.ccb-field-element-columns-1) {
        .ccb-default-checkbox-image {
          label.ccb-checkbox-image {
            .ccb-checkbox-image__info {
              width: unset;
              .ccb-checkbox-image__title-box {
                .ccb-checkbox-image__label,
                .ccb-checkbox-image__price {
                  word-break: break-word;
                }
              }
            }
            &:before {
              position: relative;
              bottom: 4px;
              left: 8px;
              top: unset;
              order: 4;
            }
            &:after {
              bottom: 12px;
              left: 14px;
              right: unset;
              z-index: 1;
            }
          }
        }
      }
    }
  }
  @media (min-width: 1025px) {
    &.field-width-25 {
      .ccb-image-checkbox-field {
        .ccb-default-image-checkbox-withicon {
          .ccb-checkbox-image {
            padding: 8px 12px;
          }
          .ccb-checkbox-image__title-box {
            .ccb-checkbox-image__label {
              font-size: calc(var(--ccb-fields-button-size) - 2px) !important;
            }
          }
        }
        &.ccb-horizontal-checkbox {
          .ccb-checkbox-image {
            width: 100%;
          }
        }
        .ccb-default-checkbox-image {
          .ccb-checkbox-image {
            min-height: unset;
            &:before {
              bottom: 5px;
              right: 5px;
            }
            &:after {
              bottom: 13px;
              right: 10px;
            }
          }
          .ccb-checkbox-image__box {
            padding: 8px;
          }
          .ccb-checkbox-image__info {
            padding: 5px 8px;
            width: 75%;
            .ccb-checkbox-image__label {
              font-size: calc(var(--ccb-fields-button-size) - 2px) !important;
            }
            .ccb-checkbox-image__price {
              font-size: calc(var(--ccb-summary-text-size) - 2px) !important;
            }
          }
        }
      }
    }
  }
}
.ccb-checkbox-image__label {
  font-size: var(--ccb-fields-button-size) !important;

  @media only screen and (max-width: 480px) {
    font-size: var(--ccb-mobile-fields-button-size) !important;
  }
}
</style>
