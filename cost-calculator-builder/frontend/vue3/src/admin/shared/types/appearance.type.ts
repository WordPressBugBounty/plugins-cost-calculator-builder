export type AppearanceColorsData = Record<string, unknown>;

export interface AppearanceSpacingData {
  container_padding?: {
    top: { value?: number };
    right: { value?: number };
    bottom: { value?: number };
    left: { value?: number };
  };
  container_margin?: {
    top: { value?: number };
    right: { value?: number };
    bottom: { value?: number };
    left: { value?: number };
  };
  field_side_indents?: { value?: number };
  field_spacing?: { value?: number };
  field_button_height?: { value?: number };
  field_button_width?: { value?: number };
  field_button_padding?: {
    top: { value?: number };
    right: { value?: number };
    bottom: { value?: number };
    left: { value?: number };
  };
  field_button_margin?: {
    top: { value?: number };
    right: { value?: number };
    bottom: { value?: number };
    left: { value?: number };
  };
}

export interface AppearanceContainerColorField {
  value?: {
    color?: string;
    blur?: { value?: number | string };
  };
  data?: {
    color?: { value?: string };
    blur?: { value?: number | string };
    value?: {
      color?: string;
      blur?: { value?: number | string };
    };
  };
}

export interface AppearanceFormFieldsColorField {
  value?: { color?: string };
  data?: {
    color?: { value?: string };
    value?: { color?: string };
  };
}

export interface PageNavigationProps {
  pages: number[];
  activePage: number;
  pageLabels: string[];
  hideTitle: boolean;
  isActive: boolean;
}

export interface PageNavigationEmits {
  (e: "change-page", index: number): void;
  (e: "select"): void;
}
