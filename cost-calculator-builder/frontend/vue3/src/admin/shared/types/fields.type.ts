export interface ICalculatorRawFields {
  alias: string;
  description: string;
  icon: string;
  name: string;
  sort_type: string;
  tag: string;
  type: string;
  width: number;
}

// --- Shared / Helper Types ---

export interface IOptions {
  optionText: string;
  optionValue: string;
  optionConverted?: string;
  optionHint?: string;
  src?: string | null;
  icon?: string;
  id?: string;
}

export interface IFieldCurrencySettings {
  currency: string;
  num_after_integer: number;
  decimal_separator: string;
  thousands_separator: string;
  currencyPosition: string;
  seperateCurrency?: boolean;
}

export interface IStyles {
  elementColumns?: string;
  box_style?: string;
  style?: string;
  iconPath?: string;
  applyToAll?: boolean;
  text_color?: string;
  background_color?: string;
}

export type SummaryView =
  | "show_value"
  | "show_label_not_calculable"
  | "show_label_calculable";

// --- Base Field ---

export interface IBaseField {
  id: number;
  label: string;
  fieldName: string;
  alias: string;
  hidden: boolean;
  type: string;
  _id: string | number | null;
  _tag: string;
  icon: string;
  pageId: string;
  sectionId: string;
  index: number;
  width: string | number;
  rowBreak?: boolean;
  text?: string;
  _event?: string;
  additionalCss?: string;
  additionalStyles?: string;
  description?: string;
  placeholder?: string;
  desc_option?: "after" | "before";
  useCurrencySign?: boolean;
  fieldCurrency?: boolean;
  fieldCurrencySettings?: IFieldCurrencySettings;
  letter?: string;
}

// --- Total Field ---

export interface ITotalField extends IBaseField {
  currency: string;
  costCalcFormula: string;
  formulaFieldView: boolean;
  formulaView: boolean;
  legacyFormula: string;
  fieldCurrency: boolean;
  calculateHidden: boolean;
  advancedJsCalculation: boolean;
  fieldCurrencySettings?: IFieldCurrencySettings;
}

// --- Input Fields ---

export interface IQuantityField extends IBaseField {
  unit: number;
  sign: string;
  min: number;
  max: number;
  default: string | number;
  placeholder: string;
  required: boolean;
  allowRound: boolean;
  addToSummary: boolean;
  calculateHidden: boolean;
  allowCurrency: boolean;
  fieldCurrency: boolean;
  multiply: boolean;
  hideMinMax: boolean;
  unitPosition: "left" | "right";
  unitSymbol: string;
  enabled_currency_settings: boolean;
  step: number;
  separation: boolean;
  buttonsPosition: "right" | "both";
  styles: { style: string };
  fieldCurrencySettings?: IFieldCurrencySettings;
  pricingStructure: string;
  pricingRanges: { minQty: number; maxQty: number; unitPrice: number }[];
  badgeText: string;
  badgeVariant: string;
  badgeFormat: string;
}

export interface IRangeField extends IBaseField {
  step: number;
  unit: number;
  sign: string;
  default: string | number;
  minValue: number;
  maxValue: number;
  allowRound: boolean;
  multiply: boolean;
  multipliedTotal: boolean;
  unitPosition: "left" | "right";
  unitSymbol: string;
  addToSummary: boolean;
  allowCurrency: boolean;
  calculateHidden: boolean;
  fieldCurrency: boolean;
  jump: boolean;
  scalePoints: string;
  styles: { style: string };
  fieldCurrencySettings?: IFieldCurrencySettings;
  pricingStructure: string;
  pricingRanges: { minQty: number; maxQty: number; unitPrice: number }[];
  badgeText: string;
  badgeVariant: string;
  badgeFormat: string;
}

export interface IMultiRangeField extends IRangeField {
  default_left: number;
  default_right: number;
}

export interface ITextField extends IBaseField {
  placeholder: string;
}

export interface IValidationFormField extends IBaseField {
  field_type: "email" | "phone" | "name" | "website_url";
  default: string | number;
  addToSummary: boolean;
}

// --- Selection Fields ---

export interface ISingleOptionsField extends IBaseField {
  default: string | number;
  required: boolean;
  allowRound: boolean;
  addToSummary: boolean;
  allowCurrency: boolean;
  calculateHidden: boolean;
  fieldCurrency: boolean;
  hasNextTick: boolean;
  fieldDisabled?: boolean;
  nextTickCount: number;
  disableOptions: number[];
  summary_view: SummaryView;
  show_value_in_option?: boolean;
  apply_style_for_all: boolean;
  options: IOptions[];
  styles?: IStyles;
  fieldCurrencySettings?: IFieldCurrencySettings;
  onValue?: string | number | null;
  seperateCurrency?: boolean;
}

export interface IMultiOptionsField extends IBaseField {
  default: string | number;
  required: boolean;
  allowRound: boolean;
  addToSummary: boolean;
  allowCurrency: boolean;
  calculateHidden: boolean;
  fieldCurrency: boolean;
  checkedLength: number;
  minChecked?: number;
  hasNextTick: boolean;
  nextTickCount: number;
  disableOptions: number[];
  summary_view: SummaryView;
  show_value_in_option?: boolean;
  apply_style_for_all: boolean;
  options: IOptions[];
  styles?: IStyles;
  fieldCurrencySettings?: IFieldCurrencySettings;
}

export type IRadioField = ISingleOptionsField;
export type IDropdownField = ISingleOptionsField;
export type IImageRadioField = ISingleOptionsField;
export type IImageDropdownField = ISingleOptionsField;
export type ICheckboxField = IMultiOptionsField;
export type IToggleField = IMultiOptionsField;
export type IImageCheckboxField = IMultiOptionsField;

// --- Date / Time Fields ---

export interface IPeriod {
  start: string | null;
  end: string | null;
}

export interface INotAllowedDates {
  period: IPeriod[];
  all_past: boolean;
  current: boolean;
  days_from_current: boolean;
}

export interface IDatePickerField extends IBaseField {
  range: string | boolean;
  placeholder: string;
  addToSummary: boolean;
  allowCurrency: boolean;
  calculateHidden: boolean;
  fieldCurrency: boolean;
  is_have_unselectable: boolean;
  not_allowed_week_days: number[];
  not_allowed_dates: INotAllowedDates;
  days_from_current: number;
  day_price: number;
  day_price_enabled: boolean;
  autoclose_enabled: boolean;
  calculate_unselectable_days: boolean;
  fieldCurrencySettings?: IFieldCurrencySettings;
}

export interface ITimePickerField extends IBaseField {
  range: string | boolean;
  placeholderHours: string;
  placeholderTime: string;
  format: boolean;
  addToSummary: boolean;
  min_interval: string;
  min_interval_minutes?: number;
  use_interval: boolean;
}

// --- Special Fields ---

export interface IHtmlField extends IBaseField {
  htmlContent: string;
  placeholder?: string;
  additionalStyles?: string;
}

export interface IDividerField extends IBaseField {
  len: string;
  size: string;
  style: string;
  placeholder?: string;
}

export interface IFileUploadField extends IBaseField {
  addToSummary: boolean;
  allowCurrency: boolean;
  calculateHidden: boolean;
  fieldCurrency: boolean;
  uploadFromUrl: boolean;
  seperateCurrency: boolean;
  fileFormats: string[];
  max_attached_files: number;
  max_file_size: number | false;
  price: number;
  required: boolean;
  calculatePerEach: boolean;
  allowPrice: boolean;
  fieldCurrencySettings?: IFieldCurrencySettings;
}

export interface IGeolocationMultiplyLocation {
  coordinates: string;
  label: string;
  addressName: string;
}

export interface IGeolocationDistanceCost {
  from: number;
  to: number;
  cost: number;
}

export interface IGeolocationLastDistanceCost {
  from: number;
  cost: number;
}

export interface IGeolocationField extends IBaseField {
  measure: string;
  placeholder?: string;
  geoType: string;
  costDistance: boolean;
  userLocation: string | number[];
  userAddress: string;
  pricingType: string;
  eachCost: number;
  multiplyLocations: IGeolocationMultiplyLocation[];
  distanceCostList: IGeolocationDistanceCost[];
  lastDistanceCost: IGeolocationLastDistanceCost;
  selectedPoint: object;
  required: boolean;
  addToSummary: boolean;
  allowCurrency: boolean;
  additionalStyles?: string;
  disabled?: boolean;
  descriptionPosition?: "before" | "after";
  description?: string;
}

// --- Container / Structural Fields ---

export interface IRepeaterField extends IBaseField {
  addButtonLabel: string;
  removeButtonLabel: string;
  repeatCount: string | number;
  formulaView: boolean;
  enableFormula: boolean;
  costCalcFormula: string;
  groupElements: IField[];
  sumAllAvailable: boolean;
  hasNextTick: boolean;
  nextTickCount: number;
  collapseOnAddAnother: boolean;
}

export interface IGroupField extends IBaseField {
  collapsible: boolean;
  collapse: boolean;
  accordion: boolean;
  showTitle: boolean;
  groupElements: IField[];
  hasNextTick: boolean;
  nextTickCount: number;
}

// --- Field Union Type ---

export type IField =
  | ITotalField
  | IQuantityField
  | IRangeField
  | IMultiRangeField
  | ISingleOptionsField
  | IMultiOptionsField
  | IDatePickerField
  | ITimePickerField
  | ITextField
  | IHtmlField
  | IDividerField
  | IFileUploadField
  | IGeolocationField
  | IValidationFormField
  | IRepeaterField
  | IGroupField;

// --- Builder Structure ---

export interface ISection {
  fields: IField[];
  alias: string;
  description: string;
  label: string;
  letter: string;
  type: string;
  _id: number;
  hidden?: boolean;
  showName?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  styles?: IStyles;
}

export interface IPageBreaker {
  alias: string;
  description: string;
  groupElements: ISection[];
  label: string;
  letter: string;
  type: string;
  _id: number;
  previousBtnLabel?: string;
  nextBtnLabel?: string;
  condition?: string;
  conditions?: object[];
  boxStyle?: string;
  action?: string;
  pageTo?: string;
}

export interface ITotalForSettings {
  alias: string;
  title: string;
  pageId: string;
  sectionId: string;
  idx: number;
}
