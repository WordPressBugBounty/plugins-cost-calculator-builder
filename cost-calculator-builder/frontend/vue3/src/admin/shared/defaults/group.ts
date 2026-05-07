import type { IGroupField } from "@/admin/shared/types/fields.type";

export const groupDefaults = (): Partial<IGroupField> => ({
  label: "Group",
  _id: null,
  _event: "",
  type: "Group",
  _tag: "cost-group",
  icon: "ccb-icon-group-element",
  alias: "group_field_id_",
  collapsible: true,
  collapse: false,
  accordion: false,
  hidden: false,
  showTitle: true,
  groupElements: [],
  nextTickCount: 0,
  hasNextTick: true,
});
