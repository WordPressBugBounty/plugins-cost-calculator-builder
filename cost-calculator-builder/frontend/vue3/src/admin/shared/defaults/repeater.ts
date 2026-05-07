import type { IRepeaterField } from "@/admin/shared/types/fields.type";

export const repeaterDefaults = (): Partial<IRepeaterField> => ({
  label: "Repeater",
  addButtonLabel: "Add another",
  removeButtonLabel: "Remove",
  _id: null,
  _event: "",
  type: "Repeater",
  _tag: "cost-repeater",
  repeatCount: "3",
  icon: "ccb-icon-repeater",
  alias: "repeater_field_id_",
  letter: "",
  formulaView: false,
  enableFormula: false,
  costCalcFormula: "",
  groupElements: [],
  nextTickCount: 0,
  hasNextTick: true,
  sumAllAvailable: true,
  collapseOnAddAnother: false,
});
