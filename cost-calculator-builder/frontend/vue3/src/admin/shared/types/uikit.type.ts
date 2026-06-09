export type ButtonType =
  | "inherit"
  | "error"
  | "warning"
  | "primary"
  | "yellow-ghost"
  | "yellow"
  | "black"
  | "blue-ghost"
  | "green"
  | "blue"
  | "dark-blue"
  | "default"
  | "green-ghost"
  | "red-ghost"
  | "red";

export type ButtonSize = "xs" | "s" | "m" | "l" | "xl";

export interface IBadge {
  label?: string;
  type: "green" | "blue" | "purple";
}

export interface IButton {
  label?: string;
  size: ButtonSize;
  type?: ButtonType;
  iconLeft?: string;
  iconRight?: string;
  counter?: number;
  active?: boolean;
  disabled?: boolean;
  showOriginal?: boolean;
  textSize?: "xs" | "s" | "m" | "l" | "xl";
  textWeight?: "bold" | "medium" | "regular" | "thin";
}

export interface ICheckboxOption {
  label?: string;
  value: string | number | boolean;
  disabled?: boolean;
}

export type CheckboxModelValue =
  | Array<string | number | boolean>
  | string
  | number
  | boolean;

export interface ICheckbox {
  modelValue: CheckboxModelValue;
  label?: string;
  disabled?: boolean;
  template?: "columns" | "rows";
  options?: ICheckboxOption[];
  name?: string;
}

export interface ISubmenuItem {
  label: string;
  icon: string;
  type?: any;
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
}

export interface ISubmenu {
  items: ISubmenuItem[];
  position: { top?: number; left?: number; right?: number; bottom?: number };
}

export interface IInput {
  placeholder: string;
  iconLeft?: string;
  iconRight?: string;
  label?: string;
  border?: boolean;
  value?: string;
  required?: boolean;
  name?: string;
  variant?: string;
  disabled?: boolean;
  inputType?: string;
  onlyDigits?: boolean;
  allowDecimal?: boolean;
  max?: number;
  min?: number;
}

export interface ITextarea {
  placeholder: string;
  iconLeft?: string;
  iconRight?: string;
  label?: string;
  border?: boolean;
  value?: string;
  required?: boolean;
  name?: string;
  rows?: number;
  height?: string;
}

export type ITextSize = "xl" | "lx" | "l" | "m" | "mx" | "s" | "xs";
export type ITextWeight = "bold" | "medium" | "regular" | "thin";
export interface IText {
  text: string;
  size: ITextSize;
  weight: ITextWeight;
  showOriginal?: boolean;
}

export interface IToggle {
  modelValue: boolean;
  label?: string;
  disabled?: boolean;
  name?: string;
  size?: ITextSize;
  weight?: ITextWeight;
}

export interface IRange {
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
}

export interface IRadio {
  modelValue: string;
  label: string;
  options: IRadioOption[];
  name?: string;
  layout?: "row" | "column";
}

export interface IDropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface IDropdown {
  label?: string;
  items: IDropdownOption[];
  modelValue: string | number;
  required?: boolean;
  name?: string;
  variant?: string;
  showOriginal?: boolean;
}

export interface IRadioOption {
  label: string;
  value: string | number;
  disable?: boolean;
}

export interface INotice {
  type: "success" | "error" | "warning" | "info";
}

export interface IRepeaterField {
  key: string;
  placeholder: string;
  required: boolean;
  width: string;
}

export interface IRepeaterDropdownField {
  key: string;
  placeholder?: string;
  required: boolean;
  width: string;
  options:
    | IRepeaterDropdownSelectOption[]
    | ((
        row: Record<string, any>,
        rowIndex: number,
      ) => IRepeaterDropdownSelectOption[]);
}

export interface IRepeaterDropdownSelectOption {
  label: string;
  value: string | number;
}

export interface IMultiSelect {
  modelValue: any;
  label?: string;
  items: IMultiSelectOption[];
  name?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  maxItemsShown?: number;
}

export interface IMultiSelectOption {
  idx?: number;
  title?: string;
  alias?: string;
  value?: string | number | boolean;
  label?: string;
}

export interface IConfirmDialog {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmType?: ButtonType;
  cancelType?: ButtonType;
}

export interface IPaginatedSelectItem {
  id: string | number;
  label: string;
}

export interface IPaginatedSelect {
  modelValue: string | number | null | Array<string | number>;
  items: IPaginatedSelectItem[];
  multiselect?: boolean;
  hasMore?: boolean;
  label?: string;
  placeholder?: string;
  emptyMessage?: string;
  tooltip?: string;
  loading?: boolean;
  name?: string;
  perPageOptions?: number[];
}

export interface IProBannerLink {
  label: string;
  url: string;
}

export interface IProBanner {
  title: string;
  description: string;
  image: string;
  documentationLink: IProBannerLink;
  upgradeLink: IProBannerLink;
  watchVideoLink?: IProBannerLink;
  imageMaxWidth?: string;
  imageMaxHeight?: string;
}
