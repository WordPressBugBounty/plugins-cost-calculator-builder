import type { ITimePickerField } from "@/admin/shared/types/fields.type";

export const timePickerDefaults = (): Partial<ITimePickerField> => ({
  _id: null,
  label: "",
  range: "0",
  description: "",
  placeholderHours: "",
  placeholderTime: "",
  format: false,
  _event: "click",
  type: "Time Picker",
  _tag: "time-picker",
  addToSummary: true,
  additionalStyles: "",
  icon: "ccb-icon-ccb_time_picker",
  alias: "timePicker_field_id_",
  desc_option: "after",
  min_interval: "1h",
  min_interval_minutes: 60,
  use_interval: false,
  width: "100",
});
