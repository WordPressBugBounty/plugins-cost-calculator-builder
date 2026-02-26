import { OrdersAPI } from "@/orders/shared/api/OrdersAPI";
import { IPdfSettingsRequestParams } from "@/orders/shared/types/api/request.type";
import { IFetchPdfSettingsResponse } from "@/orders/shared/types/api/response.type";

export async function fetchPdfSettings(
  params: IPdfSettingsRequestParams,
): Promise<IFetchPdfSettingsResponse> {
  return await OrdersAPI.fetchPdfSettings(params);
}
