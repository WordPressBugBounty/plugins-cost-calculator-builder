import axios from "axios";
import {
  IDemoImportTotalRequestParams,
  IImportCustomTotalRequestParams,
  IImportRunRequestParams,
  IRunCalcUpdatesRequestParams,
} from "@/admin/shared/types/api/import.request.type";
import {
  IDemoImportTotalResponse,
  IImportCustomTotalResponse,
  IImportRunResponse,
  IRunCalcUpdatesResponse,
} from "@/admin/shared/types/api/import.response.type";

export class ImportExportAPI {
  private static getAjaxUrl(): string {
    return (window as any).ajaxurl || "/wp-admin/admin-ajax.php";
  }

  public static async getCustomImportTotal(
    params: IImportCustomTotalRequestParams,
  ): Promise<IImportCustomTotalResponse> {
    const { action, nonce, file, type = "single" } = params;
    const formData = new FormData();
    formData.append("action", action);
    formData.append("type", type);
    formData.append("file", file);
    formData.append("nonce", nonce);

    const response = await axios.post(this.getAjaxUrl(), formData);
    return response.data;
  }

  public static async getDemoImportTotal(
    params: IDemoImportTotalRequestParams,
  ): Promise<IDemoImportTotalResponse> {
    const payload = new URLSearchParams({
      action: params.action,
      nonce: params.nonce,
    });

    const response = await axios.post(this.getAjaxUrl(), payload);
    return response.data;
  }

  public static async runImport(
    params: IImportRunRequestParams,
  ): Promise<IImportRunResponse> {
    const payload = new URLSearchParams({
      action: params.action,
      step: params.step,
      key: String(params.key),
      nonce: params.nonce,
    });

    if (params.is_custom_import) {
      payload.append("is_custom_import", "true");
    }

    const response = await axios.post(this.getAjaxUrl(), payload);
    return response.data;
  }

  public static async runCalcUpdates(
    params: IRunCalcUpdatesRequestParams,
  ): Promise<IRunCalcUpdatesResponse> {
    const payload = new URLSearchParams({
      action: params.action,
      access: String(params.access),
      nonce: params.nonce,
    });

    const response = await axios.post(this.getAjaxUrl(), payload);
    return response.data;
  }
}
