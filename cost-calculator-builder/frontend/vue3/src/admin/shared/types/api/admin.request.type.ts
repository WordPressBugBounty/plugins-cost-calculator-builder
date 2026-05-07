import {
  ISettings,
  ITotalSummarySettings,
} from "@/admin/shared/types/settings.type";
import { IConditionList } from "@/admin/shared/types/conditions.type";
import { IPageBreaker } from "@/admin/shared/types/fields.type";
import type { IAppearanceActivePreset } from "@/admin/shared/types/api/admin.response.type";
import type { IDiscountListParams } from "@/admin/shared/types/discounts.type";

export interface IGetCalculatorAdminDataRequestParams {
  action: string;
  nonce: string;
  calc_id: number;
  discount?: IDiscountListParams;
}

export interface ISaveCalculatorAdminDataRequestParams {
  action: string;
  nonce: string;
  id: number;
  title: string;
  status: string;
  settings: ISettings | null;
  total_summary: ITotalSummarySettings | null;
  conditions: IConditionList | null;
  builder: IPageBreaker[];
}

export interface ISaveCalculatorCustomAppearanceRequestParams {
  action: string;
  nonce: string;
  id: number;
  selectedIdx: string;
  appearance: IAppearanceActivePreset;
}

export interface ISaveAsTemplateRequestParams {
  action: string;
  nonce: string;
  calc_id: number;
  title: string;
  category: string;
}
