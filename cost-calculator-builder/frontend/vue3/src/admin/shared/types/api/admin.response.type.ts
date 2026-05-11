import {
  ISettings,
  ITotalSummarySettings,
} from "@/admin/shared/types/settings.type";
import { IGeneralSettings } from "@/admin/shared/types/general-settings.type";
import { IConditionList } from "@/admin/shared/types/conditions.type";
import {
  ICalculatorRawFields,
  IPageBreaker,
} from "@/admin/shared/types/fields.type";
import { IOrderFormManagerData } from "@/admin/shared/types/order-form.type";
import type { IDiscountsCollection } from "@/admin/shared/types/discounts.type";

export interface ICalculatorBuilderData {
  title: string;
  id: number | string;
  fields: ICalculatorRawFields[];
  builder: IPageBreaker[];
  formula: any[]; // TODO: add type
}

export interface IAppearancePresetData {
  id: string;
  name: string;
  colors: string[];
}

export interface IAppearancePresetField {
  value?: any;
  [key: string]: unknown;
}

export interface IAppearancePresetBlock {
  data?: Record<string, IAppearancePresetField>;
  [key: string]: unknown;
}

export interface IAppearanceActivePreset {
  preset_key: string;
  desktop?: Record<string, IAppearancePresetBlock>;
  mobile?: Record<string, IAppearancePresetBlock>;
  [key: string]: unknown;
}

export interface IAppearanceData {
  presets: IAppearancePresetData[];
  active_preset: IAppearanceActivePreset;
  selected_preset_key: string;
}

export interface IGetCalculatorAdminDataResponse {
  success: boolean;
  message: string;
  data: {
    pro_active?: boolean;
    calculator_builder: ICalculatorBuilderData;
    settings: ISettings;
    total_summary: ITotalSummarySettings;
    general_settings: IGeneralSettings;
    conditions: IConditionList;
    order_form_manager: IOrderFormManagerData;
    appearance: IAppearanceData;
    discounts?: IDiscountsCollection;
    contact_forms?: { id: number; title: string }[];
    saved?: boolean;
  };
}

export interface ISaveCalculatorAdminDataResponse {
  success: boolean;
  message: string;
  data: {
    settings: ISettings;
    total_summary: ITotalSummarySettings;
    conditions: IConditionList;
  };
}

export interface ISaveCalculatorCustomAppearanceResponse {
  success: boolean;
  message: string;
  data: {
    appearance: IAppearanceData;
    presetIdx?: string;
    presets?: IAppearancePresetData[];
  };
}

export interface ISaveAsTemplateResponse {
  success: boolean;
  message?: string;
  calculators?: any[];
}
