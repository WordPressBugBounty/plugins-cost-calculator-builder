import type { ISingleOptionsField } from "@/admin/shared/types/fields.type";
import { DEFAULT_CURRENCY_SETTINGS } from "./base";

const randomID = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const imageDropdownDefaults = (): Partial<ISingleOptionsField> => ({
  label: "",
  _id: null,
  default: "",
  description: "",
  required: false,
  nextTickCount: 0,
  hasNextTick: true,
  fieldDisabled: false,
  _event: "change",
  allowRound: false,
  additionalCss: "",
  additionalStyles: "",
  disableOptions: [],
  addToSummary: true,
  allowCurrency: false,
  calculateHidden: false,
  fieldCurrency: false,
  seperateCurrency: false,
  type: "Drop Down With Image",
  _tag: "cost-drop-down-with-image",
  icon: "ccb-icon-dropdown-2",
  alias: "dropDown_with_img_field_id_",
  desc_option: "after",
  summary_view: "show_value",
  options: [
    {
      src: null,
      optionText: "Option 1",
      optionValue: "10",
      id: `option_${randomID()}`,
    },
    {
      src: null,
      optionText: "Option 2",
      optionValue: "20",
      id: `option_${randomID()}`,
    },
    {
      src: null,
      optionText: "Option 3",
      optionValue: "30",
      id: `option_${randomID()}`,
    },
    {
      src: null,
      optionText: "Option 4",
      optionValue: "40",
      id: `option_${randomID()}`,
    },
  ],
  show_value_in_option: true,
  width: "100",
  fieldCurrencySettings: { ...DEFAULT_CURRENCY_SETTINGS },
});
