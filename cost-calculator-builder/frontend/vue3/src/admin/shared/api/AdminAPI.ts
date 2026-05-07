import axios from "axios";
import {
  IGetCalculatorAdminDataRequestParams,
  ISaveCalculatorAdminDataRequestParams,
  ISaveCalculatorCustomAppearanceRequestParams,
  ISaveAsTemplateRequestParams,
} from "@/admin/shared/types/api/admin.request.type";
import {
  IGetCalculatorAdminDataResponse,
  ISaveCalculatorAdminDataResponse,
  ISaveCalculatorCustomAppearanceResponse,
  ISaveAsTemplateResponse,
} from "@/admin/shared/types/api/admin.response.type";

export class AdminAPI {
  public static async getCalculatorAdminData(
    params: IGetCalculatorAdminDataRequestParams,
  ): Promise<IGetCalculatorAdminDataResponse> {
    const { action, nonce, calc_id, discount } = params;

    const ajaxUrl =
      (window as { ajaxurl?: string }).ajaxurl || "/wp-admin/admin-ajax.php";

    try {
      const response = await axios.get(ajaxUrl, {
        params: {
          action,
          nonce,
          calc_id,
          ...(discount ? { discount } : {}),
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      throw error;
    }
  }

  public static async saveCalculatorAdminData(
    params: ISaveCalculatorAdminDataRequestParams,
  ): Promise<ISaveCalculatorAdminDataResponse> {
    const {
      action,
      nonce,
      id,
      title,
      status,
      settings,
      total_summary,
      conditions,
      builder,
    } = params;

    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

    try {
      const response = await axios.post(
        `${ajaxUrl}?action=${action}&nonce=${nonce}`,
        {
          id,
          title,
          status,
          settings,
          total_summary,
          conditions,
          builder,
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      throw error;
    }
  }

  public static async saveCalculatorCustomAppearance(
    params: ISaveCalculatorCustomAppearanceRequestParams,
  ): Promise<ISaveCalculatorCustomAppearanceResponse> {
    const { action, nonce, id, selectedIdx, appearance } = params;
    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

    const payload = new URLSearchParams({
      action,
      nonce,
      id: String(id),
      selectedIdx,
      content: JSON.stringify({ appearance }),
    });

    try {
      const response = await axios.post(ajaxUrl, payload);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      throw error;
    }
  }

  public static async saveAsTemplate(
    params: ISaveAsTemplateRequestParams,
  ): Promise<ISaveAsTemplateResponse> {
    const { action, nonce, calc_id, title, category } = params;
    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

    try {
      const response = await axios.post(
        `${ajaxUrl}?action=${action}&nonce=${nonce}`,
        { calc_id, title, category },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      throw error;
    }
  }
}
