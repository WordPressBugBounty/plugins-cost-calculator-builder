import { OrdersAPI } from "@/orders/shared/api/OrdersAPI";
import { ISendToEmailRequestParams } from "@/orders/shared/types/api/request.type";
import { ISendToEmailResponse } from "@/orders/shared/types/api/response.type";

export async function sendToEmail(
  params: ISendToEmailRequestParams,
): Promise<ISendToEmailResponse> {
  return await OrdersAPI.sendToEmail(params);
}
