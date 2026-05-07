const TYPE_KEY_ALIASES: Record<string, string> = {
  quantity: "quantity",
  Quantity: "quantity",
  checkbox: "checkbox",
  toggle: "toggle",
  group: "group",
  repeater: "repeater",
  html: "html",
  line: "line",
  geolocation: "geolocation",
  total: "Total",
  Total: "Total",

  "radio-button": "radio-button",
  radio_button: "radio-button",
  radiobutton: "radio-button",

  "drop-down": "drop-down",
  dropdown: "drop-down",
  drop_down: "drop-down",

  "range-button": "range-button",
  range: "range-button",
  range_button: "range-button",

  "multi-range": "multi-range",
  multi_range: "multi-range",

  "text-area": "text-area",
  text_area: "text-area",
  textarea: "text-area",

  "date-picker": "date-picker",
  date_picker: "date-picker",
  datepicker: "date-picker",

  "time-picker": "time-picker",
  time_picker: "time-picker",
  timepicker: "time-picker",

  "file-upload": "file-upload",
  file_upload: "file-upload",
  fileupload: "file-upload",

  "validated-form": "validated-form",
  validated_form: "validated-form",
  validation_form: "validated-form",

  "radio-with-image": "radio-with-image",
  radio_with_image: "radio-with-image",
  radio_with_img: "radio-with-image",

  "checkbox-with-image": "checkbox-with-image",
  checkbox_with_image: "checkbox-with-image",
  checkbox_with_img: "checkbox-with-image",

  "drop-down-with-image": "drop-down-with-image",
  dropdown_with_image: "drop-down-with-image",
  drop_down_with_image: "drop-down-with-image",
  drop_down_with_img: "drop-down-with-image",
};

export function normalizeFieldTypeKey(type: string): string {
  const raw = String(type || "").trim();
  if (!raw) return "";

  if (TYPE_KEY_ALIASES[raw]) {
    return TYPE_KEY_ALIASES[raw];
  }

  const normalized = raw.toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");
  return TYPE_KEY_ALIASES[normalized] || normalized;
}
