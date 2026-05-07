import type { IHtmlField } from "@/admin/shared/types/fields.type";

export const htmlDefaults = (): Partial<IHtmlField> => ({
  label: "",
  _id: null,
  _event: "",
  type: "Html",
  htmlContent: "<h1>Html Field Content</h1>",
  placeholder: "",
  hidden: false,
  _tag: "cost-html",
  additionalCss: "",
  additionalStyles: "",
  icon: "ccb-icon-Path-3517",
  alias: "html_field_id_",
  width: "100",
});
