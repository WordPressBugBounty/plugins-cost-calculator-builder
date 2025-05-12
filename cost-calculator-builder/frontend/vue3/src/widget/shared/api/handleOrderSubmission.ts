import { SubmitsAPI } from "@/widget/shared/api/SubmitsAPI.ts";
import { ISubmitsRequestParams } from "@/widget/shared/types/orders";

export async function handleSubmissionRequest<T>(
  params: ISubmitsRequestParams,
): Promise<T> {
  return await SubmitsAPI.makeRequest(params);
}
