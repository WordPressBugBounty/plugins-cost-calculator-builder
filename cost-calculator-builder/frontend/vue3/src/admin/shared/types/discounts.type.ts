export type NumericLike = number | `${number}`;

export type DiscountPeriod = "period" | "single_day" | "permanently";
export type DiscountViewType = "show_with_title" | "show_without_title";
export type DiscountStatus = "active" | "upcoming" | "ended";
export type DiscountConditionType =
  | "free"
  | "fixed_amount"
  | "percent_of_amount";
export type DiscountConditionSymbol = ">" | "<" | "=";
export type DiscountSortBy =
  | "discount_id"
  | "title"
  | "is_promo"
  | "period"
  | "discount_status";
export type DiscountSortDirection = "asc" | "desc";

export interface IDiscountConditionResponse {
  discount_condition_id: NumericLike;
  discount_id: NumericLike;
  field_alias: string;
  over_price: NumericLike;
  discount_amount: NumericLike;
  condition_symbol: DiscountConditionSymbol;
  discount_type: DiscountConditionType;
  created_at: string;
  updated_at: string;
}

export interface IDiscountResponse {
  discount_id: NumericLike;
  title: string;
  calc_id: NumericLike;
  is_promo: boolean | NumericLike;
  view_type: DiscountViewType;
  period: DiscountPeriod;
  period_start_date: string | null;
  period_end_date: string | null;
  single_date: string | null;
  discount_status: DiscountStatus;
  promocode_count: NumericLike | null;
  promocode: string | null;
  promocode_used: NumericLike | null;
  conditions: IDiscountConditionResponse[];
  created_at?: string;
  updated_at?: string;
}

export interface IDiscountListParams {
  limit: number;
  page: number;
  sortBy: DiscountSortBy;
  direction: DiscountSortDirection;
}

export interface IDiscountsCollection {
  discounts: IDiscountResponse[];
  discounts_count: NumericLike;
}

export interface IDiscountTotalOption {
  idx: number;
  title: string;
  alias: string;
}

export interface IDiscountPromocodeForm {
  promocode: string;
  promocode_count: number;
  promocode_used?: number;
}

export interface IDiscountSchedulePeriodDate {
  start: string;
  end: string;
}

export interface IDiscountScheduleForm {
  period: DiscountPeriod;
  period_date: IDiscountSchedulePeriodDate;
  single_date: string;
  view_type: DiscountViewType;
}

export interface IDiscountConditionForm {
  totals: IDiscountTotalOption[];
  condition: DiscountConditionSymbol;
  over_price: number;
  discount_type: DiscountConditionType;
  discount_amount: number;
}

export interface IDiscountForm {
  discount_id?: number;
  title: string;
  is_promo: boolean;
  promocode: IDiscountPromocodeForm;
  schedule: IDiscountScheduleForm;
  conditions: IDiscountConditionForm[];
}
