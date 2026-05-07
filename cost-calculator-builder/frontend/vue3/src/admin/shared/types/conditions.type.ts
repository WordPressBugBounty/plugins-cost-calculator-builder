export type Direction = "LR" | "TB";

export type ConditionAction =
  | "select_option"
  | "select_option_and_disable"
  | "set_value"
  | "set_value_and_disable"
  | "hide"
  | "show"
  | "disable"
  | "unset"
  | "unset_option"
  | "hide_leave_in_total"
  | "disable_option"
  | "set_date"
  | "set_date_and_disable"
  | "set_period"
  | "set_period_and_disable"
  | "set_time"
  | "set_time_and_disable"
  | "set_location"
  | "set_location_and_disable"
  | "";

export type ConditionType =
  | "select"
  | "checkbox"
  | "radio"
  | "toggle"
  | "checkbox_with_img"
  | "toggle_with_img";

export type ConditionLogicalOperator = "||" | "&&";

export type ConditionLogic =
  | "=="
  | "!="
  | ">="
  | "<="
  | "in"
  | "contains"
  | "not in"
  | "!= & distance"
  | "<= & distance"
  | ">= & distance"
  | "";

export interface IConditionRule {
  checkedValues: number[];
  condition: ConditionLogic;
  key: number;
  logicalOperator: ConditionLogicalOperator;
  sort: number;
  value: string;
}

export interface ICondition {
  index: boolean;
  optionFrom: string;
  optionTo: string;
  setOptions: string;
  setVal: string | number;
  sort: number;
  type: ConditionType;
  conditions: IConditionRule[];
  action: ConditionAction;
  hide: boolean;
  open: boolean;
}

export interface IRawLinkData {
  space: string;
  condition: ICondition[];
  options_from: string;
  options_to: string;
}

export interface IRawLink {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  type: string;
  data: IRawLinkData;
}

interface IRawNodeData {
  alias: string;
  calculable: boolean;
  icon: string;
  label: string;
  old_id: number;
  space: string;
}

export interface IRawNode {
  id: string;
  data: IRawNodeData;
  position: {
    x: number;
    y: number;
  };
  type: string;
}

export interface ISpace {
  id: number;
  label: string;
  slug: string;
  sort_id: number;
}

export interface IConditionList {
  nodes: IRawNode[];
  links: IRawLink[];
  spaces: ISpace[];
}

export interface IConditionElement {
  id: string;
  label: string;
  alias: string;
}
