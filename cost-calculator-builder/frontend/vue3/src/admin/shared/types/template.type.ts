export interface ITemplate {
  type: string;
  title: string;
  id: number;
  category: string;
  template_id: number;
  icon: string;
  link: string;
  info: string;
  description: string;
  image: string;
}

export interface ITemplateCategory {
  id: number;
  title: string;
  slug: string;
  count: number;
  icon?: string;
  iconColor?: string;
}

export interface TabItem {
  id: string | number;
  label?: string;
  icon?: string;
  title?: string;
  isPro?: boolean;
  proBadge?: boolean;
}

export interface ITemplateCard {
  id: number;
  title: string;
  description: string;
  image?: string;
  type?: string;
  variants?: number;
  link?: string;
}
