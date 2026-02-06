import { AllowedGroupingsKeys } from "@/analytics/shared/utils/periods";
import { Period } from "@/analytics/shared/types/analytics/analyticsStore.type";

export interface ICalculatorsRequestParams {
  action: string;
  nonce: string;
}

export interface IAnalyticsRequestParams extends ICalculatorsRequestParams {
  data: {
    [key: string]: AllowedGroupingsKeys | Period | number | string | undefined;
  };
}
