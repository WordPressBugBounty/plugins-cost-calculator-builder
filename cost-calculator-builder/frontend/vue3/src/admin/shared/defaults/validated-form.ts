import type { IValidationFormField } from "@/admin/shared/types/fields.type";

export const validatedFormDefaults = (): Partial<IValidationFormField> => ({
  label: "",
  _id: null,
  field_type: "email",
  description: "",
  _event: "change",
  default: "",
  additionalCss: "",
  addToSummary: true,
  type: "Validated form",
  additionalStyles: "",
  _tag: "cost-validated-form",
  icon: "ccb-icon-Icon-element",
  alias: "validated_form_field_id_",
  desc_option: "after",
  width: "100",
});
