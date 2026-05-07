import type { ITotalField } from "@/admin/shared/types/fields.type";
import { DEFAULT_CURRENCY_SETTINGS } from "./base";

export const totalDefaults = (): Partial<ITotalField> => ({
  _id: null,
  currency: "$",
  type: "Total",
  additionalCss: "",
  _tag: "cost-total",
  costCalcFormula: "",
  additionalStyles: "",
  alias: "total_field_id_",
  icon: "ccb-icon-Path-3516",
  label: "",
  formulaFieldView: false,
  letter: "",
  formulaView: false,
  legacyFormula: "",
  fieldCurrency: false,
  calculateHidden: false,
  advancedJsCalculation: false,
  description: "",
  fieldCurrencySettings: { ...DEFAULT_CURRENCY_SETTINGS },
});
