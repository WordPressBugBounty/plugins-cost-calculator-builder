export interface IStatuses {
  value: string;
  label: string;
}

export type Period =
  | "all"
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "last_year";
