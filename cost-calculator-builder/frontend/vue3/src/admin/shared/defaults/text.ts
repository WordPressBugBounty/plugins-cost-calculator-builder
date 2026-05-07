import type { ITextField } from "@/admin/shared/types/fields.type";

export const textDefaults = (): Partial<ITextField> => ({
  label: "",
  _event: "",
  _id: null,
  description: "",
  placeholder: "",
  _tag: "cost-text",
  type: "Text Area",
  additionalCss: "",
  additionalStyles: "",
  icon: "ccb-icon-Subtraction-7",
  desc_option: "after",
  alias: "text_field_id_",
  width: "100",
});
