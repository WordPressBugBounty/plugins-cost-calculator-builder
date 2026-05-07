import type { IFieldCurrencySettings } from "@/admin/shared/types/fields.type";

export const ORDER_FORM_FIELD_WIDTHS = [
  { id: 4, label: "4" },
  { id: 6, label: "6" },
  { id: 8, label: "8" },
  { id: 10, label: "10" },
  { id: 12, label: "12" },
];

export const ORDER_FORM_BOX_STYLES = [
  { id: "Vertical", label: "vertical" },
  { id: "Horizontal", label: "horizontal" },
];

export const CURRENCY_POSITION_ITEMS = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "left_with_space", label: "Left with space" },
  { value: "right_with_space", label: "Right with space" },
];

export const DECIMAL_SEPARATOR_ITEMS = [
  { value: ",", label: "Comma" },
  { value: ".", label: "Dot" },
];

export const THOUSANDS_SEPARATOR_ITEMS = [
  { value: ",", label: "Comma" },
  { value: ".", label: "Dot" },
  { value: "'", label: "Apostrophe" },
  { value: " ", label: "Space" },
];

export const SUMMARY_VIEW_ITEMS = [
  { value: "show_value", label: "Show Value" },
  { value: "show_label_not_calculable", label: "Label Only (No Calculation)" },
  { value: "show_label_calculable", label: "Label Only (Calculate Value)" },
];

export const ELEMENT_COLUMNS_ITEMS = [
  { id: "1", label: "1" },
  { id: "2", label: "2" },
  { id: "3", label: "3" },
  { id: "4", label: "4" },
  { id: "5", label: "5" },
  { id: "6", label: "6" },
  { id: "7", label: "7" },
  { id: "8", label: "8" },
];

export const UNIT_POSITION_ITEMS = [
  { value: "left", label: "On the left" },
  { value: "right", label: "On the right" },
];

export const toNumber = (value: unknown, fallback: number): number => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

export const clampWidth = (value: string | number, fallback = 100): number =>
  Math.min(100, Math.max(10, toNumber(value, fallback)));

export const EMPTY_CURRENCY_SETTINGS: IFieldCurrencySettings = {
  currency: "",
  currencyPosition: "",
  thousands_separator: "",
  num_after_integer: 0,
  decimal_separator: "",
};

export const syncCurrencySettings = (
  source?: Partial<IFieldCurrencySettings>,
): IFieldCurrencySettings => ({
  currency: String(source?.currency || ""),
  currencyPosition: String(source?.currencyPosition || ""),
  thousands_separator: String(source?.thousands_separator || ""),
  num_after_integer: Number(source?.num_after_integer || 0),
  decimal_separator: String(source?.decimal_separator || ""),
});
