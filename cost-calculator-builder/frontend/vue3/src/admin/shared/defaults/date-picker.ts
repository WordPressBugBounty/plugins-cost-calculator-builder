import type { IDatePickerField } from "@/admin/shared/types/fields.type";
import { DEFAULT_CURRENCY_SETTINGS } from "./base";

export const datePickerDefaults = (): Partial<IDatePickerField> => ({
  _id: null,
  label: "",
  range: "0",
  description: "",
  placeholder: "",
  _event: "click",
  type: "Date Picker",
  _tag: "date-picker",
  addToSummary: true,
  allowCurrency: false,
  calculateHidden: false,
  fieldCurrency: false,
  additionalStyles: "",
  icon: "ccb-icon-Path-3513",
  is_have_unselectable: false,
  not_allowed_week_days: [],
  not_allowed_dates: {
    period: [{ start: null, end: null }],
    all_past: false,
    current: false,
    days_from_current: false,
  },
  days_from_current: 0,
  alias: "datePicker_field_id_",
  day_price: 0,
  day_price_enabled: false,
  autoclose_enabled: false,
  desc_option: "after",
  calculate_unselectable_days: false,
  width: "100",
  fieldCurrencySettings: {
    ...DEFAULT_CURRENCY_SETTINGS,
    seperateCurrency: false,
  },
});
