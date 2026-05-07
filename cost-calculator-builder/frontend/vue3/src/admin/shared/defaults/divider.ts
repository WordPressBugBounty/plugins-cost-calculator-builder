import type { IDividerField } from "@/admin/shared/types/fields.type";

export const dividerDefaults = (): Partial<IDividerField> => ({
  label: "",
  _event: "",
  _id: null,
  len: "25%",
  size: "1px",
  type: "Line",
  style: "solid",
  description: "",
  placeholder: "",
  _tag: "cost-line",
  additionalCss: "",
  additionalStyles: "",
  icon: "ccb-icon-Path-3518",
  alias: "line_field_id_",
});
