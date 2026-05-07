export interface IOrderFormFieldOption {
  optionText: string;
  optionValue?: string | number;
}

export type IOrderFormFieldAttributeValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>
  | IOrderFormFieldOption[]
  | Record<string, unknown>;

export interface IOrderFormFieldAttributes {
  [key: string]: IOrderFormFieldAttributeValue;
  options?: IOrderFormFieldOption[];
}

export interface IOrderFormRawField {
  name: string;
  type: string;
  icon: string;
  field_width: string | number;
  attributes: IOrderFormFieldAttributes;
}

export interface IOrderFormBuilderField {
  id?: number;
  tempId?: string;
  type: string;
  icon?: string;
  field_width: string | number;
  sort_id: number;
  attributes: IOrderFormFieldAttributes;
}

export interface IOrderFormEntity {
  id: number;
  name: string;
}

export interface IOrderFormManagerData {
  order_form_fields: IOrderFormRawField[];
  order_forms: IOrderFormEntity[];
  active_form_id: number | string | null;
  order_active_form_fields: IOrderFormBuilderField[];
}

export interface IOrderFormBootstrapData {
  order_form_manager: IOrderFormManagerData;
}
