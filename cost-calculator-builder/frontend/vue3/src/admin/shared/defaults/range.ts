import type {
  IRangeField,
  IFieldCurrencySettings,
} from "@/admin/shared/types/fields.type";
import { DEFAULT_CURRENCY_SETTINGS } from "./base";
import type {
  IPricingRange,
  PricingStructure,
  BadgeVariant,
  BadgeFormat,
} from "@/admin/features/builder/calculator/CalculatorFieldsSettings/usePricingRanges";

export const rangeDefaults = (): Partial<IRangeField> => ({
  step: 1,
  unit: 1,
  sign: "",
  label: "",
  _id: null,
  default: "",
  minValue: 0,
  maxValue: 100,
  description: "",
  _event: "change",
  additionalCss: "",
  allowRound: false,
  multiply: false,
  multipliedTotal: false,
  unitPosition: "right",
  unitSymbol: "",
  _tag: "cost-range",
  additionalStyles: "",
  addToSummary: true,
  allowCurrency: false,
  calculateHidden: false,
  fieldCurrency: false,
  type: "Range Button",
  icon: "ccb-icon-Union-5",
  alias: "range_field_id_",
  desc_option: "after",
  jump: false,
  scalePoints: "",
  pricingStructure: "no_discounts",
  pricingRanges: [{ minQty: 1, maxQty: 10, unitPrice: 20 }],
  badgeText: "You save",
  badgeVariant: "outlined",
  badgeFormat: "percent",
  styles: {
    style: "default",
  },
  width: "100",
  fieldCurrencySettings: { ...DEFAULT_CURRENCY_SETTINGS },
});

export interface IRangeSettingsDraft {
  label: string;
  fieldName: string;
  description: string;
  width: number;
  minValue: string;
  maxValue: string;
  step: string;
  defaultValue: string;
  sign: string;
  unitPosition: "left" | "right";
  multiply: boolean;
  unit: string;
  unitSymbol: string;
  multipliedTotal: boolean;
  jump: boolean;
  scalePoints: string;
  style:
    | "default"
    | "small"
    | "flat-minimal"
    | "modern"
    | "input"
    | "multi-point";
  allowCurrency: boolean;
  allowRound: boolean;
  hidden: boolean;
  calculateHidden: boolean;
  addToSummary: boolean;
  required: boolean;
  fieldCurrency: boolean;
  additionalClasses: string;
  useCurrencySign: boolean;
  fieldCurrencySettings: IFieldCurrencySettings;
  pricingStructure: PricingStructure;
  pricingRanges: IPricingRange[];
  badgeText: string;
  badgeVariant: BadgeVariant;
  badgeFormat: BadgeFormat;
}

export const rangeSettingsDraftDefaults = (): IRangeSettingsDraft => {
  const defaults = rangeDefaults();

  return {
    label: String(defaults.label || ""),
    fieldName: String(defaults.fieldName || ""),
    description: String(defaults.description || ""),
    width: Number(defaults.width || 100),
    minValue: String(defaults.minValue ?? 0),
    maxValue: String(defaults.maxValue ?? 100),
    step: String(defaults.step ?? 1),
    defaultValue: String(defaults.default ?? 0),
    sign: String(defaults.sign || ""),
    unitPosition: defaults.unitPosition || "right",
    multiply: Boolean(defaults.multiply),
    unit: String(defaults.unit ?? 1),
    unitSymbol: String(defaults.unitSymbol || ""),
    multipliedTotal: Boolean(defaults.multipliedTotal),
    jump: Boolean(defaults.jump),
    scalePoints: String(defaults.scalePoints || ""),
    style:
      defaults.styles?.style === "small" ||
      defaults.styles?.style === "flat-minimal" ||
      defaults.styles?.style === "modern" ||
      defaults.styles?.style === "input" ||
      defaults.styles?.style === "multi-point"
        ? defaults.styles.style
        : "default",
    allowCurrency: Boolean(defaults.allowCurrency),
    allowRound: Boolean(defaults.allowRound),
    hidden: Boolean(defaults.hidden),
    calculateHidden: Boolean(defaults.calculateHidden),
    addToSummary: Boolean(defaults.addToSummary),
    required: false,
    fieldCurrency: Boolean(defaults.fieldCurrency),
    additionalClasses: String(defaults.additionalStyles || ""),
    useCurrencySign: Boolean(defaults.useCurrencySign),
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
