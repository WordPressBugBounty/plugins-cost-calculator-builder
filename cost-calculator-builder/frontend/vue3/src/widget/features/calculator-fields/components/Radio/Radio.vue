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
        :repeater="field.repeaterIdx"
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
    return defineAsyncComponent(() => import("./styles/Default.vue"));
  } else if (style === "box") {
    return defineAsyncComponent(() => import("./styles/Box.vue"));
  } else if (style === "box-with-radio") {
    return defineAsyncComponent(() => import("./styles/BoxRadio.vue"));
  }

  return "";
});

const additionalClasses = computed(() => {
  return field.value?.additionalStyles || "";
});
</script>

<style lang="scss">
.ccb-field {
  &.ccb-radio-field {
    @for $i from 1 through 8 {
      &.ccb-field-element-columns-#{$i} {
        .ccb-radio-grid {
          grid-template-columns: repeat($i, 1fr);
        }
        > * {
          width: 100%;
        }
      }
    }
    .ccb-radio-grid {
      display: grid;
      gap: 10px;
    }
    &.ccb-field-element-columns-4 {
      .ccb-box-with-radio {
        gap: 8px;
        label.ccb-radio-label {
          padding: 12px 8px;
        }
      }
    }
    &.ccb-field-element-columns-5 {
      .ccb-default-radio {
        gap: 6px;
        label {
          input {
            margin-right: 4px;
            min-width: 18px;
            max-width: 18px;
            max-height: 18px;
            min-height: 18px;
          }
        }
      }
      .ccb-box-radio {
        gap: 6px;
      }
      .ccb-box-with-radio {
        gap: 8px;
        label.ccb-radio-label {
          padding: 12px 6px;
          input {
            margin-right: 5px;
            min-width: 18px;
            max-width: 18px;
            max-height: 18px;
            min-height: 18px;
          }
        }
      }
    }
    &.ccb-field-element-columns-6,
    &.ccb-field-element-columns-7 {
      .ccb-default-radio {
        gap: 6px;
        label {
          .ccb-radio-label {
            font-size: calc(var(--ccb-field-size) - 2px);
          }
          input {
            margin-right: 4px;
            min-width: 18px;
            max-width: 18px;
            max-height: 18px;
            min-height: 18px;
          }
        }
      }
      .ccb-box-radio {
        gap: 6px;
        label.ccb-radio-label {
          padding: 12px 4px;
          .ccb-radio-label {
            font-size: calc(var(--ccb-field-size) - 2px);
          }
        }
      }
    }
    &.ccb-field-element-columns-7 {
      .ccb-box-with-radio {
        gap: 5px;
        label.ccb-radio-label {
          padding: 10px 4px;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          input {
            margin-bottom: 3px;
          }
          .ccb-radio-label {
            font-size: calc(var(--ccb-field-size) - 3px);
          }
        }
      }
    }
    &.ccb-field-element-columns-8 {
      .ccb-default-radio {
        gap: 4px;
        label {
          flex-direction: column;
          gap: 4px;
          .ccb-radio-label {
            font-size: calc(var(--ccb-field-size) - 2px);
          }
        }
      }
      .ccb-box-radio {
        gap: 4px;
        label.ccb-radio-label {
          padding: 12px 4px;
          .ccb-radio-label {
            font-size: calc(var(--ccb-field-size) - 4px);
          }
        }
      }
      .ccb-box-with-radio {
        gap: 4px;
        label.ccb-radio-label {
          padding: 10px 4px;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          input {
            margin-bottom: 3px;
          }
          .ccb-radio-label {
            font-size: calc(var(--ccb-field-size) - 4px);
          }
        }
      }
    }
  }
  &.field-width-25 {
    .ccb-field-element-columns-1 {
      .ccb-default-radio {
        label {
          align-items: center;
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
      .ccb-radio-grid {
        gap: 6px;
        grid-template-columns: repeat(2, 1fr);
      }
      .ccb-default-radio {
        label {
          flex-direction: column;
          gap: 4px;
          .ccb-radio-label {
            font-size: calc(var(--ccb-field-size) - 2px);
          }
          input {
            min-width: 20px;
            max-width: 20px;
            max-height: 20px;
            min-height: 20px;
          }
        }
      }
      .ccb-box-radio {
        label.ccb-radio-label {
          padding-left: 6px !important;
          padding-right: 6px !important;
          span {
            word-break: break-all;
            font-size: calc(var(--ccb-field-size) - 2px) !important;
          }
        }
      }
      .ccb-box-with-radio {
        label.ccb-radio-label {
          padding-left: 4px !important;
          padding-right: 4px !important;
          flex-direction: column;
          justify-content: flex-start;
          .ccb-radio-label {
            font-size: calc(var(--ccb-field-size) - 2px) !important;
          }
          input {
            min-width: 20px;
            max-width: 20px;
            max-height: 20px;
            min-height: 20px;
            margin-bottom: 0;
            margin-left: 0;
          }
        }
      }
    }
  }
  &.field-width-50 {
    .ccb-field-element-columns-1,
    .ccb-field-element-columns-2 {
      .ccb-default-radio {
        label {
          align-items: center;
        }
      }
    }
    .ccb-field-element-columns-2 {
      .ccb-box-with-radio {
        label.ccb-radio-label {
          padding-left: 10px !important;
          padding-right: 10px !important;
        }
      }
    }
    .ccb-field-element-columns-3 {
      .ccb-box-with-radio {
        label.ccb-radio-label {
          padding-left: 10px !important;
          padding-right: 10px !important;
          flex-direction: column;
        }
      }
    }
    .ccb-field-element-columns-4,
    .ccb-field-element-columns-5,
    .ccb-field-element-columns-6,
    .ccb-field-element-columns-7,
    .ccb-field-element-columns-8 {
      .ccb-radio-grid {
        gap: 6px;
        grid-template-columns: repeat(4, 1fr);
      }
      .ccb-default-radio {
        label {
          flex-direction: column;
          gap: 4px;
          .ccb-radio-label {
            font-size: calc(var(--ccb-field-size) - 2px);
          }
          input {
            min-width: 20px;
            max-width: 20px;
            max-height: 20px;
            min-height: 20px;
          }
        }
      }
      .ccb-box-radio {
        label.ccb-radio-label {
          padding-left: 6px !important;
          padding-right: 6px !important;
          span {
            word-break: break-all;
            font-size: calc(var(--ccb-field-size) - 2px) !important;
          }
        }
      }
      .ccb-box-with-radio {
        label.ccb-radio-label {
          padding-left: 4px !important;
          padding-right: 4px !important;
          flex-direction: column;
          justify-content: flex-start;
        }
      }
    }
  }
  &.field-width-75 {
    .ccb-field-element-columns-1,
    .ccb-field-element-columns-2,
    .ccb-field-element-columns-3 {
      .ccb-default-radio {
        label {
          align-items: center;
        }
      }
    }
    .ccb-field-element-columns-7,
    .ccb-field-element-columns-8 {
      .ccb-radio-grid {
        gap: 6px;
        grid-template-columns: repeat(6, 1fr);
      }
      .ccb-box-with-radio {
        label.ccb-radio-label {
          justify-content: flex-start;
        }
      }
    }
    .ccb-field-element-columns-3,
    .ccb-field-element-columns-4,
    .ccb-field-element-columns-5,
    .ccb-field-element-columns-6,
    .ccb-field-element-columns-7,
    .ccb-field-element-columns-8 {
      .ccb-default-radio {
        label {
          flex-direction: column;
          gap: 4px;
          .ccb-radio-label {
            font-size: calc(var(--ccb-field-size) - 2px);
          }
          input {
            min-width: 20px;
            max-width: 20px;
            max-height: 20px;
            min-height: 20px;
          }
        }
      }
      .ccb-box-radio {
        label.ccb-radio-label {
          span {
            font-size: calc(var(--ccb-field-size) - 2px) !important;
          }
        }
      }
      .ccb-box-with-radio {
        gap: 6px;
        label.ccb-radio-label {
          padding-left: 10px !important;
          padding-right: 10px !important;
          flex-direction: column;
          input {
            margin-right: 0;
          }
        }
      }
    }
  }
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
