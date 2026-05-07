<template>
  <div class="ccb-conditions-link-structure">
    <div class="ccb-conditions-link-structure__header">
      <span class="ccb-conditions-link-structure__header-main">
        <Text
          text="Condition"
          size="s"
          weight="medium"
          class="ccb-links-header"
        />
        <Text text="Value" size="s" weight="medium" class="ccb-links-header" />
      </span>
      <span class="ccb-conditions-link-structure__header-action">
        <Text
          text="Actions / Options"
          size="s"
          weight="medium"
          class="ccb-links-header"
        />
      </span>
    </div>
    <div
      v-if="!conditions || conditions.length === 0"
      class="ccb-conditions-link-structure__empty"
    >
      <Text
        text="No conditions yet. Click 'Add Link' to create one."
        size="m"
        weight="medium"
        class="ccb-conditions-link-structure__empty-text"
      />
    </div>
    <div v-else class="ccb-conditions-link-structure__content lsc">
      <div class="lsc__item" v-for="(condition, idx) in conditions" :key="idx">
        <div class="lsc__item-remove" @click="removeCondition(idx)">
          <i class="ccb-icon-close-x"></i>
        </div>

        <div class="lsc__item-main">
          <div
            class="lsc__item-main-condition"
            v-for="(c, c_idx) in condition.conditions"
            :key="c_idx"
          >
            <div class="lsc__item-main-condition-box">
              <Dropdown
                :label="''"
                :items="getActions(condition.optionFrom)"
                v-model="c.condition"
                class="lsc_item_left"
              />
              <template
                v-if="
                  getActionTypeValue(c.condition, condition.optionFrom) ===
                  'select_option'
                "
              >
                <Dropdown
                  :label="''"
                  :items="getFieldOptionsWithAny(condition.optionFrom)"
                  v-model="c.key"
                  class="lsc_item_right"
                />
              </template>
              <template
                v-else-if="
                  getActionTypeValue(c.condition, condition.optionFrom) ===
                  'select_multiple_option'
                "
              >
                <MultiSelect
                  :items="getFieldOptions(condition.optionFrom)"
                  v-model="c.checkedValues"
                  label=""
                  placeholder="Select items"
                  name="checkedValues"
                  className="lsc_item_right"
                  :maxItemsShown="0"
                />
              </template>
              <template v-else>
                <Input
                  :label="''"
                  v-model="c.value"
                  class="lsc_item_right"
                  placeholder="Set Value"
                />
              </template>
              <div class="lsc__item-main-condition-box-close">
                <i
                  class="ccb-icon-close-x"
                  @click="removeConditionRule(idx, c_idx)"
                  :class="{
                    'ccb-icon-close-x-disabled':
                      condition?.conditions?.length === 1,
                  }"
                ></i>
              </div>
            </div>
            <div class="lsc__item-main-condition-box-operators-wrapper">
              <select
                v-if="condition?.conditions?.length - 1 !== c_idx"
                class="lsc__item-main-condition-box-operators-wrapper-select"
                :value="c.logicalOperator || '||'"
                @change="
                  c.logicalOperator = ($event.target as HTMLSelectElement)
                    .value as '||' | '&&'
                "
              >
                <option value="||">OR</option>
                <option value="&&">AND</option>
              </select>
              <button
                v-if="condition?.conditions?.length - 1 === c_idx"
                class="lsc__item-main-condition-box-operators-wrapper-button add-condition"
                @click.stop="addConditionRule(idx)"
              >
                Add Condition
              </button>
            </div>
          </div>
        </div>

        <div class="lsc__item-action">
          <div class="lsc__item-action-options">
            <Dropdown
              :label="''"
              :items="getFieldActions(condition.optionTo)"
              v-model="condition.action"
            />

            <!-- input: set_value / set_value_and_disable -->
            <template
              v-if="
                getActionOptionTypeValue(
                  condition.action,
                  condition.optionTo,
                ) === 'input'
              "
            >
              <Input :label="''" :placeholder="''" v-model="condition.setVal" />
            </template>

            <!-- select: select_option single -->
            <template
              v-else-if="
                getActionOptionTypeValue(
                  condition.action,
                  condition.optionTo,
                ) === 'select'
              "
            >
              <Dropdown
                :label="''"
                :items="getFieldOptions(condition.optionTo)"
                v-model="condition.setVal"
              />
            </template>

            <!-- multi_select: select_option(s) / unset_option(s) / disable_option(s) -->
            <template
              v-else-if="
                getActionOptionTypeValue(
                  condition.action,
                  condition.optionTo,
                ) === 'multi_select'
              "
            >
              <MultiSelect
                :items="getFieldOptions(condition.optionTo, 'str')"
                :modelValue="getModalValueForMultiSelect(condition.setVal)"
                label=""
                placeholder="Select items"
                name="checkedValues"
                :maxItemsShown="0"
                @change="
                  (_: string, value: Array<string | number>) =>
                    handleChangeForMultiSelect(value, idx)
                "
              />
            </template>

            <!-- date/period_date/time/period_time controls are rendered below the action row -->

            <!-- period_range: set_period / set_period_and_disable (multi-range from/to) -->
            <template
              v-else-if="
                getActionOptionTypeValue(
                  condition.action,
                  condition.optionTo,
                ) === 'period_range'
              "
            >
              <div class="lsc__period-range-control">
                <Input
                  :label="''"
                  placeholder="From"
                  :modelValue="parsePeriodVal(condition.setVal).start"
                  @update:modelValue="
                    handlePeriodRangeChange('start', $event, idx)
                  "
                />
                <Input
                  :label="''"
                  placeholder="To"
                  :modelValue="parsePeriodVal(condition.setVal).end"
                  @update:modelValue="
                    handlePeriodRangeChange('end', $event, idx)
                  "
                />
              </div>
            </template>

            <!-- location: set_location / set_location_and_disable -->
            <template
              v-else-if="
                getActionOptionTypeValue(
                  condition.action,
                  condition.optionTo,
                ) === 'location'
              "
            >
              <Dropdown
                :label="''"
                :items="getGeoLocationOptions(condition.optionTo)"
                v-model="condition.setVal"
              />
            </template>
          </div>

          <!-- date: set_date / set_date_and_disable (single date) — below action row -->
          <div
            v-if="
              getActionOptionTypeValue(condition.action, condition.optionTo) ===
              'date'
            "
            class="lsc__item-action-date"
          >
            <VueDatePicker
              :model-value="parseDateVal(condition.setVal)"
              @update:model-value="handleDateChange($event, idx)"
              :enable-time-picker="false"
              :format="'dd/MM/yyyy'"
              auto-apply
              teleport="body"
              placeholder="DD/MM/YYYY"
            />
          </div>

          <!-- period_date: set_period / set_period_and_disable (date range) — below action row -->
          <div
            v-if="
              getActionOptionTypeValue(condition.action, condition.optionTo) ===
              'period_date'
            "
            class="lsc__item-action-date"
          >
            <VueDatePicker
              :model-value="
                parsePeriodDateVal(condition.setVal) as unknown as Date[]
              "
              @update:model-value="
                handlePeriodDateChange(
                  $event as unknown as [Date | null, Date | null] | null,
                  idx,
                )
              "
              range
              :enable-time-picker="false"
              :format="'dd/MM/yyyy'"
              auto-apply
              teleport="body"
              placeholder="DD/MM/YYYY"
            />
          </div>

          <!-- time: set_time / set_time_and_disable (single time) — below action row -->
          <div
            v-if="
              getActionOptionTypeValue(condition.action, condition.optionTo) ===
              'time'
            "
            class="lsc__item-action-date"
          >
            <VueDatePicker
              :model-value="parseTimeVal(condition.setVal)"
              @update:model-value="
                handleTimeChange(
                  $event,
                  idx,
                  isTimeField24h(condition.optionTo),
                )
              "
              time-picker
              :is-24="isTimeField24h(condition.optionTo)"
              teleport="body"
              placeholder="Select time"
            />
          </div>

          <!-- period_time: set_period / set_period_and_disable (time range) — below action row -->
          <div
            v-if="
              getActionOptionTypeValue(condition.action, condition.optionTo) ===
              'period_time'
            "
            class="lsc__item-action-date lsc__period-time-control"
          >
            <div class="lsc__period-time-field">
              <span class="lsc__period-time-label">Start</span>
              <VueDatePicker
                :model-value="parsePeriodTimeVal(condition.setVal, 'start')"
                @update:model-value="
                  handlePeriodTimeStart(
                    $event,
                    idx,
                    isTimeField24h(condition.optionTo),
                  )
                "
                time-picker
                :is-24="isTimeField24h(condition.optionTo)"
                teleport="body"
                placeholder="Start"
              />
            </div>
            <div class="lsc__period-time-field">
              <span class="lsc__period-time-label">End</span>
              <VueDatePicker
                :model-value="parsePeriodTimeVal(condition.setVal, 'end')"
                @update:model-value="
                  handlePeriodTimeEnd(
                    $event,
                    idx,
                    isTimeField24h(condition.optionTo),
                  )
                "
                time-picker
                :is-24="isTimeField24h(condition.optionTo)"
                teleport="body"
                placeholder="End"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from "vue";
import { Text, Dropdown, Input, MultiSelect } from "@/admin/shared/ui/UIKit";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import {
  type ICondition,
  type ConditionLogic,
} from "@/admin/shared/types/conditions.type";
import { IDropdownOption } from "@/admin/shared/types/uikit.type";
import { useConditionHelpers } from "@/admin/features/conditions/composable/useConditionHelpers";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import {
  IField,
  IGeolocationField,
  ITimePickerField,
} from "@/admin/shared/types/fields.type";
import { resolveFieldName } from "@/admin/features/conditions/composable/useConditionNormalize";

const props = defineProps<{
  conditions: ICondition[];
}>();

const emit = defineEmits<{
  (e: "addConditionRule", idx: number): void;
  (e: "removeConditionRule", idx: number, c_idx: number): void;
  (e: "removeCondition", idx: number): void;
}>();

const { conditions } = toRefs(props);
const {
  getActionType,
  getActionsByAliasWithField,
  getFieldActionsByAliasWithField,
  getActionOptionTypeWithField,
} = useConditionHelpers();

const builderStore = useBuilderStore();

const resolveAlias = (
  alias: string,
): { fieldName: string; field: IField | undefined } => {
  const field = builderStore.getFieldByAlias(alias);
  const fieldName = field
    ? resolveFieldName(alias, field)
    : alias.replace(/_field_id.*/, "");
  return { fieldName, field };
};

const getActions = computed(() => {
  return (alias: string): IDropdownOption[] => {
    const { fieldName, field } = resolveAlias(alias);
    return getActionsByAliasWithField(fieldName, field);
  };
});

const getActionTypeValue = computed(() => {
  return (action: string, alias: string): string => {
    const { fieldName } = resolveAlias(alias);
    return getActionType(action as ConditionLogic, fieldName);
  };
});

const getFieldActions = computed(() => {
  return (alias: string): IDropdownOption[] => {
    const { fieldName, field } = resolveAlias(alias);
    return getFieldActionsByAliasWithField(fieldName, field);
  };
});

const getFieldOptions = computed(() => {
  return (alias: string, valueType?: "str" | "num"): IDropdownOption[] => {
    const field: IField | undefined = builderStore.getFieldByAlias(alias);
    if (!field) return [];

    if ("options" in field && Array.isArray(field.options)) {
      return field.options.map((option, idx) => ({
        label: option.optionText,
        value: valueType === "str" ? idx.toString() : idx,
      }));
    }

    if (
      "multiplyLocations" in field &&
      Array.isArray((field as IGeolocationField).multiplyLocations)
    ) {
      return (field as IGeolocationField).multiplyLocations.map((loc, idx) => ({
        label: loc.label,
        value: valueType === "str" ? idx.toString() : idx,
      }));
    }

    return [];
  };
});

const SELECT_ANY_FIELDS = [
  "geolocation",
  "dropDown",
  "radio",
  "dropDown_with_img",
  "radio_with_img",
  "checkbox",
  "toggle",
  "checkbox_with_img",
];

const getFieldOptionsWithAny = computed(() => {
  return (alias: string): IDropdownOption[] => {
    const { fieldName } = resolveAlias(alias);
    const options = getFieldOptions.value(alias);

    if (SELECT_ANY_FIELDS.includes(fieldName)) {
      return [{ label: "Select any", value: "any" }, ...options];
    }

    return options;
  };
});

const getGeoLocationOptions = computed(() => {
  return (alias: string): IDropdownOption[] => {
    const field = builderStore.getFieldByAlias(alias);
    if (
      field &&
      "multiplyLocations" in field &&
      Array.isArray((field as IGeolocationField).multiplyLocations)
    ) {
      return (field as IGeolocationField).multiplyLocations.map((loc, idx) => ({
        label: loc.label,
        value: idx,
      }));
    }
    return [];
  };
});

const getActionOptionTypeValue = computed(() => {
  return (action: string, alias: string): string => {
    const { fieldName, field } = resolveAlias(alias);
    return getActionOptionTypeWithField(action, fieldName, field);
  };
});

const isTimeField24h = computed(() => {
  return (alias: string): boolean => {
    const field = builderStore.getFieldByAlias(alias);
    if (field && "format" in field) {
      return Boolean((field as ITimePickerField).format);
    }
    return false;
  };
});

const getModalValueForMultiSelect = computed(() => {
  return (value: string | number): string[] | number[] => {
    return `${value}`.split(",").map((v) => v.trim());
  };
});

const handleChangeForMultiSelect = (
  value: Array<string | number>,
  idx: number,
): void => {
  conditions.value[idx].setVal = value.join(",");
};

function parsePeriodVal(val: string | number): { start: string; end: string } {
  if (!val) return { start: "", end: "" };
  try {
    const parsed = JSON.parse(String(val));
    return {
      start: parsed?.start ?? "",
      end: parsed?.end ?? "",
    };
  } catch {
    return { start: String(val), end: "" };
  }
}

function fmtDate(d: Date | null): string | null {
  if (!d) return null;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDate(val: string): Date | null {
  if (!val) return null;
  const slashMatch = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return new Date(+slashMatch[3], +slashMatch[2] - 1, +slashMatch[1]);
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function handleDateChange(date: Date | null, idx: number): void {
  conditions.value[idx].setVal = fmtDate(date) ?? "";
}

function handlePeriodDateChange(
  dates: [Date | null, Date | null] | null,
  idx: number,
): void {
  if (!dates || !Array.isArray(dates)) {
    conditions.value[idx].setVal = JSON.stringify({ start: null, end: null });
    return;
  }
  conditions.value[idx].setVal = JSON.stringify({
    start: fmtDate(dates[0]),
    end: fmtDate(dates[1]),
  });
}

function fmtTime(
  time: { hours: number; minutes: number },
  is24: boolean = false,
): string {
  const m = String(time.minutes).padStart(2, "0");
  if (is24) {
    const h = String(time.hours).padStart(2, "0");
    return `${h}:${m}`;
  }
  const h = String(time.hours % 12 || 12).padStart(2, "0");
  const ampm = time.hours >= 12 ? "pm" : "am";
  return `${h}:${m} ${ampm}`;
}

function parseTimeVal(
  val: string | number,
): { hours: number; minutes: number; seconds: number } | null {
  if (!val) return null;
  const s = String(val).trim();

  const match12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const isPM = match12[3].toUpperCase() === "PM";
    if (hours === 12) hours = 0;
    if (isPM) hours += 12;
    return { hours, minutes, seconds: 0 };
  }

  const match24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return { hours, minutes, seconds: 0 };
    }
  }

  return null;
}

function parsePeriodTimeVal(
  val: string | number,
  field: "start" | "end",
): { hours: number; minutes: number; seconds: number } | null {
  const p = parsePeriodVal(val);
  return parseTimeVal(p[field]);
}

function handleTimeChange(
  time: { hours: number; minutes: number } | null,
  idx: number,
  is24: boolean = false,
): void {
  if (!time) {
    conditions.value[idx].setVal = "";
    return;
  }
  conditions.value[idx].setVal = fmtTime(time, is24);
}

function handlePeriodTimeStart(
  time: { hours: number; minutes: number } | null,
  idx: number,
  is24: boolean = false,
): void {
  const current = parsePeriodVal(conditions.value[idx].setVal);
  conditions.value[idx].setVal = JSON.stringify({
    start: time ? fmtTime(time, is24) : "",
    end: current.end,
  });
}

function handlePeriodTimeEnd(
  time: { hours: number; minutes: number } | null,
  idx: number,
  is24: boolean = false,
): void {
  const current = parsePeriodVal(conditions.value[idx].setVal);
  conditions.value[idx].setVal = JSON.stringify({
    start: current.start,
    end: time ? fmtTime(time, is24) : "",
  });
}

function handlePeriodRangeChange(
  field: "start" | "end",
  value: string,
  idx: number,
): void {
  const current = parsePeriodVal(conditions.value[idx].setVal);
  current[field] = value;
  conditions.value[idx].setVal = JSON.stringify(current);
}

function parseDateVal(val: string | number): Date | null {
  if (!val) return null;
  return parseDate(String(val));
}

function parsePeriodDateVal(
  val: string | number,
): [Date | null, Date | null] | null {
  const p = parsePeriodVal(val);
  const start = p.start ? parseDate(p.start) : null;
  const end = p.end ? parseDate(p.end) : null;
  return [start, end];
}

const addConditionRule = (idx: number): void => {
  emit("addConditionRule", idx);
};

const removeConditionRule = (idx: number, c_idx: number): void => {
  if (conditions.value[idx]?.conditions?.length === 1) return;
  emit("removeConditionRule", idx, c_idx);
};

const removeCondition = (idx: number): void => {
  emit("removeCondition", idx);
};
</script>

<style lang="scss">
.ccb-conditions-link-structure {
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  width: 100%;

  &__header {
    display: flex;
    width: 100%;
    border-radius: 16px;
    height: 30px;
    background: var(--ccb-bw-dull-normal);

    &-main {
      display: flex;
      align-items: center;

      * {
        width: 256px;
        display: flex;
        align-items: center;

        &:first-child {
          padding-left: 16px;
        }
      }
    }

    &-action {
      display: flex;
      width: 100%;

      * {
        border-left: 2px solid rgba(68, 80, 207, 0.08);
        padding-left: 16px;
        display: flex;
        align-items: center;
      }
    }
  }

  .lsc {
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: 16px;

    &__item {
      width: 100%;
      display: flex;
      border-radius: 16px;
      background: rgba(68, 80, 207, 0.08);
      position: relative;

      &-remove {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        position: absolute;
        top: -8px;
        right: -8px;
        cursor: pointer;
        background-color: #f99b0c;
        opacity: 0.8;
        transition: all 200ms linear;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          font-size: 8px;
          color: #fff;
        }

        &:hover {
          opacity: 1;
        }
      }

      &-main {
        padding: 16px 16px 0 16px;
        min-width: 512px;
        width: 100%;
        display: flex;
        flex-direction: column;

        &-condition {
          display: flex;
          flex-direction: column;

          &-box {
            display: flex;
            width: 100%;
            column-gap: 4px;

            & > div {
              flex: 1;
            }
          }

          &-box-close {
            width: 20px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background-color: transparent;
            flex: unset !important;

            i {
              font-size: 10px;
              color: var(--ccb-font-labels);
              opacity: 0.6;
              transition: 200ms linear;

              &:hover {
                opacity: 1;
              }
            }
          }

          &-box-operators-wrapper {
            display: flex;
            width: 100%;
            justify-content: center;
            padding: 8px 24px 8px 0px;
            position: relative;
            z-index: 2;

            &-select {
              height: 22px;
              padding: 0 6px;
              border: none;
              outline: none;
              border-radius: 99px;
              cursor: pointer;
              font-size: 13px;
              font-weight: 600;
              background: rgba(68, 80, 207, 0.08);
              color: #4450cf;
              text-align: center;
              appearance: none;
              -webkit-appearance: none;

              &:hover {
                background: rgba(68, 80, 207, 0.14);
              }
            }

            &-button {
              height: 22px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 0 10px;
              border: none;
              outline: none;
              border-radius: 99px;
              cursor: pointer;
              font-size: 13px;
              font-weight: 600;
              background: rgba(68, 80, 207, 0.08);
              color: #4450cf;
              transition: all 200ms linear;

              &.add-condition {
                background: #4450cf;
                color: rgba(255, 255, 255, 0.8);

                &:hover {
                  color: rgba(255, 255, 255, 0.9);
                }
              }
            }
          }
        }
      }

      &-action {
        padding: 16px;
        width: 100%;
        display: flex;
        flex-direction: column;
        row-gap: 8px;
        border-left: 2px solid rgba(68, 80, 207, 0.08);

        &-options {
          display: flex;
          flex-direction: column;
          width: 100%;
          row-gap: 4px;
        }

        &-date {
          width: 100%;

          .dp__input {
            height: 39px;
            font-size: 13px;
            border-radius: 12px !important;
          }
        }
      }
    }
  }
}

.ccb-conditions-link-structure__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  width: 100%;

  &-text {
    color: var(--ccb-font-comment);
    opacity: 0.7;
  }
}

.ccb-links-header {
  color: var(--ccb-font-comment);
}

.ccb-icon-close-x-disabled {
  opacity: 0.25 !important;
  pointer-events: none;
}

.dp__outer_menu_wrap {
  z-index: 99999 !important;
}

.lsc__period-time-control {
  display: flex;
  flex-direction: row;
  column-gap: 8px;
}

.lsc__period-time-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  row-gap: 2px;
}

.lsc__period-time-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--ccb-font-comment);
}

.lsc__period-range-control {
  display: flex;
  column-gap: 4px;

  & > div {
    flex: 1;
  }

  input {
    border-radius: 12px !important;
    height: 39px;
  }
}
</style>
