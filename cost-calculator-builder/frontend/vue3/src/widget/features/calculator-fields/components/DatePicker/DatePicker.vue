<template>
  <div
    class="ccb-field ccb-datePicker"
    :class="{
      required: isRequired,
      'ccb-field-disabled': field.disabled,
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
        :range="getFieldRange"
        :placeholder="getPlaceholder"
        :enable-time-picker="false"
        :disabled-week-days="getDisabledWeekDays"
        :disabled-dates="getTotalDisableDate"
        :min-date="getMinDate"
        :format="format"
        :select-text="translationsStore.getTranslations.select"
        :cancel-text="translationsStore.getTranslations.cancel"
        @update:model-value="updateValue"
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
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";
import { useConditionsStore } from "@/widget/app/providers/stores/conditionsStore.ts";
import { useSingleField } from "@/widget/actions/fields/composable/useSingleField.ts";
import { useDatePickerFieldHelper } from "@/widget/actions/fields/composable/useDatePickerFieldHelper.ts";
import { useCallbackStore } from "@/widget/app/providers/stores/callbackStore.ts";
import ProBadge from "@/widget/shared/ui/components/Pro-badge/ProBadge.vue";
import RequiredHint from "@/widget/shared/ui/components/Required-hint/RequiredHint.vue";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";

type Props = {
  field: IDatePickerField;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const appearanceStore = useAppearanceStore();
const fieldStore = useFieldsStore();
const conditionsStore = useConditionsStore();
const singleFieldMixins = useSingleField();
const callbackStore = useCallbackStore();
const translationsStore = useTranslationsStore();
const settingStore = useSettingsStore();

const { parseDate, getDaysDifference, displayValueHelper } =
  useDatePickerFieldHelper();

const requiredWarningText = computed(() => {
  return settingStore.getWarningTexts?.requiredMsg || "";
});

const currentLang = computed(() => {
  return settingStore.getLanguage;
});

const format = () => displayValueHelper(date.value, currentLang.value);
const date = computed({
  get() {
    return field.value.selectedDate;
  },
  set(value) {
    field.value.selectedDate = value;
  },
});

const isRequired = computed(() => {
  return fieldStore.checkFieldRequired(field.value);
});

const getPlaceholder = computed(() => {
  return field.value.placeholder
    ? field.value.placeholder
    : translationsStore.getTranslations.selectDate;
});

const getDisabledWeekDays = computed(() => {
  if (!field.value.isHaveUnselectable) return [];
  return field.value.notAllowedWeekDays?.map((n) => (n === 7 ? 0 : n));
});

const getDisabledDates = computed(() => {
  const today = new Date();
  let days: Date[] = [];

  if (!field.value.isHaveUnselectable) return days;

  for (let i = 1; i <= field.value.daysFromCurrent; i++) {
    const nDay = new Date(today);
    nDay.setDate(nDay.getDate() + i);
    days.push(nDay);
  }

  if (field.value.notAllowedDates?.current) {
    days.push(today);
  }

  return days;
});

const getMinDate = computed(() => {
  if (field.value.isHaveUnselectable && field.value.notAllowedDates?.allPast) {
    return new Date();
  }

  return "";
});

const getBlockPeriodDates = computed(() => {
  const dates: Date[] = [];

  if (!field.value.isHaveUnselectable) return dates;

  const notAllowedDates = field.value.notAllowedDates;

  if (
    notAllowedDates &&
    notAllowedDates.period &&
    notAllowedDates.period.length
  ) {
    for (const period of notAllowedDates.period) {
      const startDate = new Date(parseDate(period.start || ""));
      const endDate = new Date(parseDate(period.end || ""));

      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        dates.push(new Date(d));
      }
    }
  }

  return dates;
});

const getTotalDisableDate = computed(() => {
  return [...getBlockPeriodDates.value, ...getDisabledDates.value];
});

const getDisplayValue = computed(() => {
  if (!field.value.dayPriceEnabled) {
    return displayValueHelper(date.value, currentLang.value);
  }

  return field.value.useCurrency || field.value.fieldCurrency
    ? singleFieldMixins.getCommonFieldDisplayView(field.value)
    : field.value.value?.toString() || "";
});

const getExtraDisplayValue = computed(() => {
  if (field.value.dayPriceEnabled) {
    const result: string[] = [
      displayValueHelper(date.value, currentLang.value),
    ];
    const value =
      field.value.useCurrency || field.value.fieldCurrency
        ? singleFieldMixins.getCommonFieldDisplayView(field.value)
        : field.value.value?.toString();

    if (field.value.range && Array.isArray(date.value)) {
      const dayDiff = getDaysDifference(
        date.value[0] as Date,
        date.value[1] as Date,
        field.value,
        getTotalDisableDate.value,
        getDisabledWeekDays.value,
      );

      if (dayDiff)
        result.push(
          `${dayDiff} ${translationsStore.getTranslations.days} x ${field.value.dayPrice}`,
        );
    } else if (date.value) {
      result.push(`1 ${translationsStore.getTranslations.days} x ${value}`);
    }

    return result;
  }

  return [];
});

const getFieldRange = computed(() => {
  if (typeof field.value.range === "boolean") {
    return field.value.range;
  }

  return field.value.range === "1";
});

const getValue = computed(() => {
  if (!field.value.dayPriceEnabled) return 0;

  if (Array.isArray(date.value)) {
    const differentDays = getDaysDifference(
      date.value[0],
      date.value[1],
      field.value,
      getTotalDisableDate.value,
      getDisabledWeekDays.value,
    );
    return differentDays * field.value.dayPrice;
  }

  let val: number = date.value ? 1 : 0;
  return val * field.value.dayPrice;
});

const updateValue = (
  modelData: Date | Date[],
  alias?: string,
  fromCondition?: boolean,
) => {
  if (alias && alias !== field.value.alias) {
    return;
  }

  field.value.selectedDate = modelData || undefined;
  field.value.value = getValue.value;
  field.value.displayValue = getDisplayValue.value;
  field.value.extraDisplayView = getExtraDisplayValue.value;
  fieldStore.updateField(field.value.alias, field.value, fromCondition);
  conditionsStore.applyConditionForField(field.value.alias);
};

const additionalClasses = computed(() => {
  return field.value?.additionalStyles || "";
});

callbackStore.add("updateDatePicker", updateValue);
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
  input {
    padding: 0 var(--ccb-field-side-indent);
    padding-left: max(30px, var(--ccb-field-side-indent)) !important;
    min-height: var(--ccb-field-button-height);

    @media only screen and (max-width: 480px) {
      padding: 0 var(--ccb-mobile-field-side-indent);
      padding-left: max(30px, var(--ccb-mobile-field-side-indent)) !important;
    }

    &.dp__input_focus {
      border-color: var(--ccb-accent-color);
    }

    &::placeholder {
      color: var(--ccb-text-color);
    }
  }

  .dp__input_icon {
    fill: var(--ccb-text-color);
  }

  .dp--menu-wrapper {
    width: 100%;
    min-width: 360px;
    left: 0 !important;
    color: var(--ccb-text-color) !important;
    max-width: 430px;
    border-radius: 4px;

    @media (max-width: 480px) {
      min-width: 200px;
    }
  }

  .dp__active_date {
    background: var(--ccb-accent-color) !important;
  }

  .dp__arrow_bottom,
  .dp__arrow_top {
    border: none;
    background-color: var(--ccb-fields-bg-color);
  }

  .dp__menu {
    border: none;
    box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    overflow: hidden;
  }

  .dp__menu_inner {
    background: var(--ccb-fields-bg-color);
    border-radius: 4px;
    padding: 14px;
  }

  .dp__overlay_container {
    padding: 4px;
    padding-left: 6px !important;
    width: 100%;

    .dp__overlay_cell {
      font-weight: 400;
      padding: 15px;

      &:hover {
        background: color-mix(
          in srgb,
          var(--ccb-accent-color),
          transparent 50%
        );
        color: #fff;
      }
    }
  }

  .dp__overlay_action {
    background: var(--ccb-date-picker-day);
    width: 96%;
    border-radius: 4px;
    margin: 0 auto;

    &:hover {
      background: var(--ccb-accent-color);
      color: #fff;
    }
  }

  .dp__overlay {
    background: var(--ccb-fields-bg-color);
    color: var(--ccb-text-color);
    display: flex;
    justify-content: center;

    .dp__overlay_cell {
      &:hover {
        background: color-mix(
          in srgb,
          var(--ccb-accent-color),
          transparent 50%
        );
        color: var(--ccb-text-color);
      }
    }
  }

  .dp__overlay_cell_active {
    background: var(--ccb-accent-color);
    color: #fff;
    font-weight: 400;
    padding: 15px;
  }

  .dp__action_row {
    background: var(--ccb-fields-bg-color);
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    row-gap: 10px;

    .dp__selection_preview {
      padding-left: 10px;
      color: var(--ccb-text-color);
    }

    .dp__action_buttons {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      row-gap: 10px;
      column-gap: 10px;
    }

    padding: 10px 8px 8px 0px;

    .dp__action_cancel {
      min-width: 86px;
      height: 32px;
      padding: 0 14px;
      margin: 0;
      border: 1px solid transparent;
      flex: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      cursor: pointer;
      transition: 300ms ease;
      font-size: 14px;
      font-weight: var(--ccb-fields-button-weight);
      line-height: 1;
      background: var(--ccb-date-picker-day);
      color: var(--ccb-text-color);

      @media only screen and (max-width: 480px) {
        font-size: 14px;
        font-weight: var(--ccb-mobile-fields-button-weight);
      }

      &:hover {
        background: hsl(from var(--ccb-fields-bg-color) h s calc(l - 10));
      }
    }

    .dp__action_select {
      min-width: 86px;
      height: 32px;
      padding: 0 14px;
      margin: 0;
      border: none;
      flex: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      cursor: pointer;
      transition: 300ms ease;
      font-size: 14px;
      font-weight: var(--ccb-fields-button-weight);
      line-height: 1;
      background: var(--ccb-accent-color);
      color: var(--ccb-fields-bg-color);

      @media only screen and (max-width: 480px) {
        font-size: 14px;
        font-weight: var(--ccb-mobile-fields-button-weight);
      }

      &:hover {
        background: hsl(from var(--ccb-accent-color) h s calc(l - 5));
      }
    }
  }

  .dp__pointer {
    background: var(--ccb-fields-bg-color);
  }

  .dp__inner_nav {
    background: var(--ccb-date-picker-day);
    border-radius: 4px;
    color: var(--ccb-text-color);
  }

  .dp__month_year_wrap {
    gap: 4px;
    .dp__month_year_select {
      background: var(--ccb-date-picker-day);
      border-radius: 4px;
      height: 26px;
      font-size: 14px;
      font-weight: 700;
      color: var(--ccb-text-color);

      &:hover {
        background: var(--ccb-accent-color) !important;
        color: #fff;
      }
    }
  }

  .dp__cell_inner {
    width: 100% !important;
    min-width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0px;
    font-size: 14px !important;
    line-height: 1;
    font-weight: 500;
    border: 2px solid transparent;
    border-radius: 4px;
  }

  .dp__range_start,
  .dp__range_end {
    background: var(--ccb-accent-color) !important;
  }

  .dp__range_between {
    background: var(--ccb-date-picker-picket-day) !important;
    color: var(--ccb-accent-color) !important;
  }

  .dp--arrow-btn-nav {
    padding: 0px !important;
    border-radius: 4px;

    &:hover {
      background: var(--ccb-accent-color) !important;

      .dp__inner_nav {
        color: #fff;
      }
    }
  }

  .dp__calendar_item {
    color: var(--ccb-text-color) !important;
    border-radius: 4px;
  }

  .dp__calendar_header_item {
    height: 22px;
  }

  .dp__calendar_item {
    border: 2px solid transparent;
    &:hover {
      border: 2px solid var(--ccb-accent-color);
      background: color-mix(in srgb, var(--ccb-accent-color), transparent 50%);
      color: var(--ccb-text-color) !important;
    }
  }

  .dp__date_hover {
    &:hover {
      color: var(--ccb-text-color) !important;
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
    padding: 4px 0;
    border-radius: 5px;
    margin-top: 10px;
    margin-bottom: 10px;
    background: var(--ccb-date-picker-day);
    color: var(--ccb-text-color);
  }
}
</style>
