import {
  IOrderFormBuilderField,
  IOrderFormEntity,
} from "@/admin/shared/types/order-form.type";

export interface IOrderFormApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface IApplyFormIdData {
  order_form_fields: IOrderFormBuilderField[];
}

export interface IApplyFormIdResponse
  extends IOrderFormApiResponse<IApplyFormIdData> {}

export interface ICreateOrDuplicateFormData {
  forms: IOrderFormEntity[];
  active_fields: IOrderFormBuilderField[];
  form_id: number;
}

export interface IDeleteFormData {
  forms: IOrderFormEntity[];
  form_id: number;
  active_form_id: number;
  active_fields: IOrderFormBuilderField[];
}

export interface IUpdateFormData {
  form_fields: IOrderFormBuilderField[];
}
