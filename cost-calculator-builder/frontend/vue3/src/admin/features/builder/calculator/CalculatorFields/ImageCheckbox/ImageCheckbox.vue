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
      <div class="ccb-field__title">
        {{ field.label
        }}<span v-if="field.required" class="ccb-field-required-mark">*</span
        ><ProBadge />
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
        :values="fieldValue"
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
import ProBadge from "@/widget/shared/ui/components/Pro-badge/ProBadge.vue";
import { IImageCheckboxField } from "@/widget/shared/types/fields";

const DefaultStyle = defineAsyncComponent(() => import("./styles/Default.vue"));
const WithIcon = defineAsyncComponent(() => import("./styles/WithIcon.vue"));

const props = defineProps<{
  field: IImageCheckboxField;
}>();
const { field } = toRefs(props);

const fieldValue = computed(() => {
  return field.value.selectedOption || [];
});

const isRequired = computed(() => {
  return field.value.required || false;
});

const appearanceStore = useAppearanceStore();

const currentComponents = computed(() => {
  const style = field.value.styles?.style || "default";
  if (style === "with-icon") {
    return WithIcon;
  }
  return DefaultStyle;
});

const additionalClasses = computed(() => {
  return field.value.additionalStyles || "";
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
}
.ccb-checkbox-image__label {
  font-size: var(--ccb-fields-button-size) !important;

  @media only screen and (max-width: 480px) {
    font-size: var(--ccb-mobile-fields-button-size) !important;
  }
}
</style>
