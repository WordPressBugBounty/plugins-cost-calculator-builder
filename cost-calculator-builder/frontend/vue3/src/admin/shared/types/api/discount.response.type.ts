import type {
  IDiscountResponse,
  IDiscountsCollection,
} from "@/admin/shared/types/discounts.type";

export interface IDiscountApiBaseResponse {
  success: boolean;
  message: string;
}

export interface IDiscountListResponse extends IDiscountApiBaseResponse {
  data: {
    discounts: IDiscountsCollection;
  };
}

export interface IDiscountPreviewResponse extends IDiscountApiBaseResponse {
  data: {
    discounts: IDiscountResponse[];
    has_promocode: boolean;
  };
}
