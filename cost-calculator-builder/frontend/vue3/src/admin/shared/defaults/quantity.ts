import type {
  IQuantityField,
  IFieldCurrencySettings,
} from "@/admin/shared/types/fields.type";
import { DEFAULT_CURRENCY_SETTINGS } from "./base";
import type {
  IPricingRange,
  PricingStructure,
  BadgeVariant,
  BadgeFormat,
} from "@/admin/features/builder/calculator/CalculatorFieldsSettings/usePricingRanges";

export const quantityDefaults = (): Partial<IQuantityField> => ({
  unit: 1,
  min: 0,
  max: 100,
  label: "",
  _id: null,
  default: "",
  description: "",
  placeholder: "",
  required: false,
  _event: "keyup",
  type: "Quantity",
  allowRound: false,
  additionalCss: "",
  additionalStyles: "",
  addToSummary: true,
  calculateHidden: false,
  allowCurrency: false,
  fieldCurrency: false,
  multiply: false,
  hideMinMax: false,
  unitPosition: "right",
  unitSymbol: "",
  enabled_currency_settings: false,
  _tag: "cost-quantity",
  icon: "ccb-icon-Subtraction-6",
  alias: "quantity_field_id_",
  desc_option: "after",
  step: 1,
  separation: false,
  buttonsPosition: "right",
  styles: {
    style: "default",
  },
  width: "100",
  pricingStructure: "no_discounts",
  pricingRanges: [{ minQty: 1, maxQty: 10, unitPrice: 20 }],
  badgeText: "You save",
  badgeVariant: "outlined",
  badgeFormat: "percent",
  fieldCurrencySettings: { ...DEFAULT_CURRENCY_SETTINGS },
});

export interface IQuantitySettingsDraft {
  label: string;
  fieldName: string;
  placeholder: string;
  description: string;
  min: string;
  max: string;
  step: string;
  defaultValue: string;
  width: number;
  required: boolean;
  hidden: boolean;
  addToSummary: boolean;
  allowCurrency: boolean;
  allowRound: boolean;
  hideMinMax: boolean;
  buttonsPosition: IQuantityField["buttonsPosition"];
  unit: number;
  unitPosition: IQuantityField["unitPosition"];
  unitSymbol: string;
  enabled_currency_settings: boolean;
  additionalStyles: string;
  round: boolean;
  calculateHidden: boolean;
  separation: boolean;
  useCurrencySign: boolean;
  currencySign: boolean;
  styles: { style: string };
  multiply: boolean;
  sign: string;
  fieldCurrency: boolean;
  fieldCurrencySettings: IFieldCurrencySettings;
  pricingStructure: PricingStructure;
  pricingRanges: IPricingRange[];
  badgeText: string;
  badgeVariant: BadgeVariant;
  badgeFormat: BadgeFormat;
}

export const quantitySettingsDraftDefaults = (): IQuantitySettingsDraft => {
  const defaults = quantityDefaults();

  return {
    label: String(defaults.label || ""),
    fieldName: String(defaults.fieldName || ""),
    placeholder: String(defaults.placeholder || ""),
    description: String(defaults.description || ""),
    min: String(defaults.min ?? 0),
    max: String(defaults.max ?? 100),
    step: String(defaults.step ?? 1),
    defaultValue: String(defaults.default ?? 0),
    width: Number(defaults.width || 100),
    required: Boolean(defaults.required),
    hidden: Boolean(defaults.hidden),
    addToSummary: Boolean(defaults.addToSummary),
    allowCurrency: Boolean(defaults.allowCurrency),
    allowRound: Boolean(defaults.allowRound),
    hideMinMax: Boolean(defaults.hideMinMax),
    buttonsPosition: defaults.buttonsPosition === "both" ? "both" : "right",
    unit: Number(defaults.unit ?? 1),
    unitPosition: defaults.unitPosition || "right",
    unitSymbol: String(defaults.unitSymbol || ""),
    enabled_currency_settings: Boolean(defaults.enabled_currency_settings),
    additionalStyles: String(defaults.additionalStyles || ""),
    round: false,
    calculateHidden: Boolean(defaults.calculateHidden),
    separation: Boolean(defaults.separation),
    useCurrencySign: Boolean(defaults.useCurrencySign),
    currencySign: false,
    styles: {
      style: String(defaults.styles?.style || "default"),
    },
    multiply: Boolean(defaults.multiply),
    sign: String(defaults.sign || ""),
    fieldCurrency: Boolean(defaults.fieldCurrency),
    fieldCurrencySettings: {
      ...DEFAULT_CURRENCY_SETTINGS,
      ...(defaults.fieldCurrencySettings || {}),
    },
    pricingStructure:
      (defaults.pricingStructure as PricingStructure) || "no_discounts",
    pricingRanges: defaults.pricingRanges
      ? defaults.pricingRanges.map((r) => ({ ...r }))
      : [{ minQty: 1, maxQty: 10, unitPrice: 20 }],
    badgeText: String(defaults.badgeText ?? "You save"),
    badgeVariant: (defaults.badgeVariant as BadgeVariant) || "outlined",
    badgeFormat: (defaults.badgeFormat as BadgeFormat) || "percent",
  };
};
