<template>
  <div
    class="ccb-field ccb-field-quantity ccb-field-form-fields"
    :class="{
      required: isRequired,
      'ccb-field-disabled': field.disabled,
      [additionalClasses]: true,
    }"
  >
    <div class="ccb-field__label">
      <div class="ccb-required-tooltip" v-if="isRequired">
        <RequiredHint
          v-if="requiredType === 'invalid_email'"
          :text="translationsStore.getTranslations.validEmailAddress"
        />
        <RequiredHint
          v-else-if="requiredType === 'invalid_url'"
          :text="translationsStore.getTranslations.enterValidUrl"
        />
        <RequiredHint v-else :text="requiredWarningText" />
      </div>
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
        @update="updateValue"
        :field="field"
        @country-changed="updateCountryCode"
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
import { toRefs, computed, defineAsyncComponent, ref } from "vue";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import { IValidatedFormField } from "@/widget/shared/types/fields/input.type";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";
import { validateEmail } from "@/widget/shared/utils/validate-email.utils";
import { validateUrl } from "@/widget/shared/utils/validate-url.utils";
import ProBadge from "@/widget/shared/ui/components/Pro-badge/ProBadge.vue";
import RequiredHint from "@/widget/shared/ui/components/Required-hint/RequiredHint.vue";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";

type Props = {
  field: IValidatedFormField;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const requiredType = ref<string>("");

const appearanceStore = useAppearanceStore();
const translationsStore = useTranslationsStore();
const fieldStore = useFieldsStore();

const requiredWarningText = computed(() => {
  const settingStore = useSettingsStore();
  return settingStore.getWarningTexts?.requiredMsg || "";
});

const currentComponents = computed(() => {
  const type = field.value?.fieldType;
  if (type === "name") {
    return defineAsyncComponent(() => import("./components/Name.vue"));
  } else if (type === "email") {
    return defineAsyncComponent(() => import("./components/Email.vue"));
  } else if (type === "phone") {
    return defineAsyncComponent(() => import("./components/Phone.vue"));
  } else if (type === "website_url") {
    return defineAsyncComponent(() => import("./components/WebsiteUrl.vue"));
  }

  return "";
});

const updateValue = (value: string) => {
  requiredType.value = "";
  if (
    field.value?.fieldType === "email" &&
    !validateEmail(value) &&
    value.trim() !== ""
  ) {
    requiredType.value = "invalid_email";
  } else if (
    field.value?.fieldType === "website_url" &&
    !validateUrl(value) &&
    value.trim() !== ""
  ) {
    requiredType.value = "invalid_url";
  }

  field.value.displayValue = value;
  fieldStore.updateField(field.value.alias, field.value);
};

const updateCountryCode = (value: string) => {
  field.value.defaultCountry = value;
  fieldStore.updateField(field.value.alias, field.value);
};

const isRequired = computed(() => {
  if (
    requiredType.value === "invalid_email" ||
    requiredType.value === "invalid_url"
  ) {
    return true;
  }

  return fieldStore.checkFieldRequired(field.value);
});

const additionalClasses = computed(() => {
  return field.value?.additionalStyles || "";
});
</script>

<style lang="scss">
@use "@/styles/widget/_mixins.scss" as mixins;

.ccb-field {
  @media (min-width: 1025px) {
    &.field-width-25 {
      .vue-tel-input {
        flex-direction: column;
        .vti__phone {
          border-top: none;
          border-radius: 0 0 var(--ccb-fields-border-radius)
            var(--ccb-fields-border-radius);
          font-size: calc(var(--ccb-fields-button-size) - 2px);
        }
        .vti__dropdown {
          padding: 12px;
          align-items: center;
          border: var(--ccb-fields-border) var(--ccb-fields-border-style)
            var(--ccb-fields-border-color);
          border-radius: var(--ccb-fields-border-radius)
            var(--ccb-fields-border-radius) 0 0;
          .vti__dropdown-list {
            width: 200px;
            top: 40px;
          }
        }
      }
    }
  }
}
</style>
