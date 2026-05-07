import axios from "axios";
import {
  IApplyFormIdRequestParams,
  ICreateDefaultFormRequestParams,
  IDeleteFormRequestParams,
  IDuplicateFormRequestParams,
  IGetActiveFormFieldsRequestParams,
  IGetFormsListRequestParams,
  IUpdateFormRequestParams,
} from "@/admin/shared/types/api/order-form.request.type";
import {
  IApplyFormIdResponse,
  ICreateOrDuplicateFormData,
  IDeleteFormData,
  IOrderFormApiResponse,
  IUpdateFormData,
} from "@/admin/shared/types/api/order-form.response.type";
import {
  IOrderFormBootstrapData,
  IOrderFormBuilderField,
  IOrderFormEntity,
  IOrderFormManagerData,
} from "@/admin/shared/types/order-form.type";

export class OrderFormAPI {
  private static getAjaxUrl(): string {
    return (window as any).ajaxurl || "/wp-admin/admin-ajax.php";
  }

  public static async getFormsList(
    params: IGetFormsListRequestParams,
  ): Promise<IOrderFormApiResponse<IOrderFormEntity[]>> {
    const response = await axios.get(this.getAjaxUrl(), { params });
    return response.data;
  }

  public static async getActiveFormFields(
    params: IGetActiveFormFieldsRequestParams,
  ): Promise<IOrderFormApiResponse<IOrderFormBuilderField[]>> {
    const response = await axios.get(this.getAjaxUrl(), { params });
    return response.data;
  }

  public static async applyFormId(
    params: IApplyFormIdRequestParams,
  ): Promise<IApplyFormIdResponse> {
    const response = await axios.get(this.getAjaxUrl(), { params });
    return response.data;
  }

  public static async createDefaultForm(
    params: ICreateDefaultFormRequestParams,
  ): Promise<IOrderFormApiResponse<ICreateOrDuplicateFormData>> {
    const response = await axios.get(this.getAjaxUrl(), { params });
    return response.data;
  }

  public static async duplicateForm(
    params: IDuplicateFormRequestParams,
  ): Promise<IOrderFormApiResponse<ICreateOrDuplicateFormData>> {
    const response = await axios.get(this.getAjaxUrl(), { params });
    return response.data;
  }

  public static async deleteForm(
    params: IDeleteFormRequestParams,
  ): Promise<IOrderFormApiResponse<IDeleteFormData>> {
    const response = await axios.get(this.getAjaxUrl(), { params });
    return response.data;
  }

  public static async updateForm(
    params: IUpdateFormRequestParams,
  ): Promise<IOrderFormApiResponse<IUpdateFormData>> {
    const body = new URLSearchParams();
    body.set("action", params.action);
    body.set("nonce", params.nonce);
    body.set("form_id", String(params.form_id));
    body.set("form_name", params.form_name);
    body.set("form_builder_data", params.form_builder_data);

    const response = await axios.post(this.getAjaxUrl(), body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  }

  public static mapBootstrapData(
    data: IOrderFormBootstrapData,
  ): IOrderFormManagerData {
    const activeFields = data.order_form_manager.order_active_form_fields || [];

    return {
      order_form_fields: data.order_form_manager.order_form_fields || [],
      order_forms: data.order_form_manager.order_forms || [],
      active_form_id: data.order_form_manager.active_form_id ?? null,
      order_active_form_fields: activeFields,
    };
  }
}
