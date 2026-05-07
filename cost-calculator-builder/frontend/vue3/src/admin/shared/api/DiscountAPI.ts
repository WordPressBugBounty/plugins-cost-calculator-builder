import axios from "axios";
import type {
  ICreateDiscountRequestParams,
  IDeleteDiscountRequestParams,
  IDuplicateDiscountRequestParams,
  IFetchDiscountsRequestParams,
  IPreviewDiscountsRequestParams,
  IUpdateDiscountRequestParams,
} from "@/admin/shared/types/api/discount.request.type";
import type {
  IDiscountListResponse,
  IDiscountPreviewResponse,
} from "@/admin/shared/types/api/discount.response.type";

export class DiscountAPI {
  private static getAjaxUrl(): string {
    return (
      (window as { ajaxurl?: string }).ajaxurl || "/wp-admin/admin-ajax.php"
    );
  }

  public static async fetchDiscounts(
    params: IFetchDiscountsRequestParams,
  ): Promise<IDiscountListResponse> {
    const response = await axios.get(this.getAjaxUrl(), {
      params: {
        action: params.action,
        nonce: params.nonce,
        calc_id: params.calc_id,
        ...params.pagination,
      },
    });

    return response.data;
  }

  public static async createDiscount(
    params: ICreateDiscountRequestParams,
  ): Promise<IDiscountListResponse> {
    return this.postContent<IDiscountListResponse>({
      action: params.action,
      nonce: params.nonce,
      payload: {
        calc_id: params.calc_id,
        pagination: params.pagination,
        discount: params.discount,
      },
    });
  }

  public static async updateDiscount(
    params: IUpdateDiscountRequestParams,
  ): Promise<IDiscountListResponse> {
    return this.postContent<IDiscountListResponse>({
      action: params.action,
      nonce: params.nonce,
      payload: {
        calc_id: params.calc_id,
        discount_id: params.discount_id,
        pagination: params.pagination,
        discount: params.discount,
      },
    });
  }

  public static async deleteDiscount(
    params: IDeleteDiscountRequestParams,
  ): Promise<IDiscountListResponse> {
    return this.postContent<IDiscountListResponse>({
      action: params.action,
      nonce: params.nonce,
      payload: {
        calc_id: params.calc_id,
        discount_id: params.discount_id,
        discount_ids: params.discount_ids,
        pagination: params.pagination,
      },
    });
  }

  public static async duplicateDiscount(
    params: IDuplicateDiscountRequestParams,
  ): Promise<IDiscountListResponse> {
    return this.postContent<IDiscountListResponse>({
      action: params.action,
      nonce: params.nonce,
      payload: {
        calc_id: params.calc_id,
        discount_id: params.discount_id,
        discount_ids: params.discount_ids,
        pagination: params.pagination,
      },
    });
  }

  public static async previewDiscounts(
    params: IPreviewDiscountsRequestParams,
  ): Promise<IDiscountPreviewResponse> {
    const response = await axios.get(this.getAjaxUrl(), {
      params: {
        action: params.action,
        nonce: params.nonce,
        calc_id: params.calc_id,
      },
    });

    return response.data;
  }

  private static async postContent<T>({
    action,
    nonce,
    payload,
  }: {
    action: string;
    nonce: string;
    payload: Record<string, unknown>;
  }): Promise<T> {
    const body = new URLSearchParams();
    body.set("action", action);
    body.set("nonce", nonce);
    body.set("content", JSON.stringify(payload));

    const response = await axios.post(this.getAjaxUrl(), body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  }
}
