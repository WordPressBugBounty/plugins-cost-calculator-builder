<template>
  <div
    class="ccb-field ccb-toggle-field"
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
import RequiredHint from "@/widget/shared/ui/components/Required-hint/RequiredHint.vue";

const props = defineProps<{
  field: IMultiOptionsField;
}>();
const { field } = toRefs(props);

const appearanceStore = useAppearanceStore();

const isRequired = computed(() => {
  return false;
});

const requiredWarningText = computed(() => {
  return "";
});

const fieldValue = computed(() => {
  return [
    {
      value: "1",
      label: "Option 1",
    },
  ];
});

const applyChanges = computed(() => {
  return () => {};
});

const style = computed(() => {
  return field.value.styles?.style || "default";
});

const currentComponents = computed(() => {
  if (style.value === "default") {
    return defineAsyncComponent(() => import("./styles/Default.vue"));
  } else if (style.value === "box-with-toggle-and-description") {
    return defineAsyncComponent(
      () => import("./styles/BoxToggleWithDescription.vue"),
    );
  }

  return "";
});

const additionalClasses = computed(() => {
  return "";
});
</script>

<style lang="scss">
@use "@/styles/widget/_mixins.scss" as mixins;

.ccb-field {
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
  }
}
.ccb-toggle-item__label {
  font-size: var(--ccb-fields-button-size) !important;

  @media only screen and (max-width: 480px) {
    font-size: var(--ccb-mobile-fields-button-size) !important;
  }
}
</style>
