import axios from "axios";
import {
  IFetchCalculatorsRequestParams,
  IFetchTemplatesRequestParams,
  ICreateCalculatorRequestParams,
  IEditCalculatorRequestParams,
  IUseTemplateRequestParams,
  IDeleteTemplateRequestParams,
  IDeleteCalculatorsRequestParams,
  IDuplicateCalculatorsRequestParams,
  IAddFavoriteTemplateRequestParams,
} from "@/admin/shared/types/api/flow.request.type";
import {
  IFetchCalculatorsResponse,
  IFetchTemplatesResponse,
  ICreateCalculatorResponse,
  IEditCalculatorResponse,
  IUseTemplateResponse,
  IDeleteTemplateResponse,
  IDeleteCalculatorsResponse,
  IDuplicateCalculatorsResponse,
  IAddFavoriteTemplateResponse,
} from "@/admin/shared/types/api/flow.response.type";

export class FlowAPI {
  public static async fetchTemplates(
    params: IFetchTemplatesRequestParams,
  ): Promise<IFetchTemplatesResponse> {
    const { action, nonce } = params;

    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

    try {
      const response = await axios.get(
        `${ajaxUrl}?action=${action}&nonce=${nonce}`,
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

  public static async fetchCalculators(
    data: IFetchCalculatorsRequestParams,
  ): Promise<IFetchCalculatorsResponse> {
    const { action, nonce, params } = data;
    const { limit, page, sortBy, direction } = params;

    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

    const urlParams = new URLSearchParams({
      action,
      nonce,
      limit: limit.toString(),
      page: page.toString(),
      sort_by: sortBy,
      direction: direction,
    });

    try {
      const response = await axios.get(`${ajaxUrl}?${urlParams.toString()}`);
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

  public static async createCalculator(
    data: ICreateCalculatorRequestParams,
  ): Promise<ICreateCalculatorResponse> {
    const { action, nonce } = data;

    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

    try {
      const response = await axios.post(
        `${ajaxUrl}?action=${action}&nonce=${nonce}`,
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

  public static async editCalculator(
    data: IEditCalculatorRequestParams,
  ): Promise<IEditCalculatorResponse> {
    const { action, nonce, id } = data;

    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

    try {
      const response = await axios.get(
        `${ajaxUrl}?action=${action}&nonce=${nonce}&id=${id}`,
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

  public static async useTemplate(
    data: IUseTemplateRequestParams,
  ): Promise<IUseTemplateResponse> {
    const { action, nonce, template_id } = data;

    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

    const requestData = {
      template_id,
    };

    try {
      const response = await axios.post(
        `${ajaxUrl}?action=${action}&nonce=${nonce}`,
        requestData,
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

  public static async deleteTemplate(
    data: IDeleteTemplateRequestParams,
  ): Promise<IDeleteTemplateResponse> {
    const { action, nonce, id } = data;

    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

    const urlParams = new URLSearchParams({
      action,
      nonce,
      template_id: id.toString(),
    });

    try {
      const response = await axios.get(`${ajaxUrl}?${urlParams.toString()}`);
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

  public static async deleteCalculators(
    data: IDeleteCalculatorsRequestParams,
  ): Promise<IDeleteCalculatorsResponse> {
    const { action, nonce, ids } = data;

    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

    try {
      const response = await axios.post(
        `${ajaxUrl}?action=${action}&nonce=${nonce}&ids=${ids.join(",")}`,
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

  public static async duplicateCalculators(
    data: IDuplicateCalculatorsRequestParams,
  ): Promise<IDuplicateCalculatorsResponse> {
    const { action, nonce, ids } = data;

    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

    try {
      const response = await axios.post(
        `${ajaxUrl}?action=${action}&nonce=${nonce}&ids=${ids.join(",")}`,
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

  public static async addFavoriteTemplate(
    data: IAddFavoriteTemplateRequestParams,
  ): Promise<IAddFavoriteTemplateResponse> {
    const { action, nonce, template_id } = data;

    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";
    const requestData = {
      template_id,
    };

    try {
      const response = await axios.post(
        `${ajaxUrl}?action=${action}&nonce=${nonce}`,
        requestData,
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
