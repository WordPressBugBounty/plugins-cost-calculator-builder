export interface IBaseOrderFormRequestParams {
  action: string;
  nonce: string;
}

export interface IGetFormsListRequestParams
  extends IBaseOrderFormRequestParams {}

export interface IGetActiveFormFieldsRequestParams
  extends IBaseOrderFormRequestParams {
  form_id: number;
}

export interface IApplyFormIdRequestParams extends IBaseOrderFormRequestParams {
  calc_id: number;
  form_id: number;
}

export interface ICreateDefaultFormRequestParams
  extends IBaseOrderFormRequestParams {}

export interface IDuplicateFormRequestParams
  extends IBaseOrderFormRequestParams {
  form_id: number;
}

export interface IDeleteFormRequestParams extends IBaseOrderFormRequestParams {
  form_id: number;
  calc_id: number;
}

export interface IUpdateFormRequestParams extends IBaseOrderFormRequestParams {
  form_id: number;
  form_name: string;
  form_builder_data: string;
}
