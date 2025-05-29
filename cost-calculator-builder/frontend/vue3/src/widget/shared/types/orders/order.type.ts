import { Field } from "@/widget/shared/types/fields";

export type PaymentMethods =
  | "cash_payment"
  | "no_payments"
  | "stripe"
  | "razorpay"
  | "paypal"
  | "woocommerce";

export type IOrderDetailsType = Array<
  IOrderDetailsHelperResult | IRepeaterOrderDetailsHelperResult
>;

export interface IOrderData {
  orderId?: number;
  id: number;
  calcName: string;
  status: "pending" | "complete";
  promocodes: string[];
  orderDetails: IOrderDetailsType;
  hiddenOrderDetails: IOrderDetailsType;
  formDetails: any;
  paymentMethod: PaymentMethods;
  descriptions: Field[];
  paymentMethodId?: string;
  paymentIntentId?: string;
  paymentCurrency?: string;
  isPaymentAfterSubmit?: boolean;
  product_id?: number;
  captcha?: {
    captchaSend: boolean;
    token: string;
  };
}

export interface ICompleteOrderData {
  orderId: number;
  status?: string;
  paymentCurrency?: string;
}

export interface IFileData {
  alias: string;
  files: File[];
  inRepeater: boolean;
}

export interface ISubmitsRequestParams {
  action: string;
  nonce: string;
  data: IOrderData | ICompleteOrderData;
  files?: IFileData[];
}

export interface IOrderDetailsHelperResult {
  alias: string;
  title: string;
  value: string | string[];
  addToSummary: boolean;
  temps?: string[];
  options?: {
    label: string;
    value: string;
    converted: string;
  }[];
  summary_value?: string | string[];
  summary_view?: string;
  extraView?: string;
  option_unit?: string;
  originalValue: number;
}

export interface IRepeaterOrderDetailsHelperResult {
  alias: string;
  groupTitle: string;
  groupElements: IOrderDetailsType;
  length: number;
}

export interface IOrderDetails {
  fields: IOrderDetailsType;
  hiddenFields: IOrderDetailsType;
}
