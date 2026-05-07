export interface IBuilderContent {
  content: builderContentType;
  activeTab: builderActiveTabType;
  sidebarCollapse: boolean;
  sidebarContent: builderSidebarContentType;
}

export type builderContentType =
  | "calculator"
  | "confirmation"
  | "order-form"
  | "total-summary"
  | "appearance";
export type builderActiveTabType = "elements" | "layout" | "themes";
export type builderSidebarContentType = "builder" | "themes" | "layout";
export type CalculatorAdminPage =
  | "builder"
  | "conditions"
  | "discounts"
  | "settings";
