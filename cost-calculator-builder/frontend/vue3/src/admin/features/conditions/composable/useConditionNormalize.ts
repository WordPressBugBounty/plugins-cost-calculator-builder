import type {
  ICondition,
  ConditionAction,
} from "@/admin/shared/types/conditions.type";
import type {
  IField,
  IDatePickerField,
  ITimePickerField,
  IFileUploadField,
  IGeolocationField,
} from "@/admin/shared/types/fields.type";

const INPUT_TYPE_TAGS: string[] = [
  "cost-range",
  "cost-quantity",
  "cost-multi-range",
  "date-picker",
  "cost-total",
  "cost-file-upload",
  "cost-checkbox",
  "cost-checkbox-with-image",
  "cost-toggle",
  "cost-geolocation",
];

const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9](\s?(AM|PM))?$/i;

/**
 * Backend aliases use hyphens (e.g. "date-picker_field_id_8") but the
 * condition helpers use camelCase / underscore names (e.g. "datePicker").
 * This map normalizes the stripped alias prefix to the condition field name.
 */
const ALIAS_TO_CONDITION_NAME: Record<string, string> = {
  "date-picker": "datePicker",
  "time-picker": "timePicker",
  "cost-range": "range",
  "cost-quantity": "quantity",
  "cost-multi-range": "multi_range",
  "cost-total": "total",
  "cost-file-upload": "file_upload",
  "cost-checkbox": "checkbox",
  "cost-checkbox-with-image": "checkbox_with_img",
  "cost-toggle": "toggle",
  "cost-geolocation": "geolocation",
  "cost-html": "html",
  "cost-line": "line",
  "cost-text": "text",
  "cost-validated-form": "validated_form",
  "cost-drop-down-with-image": "dropDown_with_img",
  "cost-group": "group",
};

function normalizeAliasPrefix(rawName: string): string {
  return ALIAS_TO_CONDITION_NAME[rawName] ?? rawName;
}

export function isValidTime(timeString: string): boolean {
  return TIME_REGEX.test(timeString);
}

/**
 * Resolve the effective condition field name from an alias + field object.
 * Accounts for backend alias format, date picker range mode, time picker
 * range mode, file upload with price, etc.
 */
export function resolveFieldName(alias: string, field?: IField): string {
  const raw = alias.replace(/_field_id.*/, "");
  const baseName = normalizeAliasPrefix(raw);

  if (!field) return baseName;

  if (baseName === "datePicker" && isRangeField(field)) {
    return "range_datePicker";
  }

  if (baseName === "timePicker" && isRangeField(field)) {
    return "range_timePicker";
  }

  if (baseName === "file_upload" && isFileUploadWithPrice(field)) {
    return "file_upload_with_price";
  }

  return baseName;
}

/**
 * Determine whether a source field should use "input" or "select" mode
 * for condition values. Mirrors legacy `inputTypeFields` logic including
 * the geolocation multiplyLocation exclusion.
 */
export function resolveInputType(field: IField): "input" | "select" {
  const tag = field._tag;

  if (tag === "cost-geolocation" && isGeoMultiplyLocation(field)) {
    return "select";
  }

  return INPUT_TYPE_TAGS.includes(tag) ? "input" : "select";
}

/**
 * Determine the action type category for a target field.
 * Legacy: 'simple' for non-calculable display fields,
 * 'pro' for multi-range/date-picker/dropdown-with-image,
 * 'calc' for everything else.
 */
export function resolveActionType(
  targetTag: string,
): "simple" | "calc" | "pro" {
  const simpleTags = [
    "cost-html",
    "cost-line",
    "cost-text",
    "cost-validated-form",
    "cost-total",
  ];
  const proTags = [
    "cost-multi-range",
    "date-picker",
    "cost-drop-down-with-image",
  ];

  if (proTags.includes(targetTag)) return "pro";
  if (simpleTags.includes(targetTag)) return "simple";
  return "calc";
}

/**
 * Normalize saved conditions when opening the link editor.
 * Converts date/time action+value formats to match the current
 * target field settings (range vs single).
 *
 * Returns a deep-cloned, normalized copy — does not mutate the input.
 */
export function normalizeConditionsForEdit(
  conditions: ICondition[],
  targetField: IField | undefined,
): ICondition[] {
  if (!conditions?.length || !targetField) return conditions;

  const clone: ICondition[] = JSON.parse(JSON.stringify(conditions));
  const resolved = resolveFieldName(targetField.alias || "", targetField);

  if (resolved === "datePicker" || resolved === "range_datePicker") {
    normalizeDateConditions(clone, targetField);
  }

  if (resolved === "timePicker" || resolved === "range_timePicker") {
    normalizeTimeConditions(clone, targetField);
  }

  return clone;
}

function normalizeDateConditions(
  conditions: ICondition[],
  targetField: IField,
): void {
  const isRange = isRangeField(targetField);

  for (const c of conditions) {
    const action = c.action as string;

    if (action === "set_period" && !isRange) {
      c.setVal = c.setVal
        ? String(safeParse(String(c.setVal))?.start ?? c.setVal)
        : c.setVal;
      c.action = "set_date" as ConditionAction;
    } else if (action === "set_date" && isRange) {
      c.setVal = c.setVal
        ? JSON.stringify({ start: String(c.setVal), end: null })
        : c.setVal;
      c.action = "set_period" as ConditionAction;
    } else if (action === "set_date_and_disable" && isRange) {
      c.setVal = c.setVal
        ? JSON.stringify({ start: String(c.setVal), end: null })
        : c.setVal;
      c.action = "set_period_and_disable" as ConditionAction;
    } else if (action === "set_period_and_disable" && !isRange) {
      c.setVal = c.setVal
        ? String(safeParse(String(c.setVal))?.start ?? c.setVal)
        : c.setVal;
      c.action = "set_date_and_disable" as ConditionAction;
    }
  }
}

function normalizeTimeConditions(
  conditions: ICondition[],
  targetField: IField,
): void {
  const isRange = isRangeField(targetField);

  for (const c of conditions) {
    let action = c.action as string;

    if (action === "set_period") {
      c.action = "set_time" as ConditionAction;
      action = "set_time";
    } else if (action === "set_period_and_disable") {
      c.action = "set_time_and_disable" as ConditionAction;
      action = "set_time_and_disable";
    }

    if (action !== "set_time" && action !== "set_time_and_disable") continue;

    const val = String(c.setVal || "");

    if (!isRange) {
      if (isValidTime(val)) {
        continue;
      }
      const parsed = safeParse(val);
      if (parsed?.start) {
        c.setVal = String(parsed.start);
      }
    } else {
      if (!val.includes("start")) {
        c.setVal = JSON.stringify({ start: val, end: "" });
      }
    }
  }
}

function isRangeField(field: IField): boolean {
  if ("range" in field) {
    const range = (field as IDatePickerField | ITimePickerField).range;
    if (typeof range === "boolean") return range;
    return String(range) === "1" || range === "true";
  }
  return false;
}

function isFileUploadWithPrice(field: IField): boolean {
  if ("price" in field) {
    return Number((field as IFileUploadField).price) > 0;
  }
  return false;
}

export function isGeoMultiplyLocation(field: IField): boolean {
  if ("geoType" in field) {
    return (field as IGeolocationField).geoType === "multiplyLocation";
  }
  return false;
}

function safeParse(val: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(val);
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch {
    // not JSON
  }
  return null;
}
