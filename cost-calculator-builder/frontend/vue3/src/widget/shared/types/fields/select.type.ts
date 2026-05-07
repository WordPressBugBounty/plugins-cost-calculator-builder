import {
  IBaseField,
  IOptions,
  SummaryView,
  IStyles,
} from "@/widget/shared/types/fields/base.type";

export interface ISingleOptionsField extends IBaseField {
  options: IOptions[];
  extraDisplayView?: string;
  selectedOption?: IOptions;
  summaryView: SummaryView;
  styles: IStyles | undefined;
  round: boolean;
  showValueInOption: boolean;
  disableOptions: number[];
  selectValue?: string | number;
}

export interface IMultiOptionsField extends Omit<IBaseField, "displayValue"> {
  options: IOptions[];
  extraDisplayView?: string;
  selectedOption?: IOptions[];
  summaryView: SummaryView;
  displayValue: string | string[];
  styles: IStyles | undefined;
  round: boolean;
  minAllowedOptions: number;
  maxAllowedOptions: number;
  disableOptions: number[];
  showValueInOption: boolean;
  showPrice?: boolean;
  priceValue?: string | number;
  checkedLength?: number;
}

export type FieldWithMultipleDisplayView =
  | IMultiOptionsField
  | ISingleOptionsField;

export type IRadioField = ISingleOptionsField;
export type IDropdownField = ISingleOptionsField;
export type IImageRadioField = ISingleOptionsField;
export type IImageDropdownField = ISingleOptionsField;
export type ICheckboxField = IMultiOptionsField;
export type IToggleField = IMultiOptionsField;
export type IImageCheckboxField = IMultiOptionsField;
