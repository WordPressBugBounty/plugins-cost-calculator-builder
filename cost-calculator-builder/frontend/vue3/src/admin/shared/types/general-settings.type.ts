export interface IGeneralSettingsAI {
  gpt_api_key: string;
}

export interface IGeneralSettingsBackups {
  auto_backup: boolean;
}

export interface IGeneralSettingsCurrency {
  currency: string;
  currencyPosition: string;
  decimal_separator: string;
  num_after_integer: number;
  thousands_separator: string;
  use_in_all: boolean;
}

export type TAllowedDateFormats = [
  "F j Y",
  "j F Y",
  "j M Y",
  "d.m.Y",
  "d-m-Y",
  "d/m/Y",
  "m/d/Y",
  "Y-m-d",
  "l, F j, Y",
  "D, j M Y",
  "Y F j",
  "Ymd",
  "m-d-Y",
  "d-M-Y",
  "D, j M 'y",
];

export interface ITemplatesColors {
  value: string;
  type: string;
  default: string;
}

export interface IGeneralSettingsEmailTemplates {
  allowedDateFormats: TAllowedDateFormats;
  border_color: ITemplatesColors;
  button_color: ITemplatesColors;
  button_text_color: ITemplatesColors;
  content_bg: ITemplatesColors;
  dateFormat: TAllowedDateFormats[number];
  description: string;
  footer: boolean;
  header_bg: ITemplatesColors;
  logo: string;
  logo_position: string;
  main_text_color: ITemplatesColors;
  showOrderId: boolean;
  template_color: ITemplatesColors;
  title: string;
}

export interface IGeneralSettingsFormFields {
  adminEmailAddress: string;
  customEmailAddresses: string[];
  emailSubject: string;
  openModalBtnText: string;
  order_id_in_subject: boolean;
  submitBtnText: string;
  terms_use_in_all: boolean;
  use_in_all: boolean;
  terms_and_conditions: {
    checkbox: boolean;
    link: string;
    link_text: string;
    page_id: number;
    text: string;
  };
  summary_display: {
    action_after_submit: string;
    form_title: string;
    submit_btn_text: string;
    use_in_all: boolean;
  };
}

export interface IGeneralSettingsGeolocation {
  maps: { google_map: string };
  markerIconPath: string;
  measure: string;
  measures: { miles: string; km: string };
  pickUpIconPath: string;
  public_key: string;
  secret_key: string;
  type: string;
}

export interface IGeneralSettingsInvoice {
  btnText: string;
  buttonText: string;
  closeBtn: string;
  companyInfo: string;
  companyLogo: string;
  companyName: string;
  dateFormat: string;
  emailButton: boolean;
  errorText: string;
  fromEmail: string;
  fromName: string;
  showAfterPayment: boolean;
  submitBtnText: string;
  successText: string;
  use_in_all: boolean;
}

export interface IGeneralSettingsPaymentCards {
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
  use_in_all: boolean;
}

export interface IGeneralSettingPayments {
  cards: IGeneralSettingsPaymentCards;
  paypal: {
    client_id: string;
    client_secret: string;
    currency_code: string;
    integration_type: string;
    paypal_email: string;
    paypal_mode: string;
    use_in_all: boolean;
  };
  cash_payment: {
    label: string;
    type: string;
    use_in_all: boolean;
  };
}

export interface IPdfManager {
  use_in_all: boolean;
  showAfterPayment: boolean;
  emailButton: boolean;
  submitBtnText: string;
}

export interface IGeneralSettingsRecaptcha {
  enable: boolean;
  options: { v2: string; v3: string };
  type: string;
  use_in_all: boolean;
  v2: { siteKey: string; secretKey: string };
  v3: { siteKey: string; secretKey: string };
}

export interface IGeneralSettingsSticky {
  positions: {
    bottom_center: { count: number; titles: string[]; ids: number[] };
    bottom_left: { count: number; titles: string[]; ids: number[] };
    bottom_right: { count: number; titles: string[]; ids: number[] };
    center_left: { count: number; titles: string[]; ids: number[] };
    center_right: { count: number; titles: string[]; ids: number[] };
    top_center: { count: number; titles: string[]; ids: number[] };
    top_left: { count: number; titles: string[]; ids: number[] };
    top_right: { count: number; titles: string[]; ids: number[] };
  };
  used_banner: number | null;
}

export interface IGeneralSettings {
  ai: IGeneralSettingsAI;
  backup_settings: IGeneralSettingsBackups;
  currency: IGeneralSettingsCurrency;
  emailOptions: string[];
  email_templates: IGeneralSettingsEmailTemplates;
  form_fields: IGeneralSettingsFormFields;
  geolocation: IGeneralSettingsGeolocation;
  invoice: IGeneralSettingsInvoice;
  payment_gateway: IGeneralSettingPayments;
  pdf_manager: IPdfManager;
  recaptcha: IGeneralSettingsRecaptcha;
  sticky: IGeneralSettingsSticky;
}
