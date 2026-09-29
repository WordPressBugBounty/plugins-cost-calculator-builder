import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import type { IFieldCurrencySettings } from "@/admin/shared/types/fields.type";
import type { ICurrency } from "@/admin/shared/types/settings.type";
import {
  currencyConvertor,
  type CurrencySettings,
} from "@/orders/shared/utils/useCurrencyConvertor";

export interface ICurrencyField {
  allowCurrency?: boolean;
  fieldCurrency?: boolean;
  fieldCurrencySettings?: IFieldCurrencySettings | ICurrency;
}

function toCurrencyConfig(
  source: IFieldCurrencySettings | ICurrency,
): CurrencySettings {
  return {
    currency: source.currency || "$",
    numAfterInteger: source.num_after_integer ?? 2,
    decimalSeparator: source.decimal_separator || ".",
    thousandsSeparator: source.thousands_separator || ",",
    currencyPosition: source.currencyPosition || "left",
  };
}

export function useFieldCurrency() {
  const settingsStore = useSettingsStore();

  const resolveCurrencyConfig = (
    field: ICurrencyField,
  ): CurrencySettings | null => {
    if (field.fieldCurrency && field.fieldCurrencySettings) {
      return toCurrencyConfig(field.fieldCurrencySettings);
    }

    if (field.allowCurrency) {
      const settingsCurrency = settingsStore.getSettings?.currency;
      if (settingsCurrency) {
        return toCurrencyConfig(settingsCurrency);
      }
    }

    return null;
  };

  /**
   * Formats an option price the same way the widget does:
   * strips the "_idx" suffix, applies rounding and currency settings.
   * Builder fields are raw (non-normalized) objects, so any field shape is accepted.
   */
  const formatOptionPrice = (
    optionValue: string | number | undefined,
    rawField: object,
  ): string => {
    const field = rawField as ICurrencyField & { allowRound?: boolean };
    const temp = String(optionValue ?? "").split("_")[0] || "0";
    const raw = field.allowRound ? Math.round(Number(temp)).toString() : temp;

    const config = resolveCurrencyConfig(field);
    return config ? currencyConvertor(Number(raw), config) : raw;
  };

  return { resolveCurrencyConfig, formatOptionPrice };
}
