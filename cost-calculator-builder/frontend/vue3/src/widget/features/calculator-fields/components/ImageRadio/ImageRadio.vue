<template>
  <div
    class="ccb-field ccb-radio-img-field"
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
        :key="getKey"
        :alias="field.alias"
        :options="field.options"
        :current="fieldValue"
        @update="selectValue"
        :repeter="field.repeaterIdx"
        :showValueInOption="field.showValueInOption"
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
import { ISingleOptionsField } from "@/widget/shared/types/fields";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import { useSingleOptionFieldShared } from "@/widget/actions/fields/composable/useSingleOptionFieldShared.ts";
import ProBadge from "@/widget/shared/ui/components/Pro-badge/ProBadge.vue";
import RequiredHint from "@/widget/shared/ui/components/Required-hint/RequiredHint.vue";

type Props = {
  field: ISingleOptionsField;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const appearanceStore = useAppearanceStore();

const { selectValue, fieldValue, isRequired, getKey, requiredWarningText } =
  useSingleOptionFieldShared(props);

const currentComponents = computed(() => {
  const style = field.value?.styles?.style || "default";
  if (style === "default") {
    return defineAsyncComponent(() => import("./styles/DefaultStyle.vue"));
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
  &.ccb-radio-img-field {
    @for $i from 1 through 8 {
      &.ccb-field-element-columns-#{$i} {
        .ccb-radio-img-grid {
          grid-template-columns: repeat($i, 1fr);
        }
        > * {
          width: 100%;
        }
      }
    }
    .ccb-radio-img-grid {
      display: grid;
      gap: 10px;
    }
    &.ccb-field-element-columns-4 {
      .ccb-default-radio-image {
        .ccb-radio-image__box {
          padding: 12px;
        }
      }
    }
    &.ccb-field-element-columns-5 {
      .ccb-default-radio-image {
        label {
          position: relative;
          right: unset;
          left: 8px;
          bottom: 6px;
        }
        .ccb-radio-image__box {
          padding: 10px;
        }
      }
    }
    &.ccb-field-element-columns-6 {
      .ccb-default-radio-image {
        label {
          position: relative;
          right: unset;
          left: 8px;
          bottom: 6px;
        }
        .ccb-radio-image__box {
          padding: 8px;
        }
      }
    }
    &.ccb-field-element-columns-7 {
      .ccb-default-image-radio-withicon {
        .ccb-radio-image__title-box {
          .ccb-radio-image__label {
            font-size: 12px !important;
          }
        }
        .ccb-radio-image {
          padding: 8px 5px;
        }
      }
      .ccb-default-radio-image {
        gap: 6px;
        .ccb-radio-image {
          width: auto;
        }
        label {
          position: relative;
          right: unset;
          left: 4px;
          bottom: 6px;
        }
        .ccb-radio-image__box {
          padding: 4px;
        }
        .ccb-radio-image__info {
          padding-left: 4px;
          padding-right: 4px;
          .ccb-radio-image__title-box {
            row-gap: 6px;
            .ccb-radio-image__label {
              font-size: 11px !important;
            }
            .ccb-radio-image__price {
              font-size: 10px;
            }
          }
        }
      }
    }
    &.ccb-field-element-columns-8 {
      .ccb-default-image-radio-withicon {
        .ccb-radio-image__title-box {
          .ccb-radio-image__label {
            font-size: 12px !important;
          }
        }
        .ccb-radio-image {
          padding: 6px 4px;
        }
      }
      .ccb-default-radio-image {
        gap: 4px;
        .ccb-radio-image {
          width: auto;
        }
        label {
          position: relative;
          right: unset;
          left: 3px;
          bottom: 6px;
        }
        .ccb-radio-image__box {
          padding: 3px;
        }
        .ccb-radio-image__info {
          padding-left: 3px;
          padding-right: 3px;
          .ccb-radio-image__title-box {
            row-gap: 4px;
            .ccb-radio-image__label {
              font-size: 10px !important;
            }
            .ccb-radio-image__price {
              font-size: 9px;
            }
          }
        }
      }
    }
  }
  &.field-width-25 {
    .ccb-field-element-columns-2,
    .ccb-field-element-columns-3,
    .ccb-field-element-columns-4,
    .ccb-field-element-columns-5,
    .ccb-field-element-columns-6,
    .ccb-field-element-columns-7,
    .ccb-field-element-columns-8 {
      .ccb-default-radio-image {
        gap: 6px;
        grid-template-columns: repeat(2, 1fr);
        .ccb-radio-image {
          width: 100%;
          .ccb-radio-image__box {
            padding: 4px;
          }
          .ccb-radio-image__info {
            padding: 5px 4px 10px 4px;
            .ccb-radio-image__title-box {
              row-gap: 6px;
              .ccb-radio-image__label {
                font-size: calc(var(--ccb-fields-button-size) - 3px) !important;
              }
              .ccb-radio-image__price {
                font-size: calc(var(--ccb-summary-text-size) - 4px) !important;
              }
            }
          }
          label {
            left: 4px;
          }
        }
      }
      .ccb-default-image-radio-withicon {
        gap: 4px;
        grid-template-columns: repeat(2, 1fr);
        .ccb-radio-image {
          padding: 6px 4px !important;
          .ccb-radio-image__info {
            .ccb-radio-image__title-box {
              .ccb-radio-image__label {
                font-size: calc(var(--ccb-fields-button-size) - 3px) !important;
              }
            }
          }
        }
      }
    }
    .ccb-default-radio-image {
      gap: 8px;
      .ccb-radio-image {
        max-width: 95%;
        .ccb-radio-image__box {
          padding: 8px;
        }
        .ccb-radio-image__info {
          width: unset;
          padding: 5px 8px 12px 8px;
          .ccb-radio-image__title-box {
            .ccb-radio-image__label,
            .ccb-radio-image__price {
              word-break: break-word;
            }
          }
        }
        label {
          position: relative;
          right: unset;
          left: 8px;
          bottom: 6px;
        }
      }
    }
  }
  &.field-width-50 {
    .ccb-field-element-columns-4,
    .ccb-field-element-columns-5,
    .ccb-field-element-columns-6,
    .ccb-field-element-columns-7,
    .ccb-field-element-columns-8 {
      .ccb-default-radio-image {
        gap: 6px;
        grid-template-columns: repeat(4, 1fr);
        .ccb-radio-image {
          width: 100%;
          .ccb-radio-image__box {
            padding: 4px;
          }
          .ccb-radio-image__info {
            padding: 5px 4px 10px 4px;
            .ccb-radio-image__title-box {
              row-gap: 6px;
              .ccb-radio-image__label {
                font-size: calc(var(--ccb-fields-button-size) - 3px) !important;
              }
              .ccb-radio-image__price {
                font-size: calc(var(--ccb-summary-text-size) - 4px) !important;
              }
            }
          }
          label {
            left: 4px;
          }
        }
      }
      .ccb-default-image-radio-withicon {
        gap: 4px;
        grid-template-columns: repeat(4, 1fr);
        .ccb-radio-image {
          padding: 6px 4px !important;
          .ccb-radio-image__info {
            .ccb-radio-image__title-box {
              .ccb-radio-image__label {
                font-size: calc(var(--ccb-fields-button-size) - 3px) !important;
              }
            }
          }
        }
      }
    }
    .ccb-radio-img-field {
      &.ccb-field-element-columns-1 {
        .ccb-default-radio-image {
          .ccb-radio-image {
            max-width: 98%;
            label {
              position: absolute;
              right: 0;
              left: unset;
              bottom: 12px;
            }
          }
        }
      }
    }
    .ccb-default-radio-image {
      gap: 8px;
      .ccb-radio-image {
        max-width: 95%;
        .ccb-radio-image__box {
          padding: 8px;
          max-height: fit-content;
        }
        .ccb-radio-image__info {
          width: unset;
          padding: 5px 8px 12px 8px;
          .ccb-radio-image__title-box {
            .ccb-radio-image__label,
            .ccb-radio-image__price {
              word-break: break-word;
            }
          }
        }
        label {
          position: relative;
          right: unset;
          left: 8px;
          bottom: 6px;
        }
      }
    }
  }
  &.field-width-75 {
    .ccb-field-element-columns-6,
    .ccb-field-element-columns-7,
    .ccb-field-element-columns-8 {
      .ccb-default-radio-image {
        gap: 6px;
        grid-template-columns: repeat(6, 1fr);
        .ccb-radio-image {
          width: 100%;
          .ccb-radio-image__box {
            padding: 4px;
          }
          .ccb-radio-image__info {
            padding: 5px 4px 10px 4px;
            .ccb-radio-image__title-box {
              row-gap: 6px;
              .ccb-radio-image__label {
                font-size: calc(var(--ccb-fields-button-size) - 3px) !important;
              }
              .ccb-radio-image__price {
                font-size: calc(var(--ccb-summary-text-size) - 4px) !important;
              }
            }
          }
          label {
            left: 4px;
          }
        }
      }
      .ccb-default-image-radio-withicon {
        gap: 4px;
        grid-template-columns: repeat(6, 1fr);
        .ccb-radio-image {
          padding: 6px 4px !important;
          .ccb-radio-image__info {
            .ccb-radio-image__title-box {
              .ccb-radio-image__label {
                font-size: calc(var(--ccb-fields-button-size) - 3px) !important;
              }
            }
          }
        }
      }
    }
    .ccb-radio-img-field {
      &.ccb-field-element-columns-1,
      &.ccb-field-element-columns-2 {
        .ccb-default-radio-image {
          .ccb-radio-image {
            max-width: 98%;
            label {
              position: absolute;
              right: 0;
              left: unset;
              bottom: 12px;
            }
          }
        }
      }
      &.ccb-field-element-columns-5 {
        .ccb-default-image-radio-withicon {
          gap: 6px;
          .ccb-radio-image {
            padding: 8px 4px !important;
          }
        }
      }
    }
    .ccb-default-radio-image {
      gap: 8px;
      .ccb-radio-image {
        max-width: 95%;
        .ccb-radio-image__box {
          padding: 8px;
        }
        .ccb-radio-image__info {
          width: unset;
          padding: 5px 8px 12px 8px;
          .ccb-radio-image__title-box {
            .ccb-radio-image__label,
            .ccb-radio-image__price {
              word-break: break-word;
            }
          }
        }
        label {
          position: relative;
          right: unset;
          left: 8px;
          bottom: 6px;
        }
      }
    }
  }
  @media (min-width: 1025px) {
    &.field-width-25 {
      .ccb-radio-img-field {
        .ccb-default-image-radio-withicon {
          .ccb-radio-image {
            padding: 8px 10px;
            .ccb-radio-image__info {
              width: 100%;
            }
            .ccb-radio-image__box {
              padding: 0;
              img {
                width: 30px;
                height: 30px;
              }
            }
          }
        }
        .ccb-radio-image__box {
          padding: 10px;
        }
        .ccb-radio-image {
          width: 100%;
        }
        .ccb-radio-image__info {
          width: 75%;
        }
        .ccb-radio-image__title-box {
          .ccb-radio-image__label {
            font-size: calc(var(--ccb-fields-button-size) - 2px) !important;
          }
          .ccb-radio-image__price {
            font-size: calc(var(--ccb-summary-text-size) - 2px) !important;
          }
        }
      }
    }
  }
}
.ccb-radio-image__label {
  font-size: var(--ccb-fields-button-size) !important;

  @media only screen and (max-width: 480px) {
    font-size: var(--ccb-mobile-fields-button-size) !important;
  }
}
</style>
