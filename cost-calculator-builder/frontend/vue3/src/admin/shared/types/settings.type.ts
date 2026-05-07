export interface ISettingsFormulas {
  idx: number;
  title: string;
  alias: string;
}

export interface ISettingsItems {
  label: string;
  value: string;
}

export interface IPaymentCards {
  enable: boolean;
  card_payments: {
    stripe: {
      currency: string;
      enable: boolean;
      label: string;
      logo: string;
      mode: string;
      payment_logo_width: string;
      payment_type: string;
      publishKey: string;
      secretKey: string;
      slug: string;
    };
    razorpay: {
      currency: string;
      enable: boolean;
      keyId: string;
      label: string;
      logo: string;
      payment_logo_width: string;
      payment_type: string;
      secretKey: string;
      slug: string;
    };
  };
}

export interface IGeneralStyles {
  radio: string;
  checkbox: string;
  toggle: string;
  radio_with_img: string;
  checkbox_with_img: string;
}

export interface IGeneral {
  descriptions: boolean;
  header_title: string;
  hide_empty: boolean;
  hide_empty_for_orders_pdf_emails: boolean;
  icon_path: string;
  icons: string;
  layout: string;
  order_button: boolean;
  pdf_button: boolean;
  quote_button: boolean;
  show_details_accordion: boolean;
  show_option_unit: boolean;
  slug: string;
  sticky: boolean;
  styles: IGeneralStyles;
}

export interface ILayoutSettings {
  box_style: "vertical" | "horizontal" | "two_column";
  width: number;
}

export interface ICurrency {
  currency: string;
  currencyPosition: string;
  decimal_separator: string;
  icons: string;
  num_after_integer: number;
  slug: string;
  thousands_separator: string;
}

export interface IFormFieldsTexts {
  email_format: string;
  email_field: string;
  name_field: string;
  phone_field: string;
  terms_and_conditions_field: string;
}

export interface IWarningTexts {
  checkbox_min_required_msg_plural: string;
  checkbox_min_required_msg_single: string;
  description: string;
  form_fields: IFormFieldsTexts;
  icons: string;
  invoice_btn: string;
  issued_on: string;
  required_msg: string;
  reset_btn: string;
  slug: string;
  title: string;
}

export interface ISticky {
  banner_position: string;
  btn_position: string;
  btn_text: string;
  classes: string;
  custom_desc: string;
  custom_text: string;
  description: string;
  display_type: string;
  enable: boolean;
  formulas: ISettingsFormulas[];
  formulas_list: string[];
  hide_icon: boolean;
  icon: string;
  icons: string;
  is_on: boolean;
  one_click_action: string;
  pages: string[];
  show_calculator: boolean;
  show_total: boolean;
  slug: string;
  title: string;
}

export interface IFormFields {
  accessEmail: boolean;
  accessTermsEmail: boolean;
  adminEmailAddress: string;
  allowContactForm: string;
  applyFormId: string;
  body: string;
  contactFormId: string;
  customEmailAddresses: Array<{ email: string; description: string }>;
  emailSubject: string;
  fields: string[];
  formType: string;
  formulas: string[];
  formulas_list: string[];
  icons: string;
  is_on: boolean;
  openModalBtnText: string;
  order_id_in_subject: boolean;
  payment: boolean;
  paymentMethod: string;
  paymentMethods: string[];
  slug: string;
  terms_and_conditions: {
    checkbox: boolean;
    text: string;
    page_id: number;
    link: string;
    link_text: string;
  };
  summary_display: {
    enable: boolean;
    form_title: string;
    submit_btn_text: string;
    action_after_submit: string;
  };
  submitBtnText: string;
}

export interface IWooProducts {
  by_category: boolean;
  by_product: boolean;
  category_id: string;
  category_ids: number[];
  enable: boolean;
  hide_woo_cart: boolean;
  hook_to_show: string;
  icons: string;
  is_on: boolean;
  meta_links: AnyRow[] | string[];
  product_ids: number[];
  product_list: string[];
  slug: string;
}

export type AnyRow = Record<string, any>;

export interface IWooCheckout {
  change_product_count: boolean;
  description: string;
  enable: boolean;
  formulas: ISettingsFormulas[];
  formulas_list: string[];
  icons: string;
  is_on: boolean;
  product_id: string | number;
  redirect_to: string;
  replace_product: boolean;
  slug: string;
  stock_links: AnyRow[] | string[];
}

export interface IPaymentGateway {
  formulas_list: string[];
  icons: string;
  is_on: boolean;
  paypal: {
    enable: boolean;
    integration_type: string;
    paypal_email: string;
    currency_code: string;
    paypal_mode: string;
    client_id: string;
    client_secret: string;
  };
  slug: string;
  formulas: ISettingsFormulas[];
  cards: IPaymentCards;
  cash_payment: { enable: boolean; label: string; type: string };
}

export interface IWebhooks {
  email_quote_url: string;
  enableEmailQuote: boolean;
  enablePaymentBtn: boolean;
  enableSendForms: boolean;
  icons: string;
  is_on: boolean;
  payment_btn_url: string;
  secret_key_email_quote: string;
  secret_key_payment_btn: string;
  secret_key_send_form: string;
  send_form_url: string;
  slug: string;
}

export interface IPageBreakSettings {
  formulas: ISettingsFormulas[];
  formulas_list: string[];
  has_page: boolean;
  hide_pagination_title: boolean;
  pagination_type: string;
  summary_after_last_page: boolean;
  total_in_page: boolean;
}

export interface IThankYouPage {
  back_button_text: string;
  complete_msg: string;
  custom_button: boolean;
  custom_button_link: string;
  custom_button_text: string;
  custom_page_link: string;
  description: string;
  download_button: boolean;
  download_button_text: string;
  enable: boolean;
  icons: string;
  is_on: boolean;
  order_title: string;
  page_id: number;
  share_button: boolean;
  share_button_text: string;
  showOrderId: boolean;
  slug: string;
  title: string;
  type: string;
}

export interface IRecaptcha {
  enable: boolean;
  options: { v2: string; v3: string };
  type: string;
  use_in_all: boolean;
  v2: { siteKey: string; secretKey: string };
  v3: { siteKey: string; secretKey: string };
}

export interface ITotalSummaryItemOptions {
  title?: string;
  default_state?: "expanded" | "collapsed";
  show_zero_values?: boolean;
  cost_breakdown?: boolean;
  width?: number;
  layout?: "horizontal" | "vertical";
}

export interface ITotalSummaryItem {
  id: string;
  title: string;
  alias: string;
  sort_id: number;
  locked: boolean;
  static: boolean;
  draggable?: boolean;
  options: ITotalSummaryItemOptions;
}

export interface ITotalSummarySection {
  id: string;
  title: string;
  sort_id: number;
  items: ITotalSummaryItem[];
}

export interface ITotalSummarySettings {
  sticky: boolean;
  zero_values_for_orders_pdf_emails: boolean;
  arrangement_sections: ITotalSummarySection[];
}

export interface IConfirmationPage {
  enable: boolean;
  page_id: number;
  slug: string;
  title: string;
}

export interface ISettings {
  general: IGeneral;
  layout: ILayoutSettings;
  currency: ICurrency;
  confirmation_page: IConfirmationPage;
  texts: IWarningTexts;
  sticky_calc: ISticky;
  formFields: IFormFields;
  emailOptions: string[];
  woo_products: IWooProducts;
  woo_checkout: IWooCheckout;
  payment_gateway: IPaymentGateway;
  webhooks: IWebhooks;
  page_break: IPageBreakSettings;
  thankYouPage: IThankYouPage;
  recaptcha: IRecaptcha;
  recaptcha_type: {
    v2: string;
    v3: string;
  };
  recaptcha_v3: {
    siteKey: string;
    secretKey: string;
  };
}

export interface ILayout {
  max_width: number;
  summary_width: number;
  calculator_width: number;
  summary_position: "right" | "left" | "bottom";
  header_position: "top" | "bottom" | "hidden";
  navigation_position: "top" | "bottom" | "hidden";
  navigation_buttons_position: "left" | "right" | "bottom";
}
