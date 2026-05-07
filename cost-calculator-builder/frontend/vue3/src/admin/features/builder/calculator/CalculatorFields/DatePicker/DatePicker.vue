<template>
  <div
    class="ccb-field ccb-datePicker"
    :class="{
      'ccb-field-disabled': field.disabled,
      [additionalClasses]: true,
    }"
  >
    <div class="ccb-field__label">
      <div class="ccb-field__title">
        {{ field.label
        }}<span v-if="field.required" class="ccb-field-required-mark">*</span>
      </div>
      <div class="ccb-field__hidden" v-if="field.hidden">
        <i class="ccb-icon-ic_eye_crossed"></i>
      </div>
    </div>

    <div
      v-if="appearanceStore.descriptionPosition === 'before'"
      class="ccb-field__descriptions ccb-before"
    >
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>

    <div class="ccb-field__input-wrapper">
      <VueDatePicker
        v-model="date"
        :locale="currentLang"
        :auto-apply="field.autoCloseEnabled"
        :range="field.range === '1'"
        :placeholder="getPlaceholder"
        :enable-time-picker="false"
        :disabled-week-days="getDisabledWeekDays"
        :select-text="translationsStore.getTranslations.select"
        :cancel-text="translationsStore.getTranslations.cancel"
      />
    </div>

    <div
      v-if="appearanceStore.descriptionPosition === 'after'"
      class="ccb-field__descriptions ccb-after"
    >
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import { IDatePickerField } from "@/widget/shared/types/fields";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore.ts";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
const { borderColor, formFieldsColor, textColor, accentColor } =
  useAppearanceColors();
const props = defineProps<{
  field: IDatePickerField;
}>();
const { field } = toRefs(props);

const selectedDate = computed(() => {
  return field.value.selectedDate || new Date();
});

const appearanceStore = useAppearanceStore();
const translationsStore = useTranslationsStore();
const settingStore = useSettingsStore();

const date = computed({
  get() {
    return selectedDate.value;
  },
  set(value) {
    field.value.selectedDate = value as Date;
  },
});

const currentLang = computed(() => {
  return settingStore.getLanguage;
});

const getPlaceholder = computed(() => {
  return field.value.placeholder || "Select Date";
});

const getDisabledWeekDays = computed(() => {
  if (!field.value.isHaveUnselectable) return [];
  return field.value.notAllowedWeekDays?.map((n) => (n === 7 ? 0 : n));
});

const additionalClasses = computed(() => {
  return field.value.additionalStyles || "";
});
</script>

<style lang="scss">
.ccb-field {
  @media (min-width: 1025px) {
    &.field-width-25 {
      .ccb-datePicker {
        .dp__input_wrap {
          .dp__input {
            padding: 10px calc(var(--ccb-field-side-indent) - 4px);
            padding-left: max(
              24px,
              var(--ccb-field-side-indent) - 4px
            ) !important;
            font-size: calc(var(--ccb-fields-button-size) - 2px);
          }
          .dp__input_icons {
            padding: 6px;
          }
        }
      }
    }
  }
}
.ccb-datePicker *:focus {
  outline-width: 0;
}

.ccb-datePicker {
  pointer-events: none;
  input {
    padding: 0 var(--ccb-field-side-indent);
    padding-left: max(30px, var(--ccb-field-side-indent)) !important;

    @media only screen and (max-width: 480px) {
      padding: 0 var(--ccb-mobile-field-side-indent);
      padding-left: max(30px, var(--ccb-mobile-field-side-indent)) !important;
    }

    &.dp__input_focus {
      border-color: v-bind(accentColor);
    }

    &::placeholder {
      color: v-bind(textColor);
    }
  }

  .dp__input_icon {
    fill: v-bind(textColor);
  }

  .dp--menu-wrapper {
    width: 100%;
    left: 0 !important;
    color: v-bind(textColor) !important;
    max-width: 430px;
  }

  .dp__active_date {
    background: v-bind(accentColor) !important;
  }

  .dp__arrow_bottom,
  .dp__arrow_top {
    border: none;
    background-color: v-bind(formFieldsColor);
  }

  .dp__menu {
    border: none;
    box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.25);
    border-radius: 4px;
  }

  .dp__menu_inner {
    background: v-bind(formFieldsColor);
    border-radius: 4px;
  }

  .dp__overlay_action {
    background: v-bind(formFieldsColor);

    &:hover {
      background: v-bind(accentColor);
      color: v-bind(textColor);
    }
  }

  .dp__overlay {
    background: v-bind(formFieldsColor);
    color: v-bind(textColor);

    .dp__overlay_cell {
      &:hover {
        background: color-mix(in srgb, v-bind(accentColor), transparent 50%);
        color: v-bind(textColor);
      }
    }
  }

  .dp__overlay_cell_active {
    background: v-bind(accentColor);
    color: v-bind(textColor);
  }

  .dp__action_row {
    background: v-bind(formFieldsColor);

    .dp__action_cancel {
      padding: 10px;
      margin: 0;
      border: none;
      flex: 1;
      border-radius: var(--ccb-fields-border-radius);
      cursor: pointer;
      transition: 300ms ease;
      font-size: var(--ccb-fields-button-size);
      font-weight: var(--ccb-fields-button-weight);
      border: 1px solid v-bind(borderColor);
      margin-right: 10px;
      background: v-bind(formFieldsColor);
      color: v-bind(textColor);

      @media only screen and (max-width: 480px) {
        font-size: var(--ccb-mobile-fields-button-size);
        font-weight: var(--ccb-mobile-fields-button-weight);
      }

      &:hover {
        background: color-mix(in srgb, v-bind(accentColor), transparent 50%);
      }
    }

    .dp__action_select {
      padding: 10px;
      margin: 0;
      border: none;
      flex: 1;
      border-radius: var(--ccb-fields-border-radius);
      cursor: pointer;
      transition: 300ms ease;
      font-size: var(--ccb-fields-button-size);
      font-weight: var(--ccb-fields-button-weight);
      background: v-bind(accentColor);
      color: v-bind(formFieldsColor);

      @media only screen and (max-width: 480px) {
        font-size: var(--ccb-mobile-fields-button-size);
        font-weight: var(--ccb-mobile-fields-button-weight);
      }

      &:hover {
        background: hsl(from v-bind(accentColor) h s calc(l - 5));
      }
    }
  }

  .dp__menu-inner {
    padding: 10px;
  }

  .dp__pointer {
    background: v-bind(formFieldsColor);
  }

  .dp__inner_nav {
    background: v-bind(formFieldsColor);
    border-radius: 4px;
  }

  .dp__month_year_wrap {
    gap: 4px;
    .dp__month_year_select {
      background: v-bind(formFieldsColor);
      border-radius: 4px;
      height: 26px;
      font-size: 14px;
      font-weight: 700;

      &:hover {
        background: v-bind(accentColor) !important;
      }
    }
  }

  .dp__cell_inner {
    width: auto !important;
    border-radius: 0px;
    font-size: 12px !important;
    font-weight: 500;
  }

  .dp__range_start,
  .dp__range_end {
    background: v-bind(accentColor) !important;
  }

  .dp__range_between {
    background: v-bind(formFieldsColor) !important;
    color: v-bind(accentColor) !important;
  }

  .dp--arrow-btn-nav {
    padding: 0px !important;

    &:hover {
      background: v-bind(accentColor) !important;
    }
  }

  .dp__calendar_item,
  .dp__calendar_header_item {
    color: v-bind(textColor) !important;
  }

  .dp__calendar_header_item {
    height: 22px;
  }

  .dp__calendar_item {
    border: 2px solid transparent;
    &:hover {
      border: 2px solid v-bind(accentColor);
      background: color-mix(in srgb, v-bind(accentColor), transparent 50%);
      color: v-bind(textColor) !important;
    }
  }

  .dp__date_hover {
    &:hover {
      color: v-bind(textColor) !important;
    }
  }

  .dp__today {
    border: none;
  }

  .dp__calendar_row {
    margin: 0;
  }

  .dp__calendar_header_separator {
    display: none;
  }

  .dp__calendar_header {
    font-size: 12px;
    font-weight: 500;
    opacity: 0.3;
  }
}
</style>
