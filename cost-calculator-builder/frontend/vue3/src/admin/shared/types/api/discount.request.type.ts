import type {
  IDiscountForm,
  IDiscountListParams,
} from "@/admin/shared/types/discounts.type";

export interface IDiscountsBaseRequestParams {
  action: string;
  nonce: string;
  calc_id: number;
}

export interface IFetchDiscountsRequestParams
  extends IDiscountsBaseRequestParams {
  pagination: IDiscountListParams;
}

export interface ICreateDiscountRequestParams
  extends IDiscountsBaseRequestParams {
  discount: IDiscountForm;
  pagination: IDiscountListParams;
}

export interface IUpdateDiscountRequestParams
  extends IDiscountsBaseRequestParams {
  discount_id: number;
  discount: IDiscountForm;
  pagination: IDiscountListParams;
}

export interface IDeleteDiscountRequestParams
  extends IDiscountsBaseRequestParams {
  discount_id?: number;
  discount_ids?: number[];
  pagination: IDiscountListParams;
}

export interface IDuplicateDiscountRequestParams
  extends IDiscountsBaseRequestParams {
  discount_id?: number;
  discount_ids?: number[];
  pagination: IDiscountListParams;
}

export interface IPreviewDiscountsRequestParams
  extends IDiscountsBaseRequestParams {}
