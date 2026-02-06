<template>
  <div
    class="ccb-field ccb-image-checkbox-field"
    :class="{
      required: isRequired,
      'ccb-field-disabled': field.disabled,
      [boxStyle]: boxStyle,
      [additionalClasses]: true,
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

const boxStyle = computed(() => {
  return field.value?.styles?.boxStyle === "vertical"
    ? "ccb-vertical-checkbox"
    : "ccb-horizontal-checkbox";
});
</script>

<style lang="scss">
.ccb-field {
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
