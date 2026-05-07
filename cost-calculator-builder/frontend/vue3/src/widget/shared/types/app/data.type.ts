import { AppearanceStore } from "@/widget/app/providers/stores/appearanceStore";
import { IConditionList } from "@/widget/shared/types/app/conditions.type";
import { ISourceField } from "@/widget/shared/types/fields";
import { IDiscount } from "@/widget/shared/types/discounts";
import { ITranslations } from "./translations.type";

export interface ITotalSummaryItemOptions {
  title?: string;
  default_state?: "expanded" | "collapsed";
  defaultState?: "expanded" | "collapsed";
  show_zero_values?: boolean;
  showZeroValues?: boolean;
  cost_breakdown?: boolean;
  costBreakdown?: boolean;
  width?: number;
  layout?: "horizontal" | "vertical";
}

export interface ITotalSummaryItem {
  id: string;
  alias: string;
  options: ITotalSummaryItemOptions;
}

export interface ITotalSummarySection {
  id: string;
  title: string;
  sort_id: number;
  sortId?: number;
  items: ITotalSummaryItem[];
}

export interface ITotalSummarySettings {
  sticky?: boolean;
  zero_values_for_orders_pdf_emails?: boolean;
  zeroValuesForOrdersPdfEmails?: boolean;
  arrangement_sections?:
    | ITotalSummarySection[]
    | Record<string, ITotalSummarySection>;
  arrangementSections?:
    | ITotalSummarySection[]
    | Record<string, ITotalSummarySection>;
}

export interface IncomingData {
  settings: {
    calc_id: number | null;
    title: string;
  };
  pro_active: boolean;
  appearance: AppearanceStore;
  conditions: IConditionList[];
  fields: ISourceField[];
  dateFormat: string;
  discounts: IDiscount[];
  form_fields: any[];
  geolocation: any;
  pdf_settings: any;
  quote_settings: any;
  translations: ITranslations;
  recaptcha: any;
  total_summary: ITotalSummarySettings;
  is_custom_thank_you_page: boolean;
  order_id: number;
  order_data: any;
  language: string;
}
