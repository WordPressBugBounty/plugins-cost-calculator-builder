import type { IFieldCurrencySettings } from "@/admin/shared/types/fields.type";

export const DEFAULT_CURRENCY_SETTINGS: IFieldCurrencySettings = {
  currency: "$",
  num_after_integer: 2,
  decimal_separator: ".",
  thousands_separator: ",",
  currencyPosition: "left_with_space",
};
