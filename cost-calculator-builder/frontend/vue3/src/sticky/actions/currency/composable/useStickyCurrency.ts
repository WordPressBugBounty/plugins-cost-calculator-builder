import { useAppStore } from "@/sticky/app/providers/app.store";
import {
  CurrencyFormatOptions,
  CurrencyPositions,
} from "@/widget/shared/types/common";
import { Field } from "@/widget/shared/types/fields";

interface IUseStickyCurrencyResult {
  getCurrencyOptions: (field?: Field) => CurrencyFormatOptions;
  formatCurrency: (
    value: number,
    options: CurrencyFormatOptions | undefined,
  ) => string;
  parseCurrencyPosition: (
    value: string,
    currency: string,
    position: CurrencyPositions,
  ) => string;
}

export function useStickyCurrency(): IUseStickyCurrencyResult {
  function getCurrencyOptions(field?: Field): CurrencyFormatOptions {
    const appStore = useAppStore();
    const currencySettings = appStore.getCurrencySettings;

    if (
      typeof field !== "undefined" &&
      "fieldCurrencySettings" in field &&
      field?.fieldCurrency &&
      field?.fieldCurrencySettings
    ) {
      return field?.fieldCurrencySettings;
    }

    return currencySettings as CurrencyFormatOptions;
  }

  function formatCurrency(
    value: number,
    options: CurrencyFormatOptions | undefined,
  ): string {
    if (typeof options === "undefined") {
      return value.toString();
    }

    const {
      numAfterInteger,
      thousandsSeparator,
      decimalSeparator,
      currency,
      currencyPosition,
    } = options;

    // Ensure correct decimal places
    let innerValue = Number(value).toFixed(numAfterInteger);

    // Split integer and decimal parts
    let [integerPart, decimalPart] = innerValue.split(".");

    // Add thousands separator
    integerPart = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      thousandsSeparator,
    );

    const formattedValue =
      integerPart + (decimalPart ? decimalSeparator + decimalPart : "");

    return parseCurrencyPosition(formattedValue, currency, currencyPosition);
  }

  function parseCurrencyPosition(
    value: string,
    currency: string,
    position: CurrencyPositions = "left",
  ): string {
    switch (position) {
      case "left":
        return `${currency}${value}`;
      case "right":
        return `${value}${currency}`;
      case "left_with_space":
        return `${currency} ${value}`;
      case "right_with_space":
        return `${value} ${currency}`;
      default:
        return value;
    }
  }

  return {
    getCurrencyOptions,
    formatCurrency,
    parseCurrencyPosition,
  };
}
