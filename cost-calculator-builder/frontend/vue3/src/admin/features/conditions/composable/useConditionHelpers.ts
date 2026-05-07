import { IDropdownOption } from "@/admin/shared/types/uikit.type";
import { type ConditionLogic } from "@/admin/shared/types/conditions.type";
import type { IField } from "@/admin/shared/types/fields.type";
import {
  resolveFieldName,
  isGeoMultiplyLocation,
} from "./useConditionNormalize";

const conditionStates = [
  {
    title: "Is selected",
    value: "==",
    fields: [
      "geolocation",
      "dropDown",
      "radio",
      "dropDown_with_img",
      "radio_with_img",
    ],
  },
  {
    title: "Is selected (value)",
    value: "==",
    fields: ["checkbox", "checkbox_with_img", "toggle"],
  },
  {
    title: "Is selected (label(s))",
    value: "in",
    fields: ["checkbox", "toggle", "checkbox_with_img"],
  },
  {
    title: "Is selected (option)",
    value: "contains",
    fields: ["checkbox", "toggle", "checkbox_with_img"],
  },
  {
    title: "Is not selected (label(s))",
    value: "not in",
    fields: ["checkbox", "toggle", "checkbox_with_img"],
  },
  {
    title: "Is equal to",
    value: "==",
    fields: [
      "multi_range",
      "quantity",
      "range",
      "datePicker",
      "timePicker",
      "range_datePicker",
      "range_timePicker",
      "total",
      "file_upload_with_price",
    ],
  },
  {
    title: "Is less than",
    value: "<=",
    fields: [
      "checkbox",
      "dropDown",
      "dropDown_with_img",
      "checkbox_with_img",
      "radio_with_img",
      "multi_range",
      "quantity",
      "radio",
      "range",
      "datePicker",
      "timePicker",
      "range_datePicker",
      "toggle",
      "total",
      "file_upload_with_price",
    ],
  },
  {
    title: "Is greater than",
    value: ">=",
    fields: [
      "checkbox",
      "dropDown",
      "dropDown_with_img",
      "checkbox_with_img",
      "radio_with_img",
      "multi_range",
      "quantity",
      "radio",
      "range",
      "datePicker",
      "timePicker",
      "range_datePicker",
      "toggle",
      "total",
      "file_upload_with_price",
    ],
  },
  {
    title: "Is not equal to",
    value: "!=",
    fields: [
      "checkbox",
      "dropDown",
      "dropDown_with_img",
      "checkbox_with_img",
      "radio_with_img",
      "multi_range",
      "quantity",
      "radio",
      "range",
      "datePicker",
      "timePicker",
      "range_datePicker",
      "toggle",
      "total",
      "file_upload_with_price",
    ],
  },

  {
    title: "Is less than (cost of distance)",
    value: "<=",
    fields: ["geolocation"],
  },

  {
    title: "Is greater than (cost of distance)",
    value: ">=",
    fields: ["geolocation"],
  },

  {
    title: "Is not equal to (cost of distance)",
    value: "!=",
    fields: ["geolocation"],
  },

  {
    title: "Is less than (distance)",
    value: "<= & distance",
    fields: ["geolocation"],
  },

  {
    title: "Is greater than (distance)",
    value: ">= & distance",
    fields: ["geolocation"],
  },

  {
    title: "Is not equal to (distance)",
    value: "!= & distance",
    fields: ["geolocation"],
  },
];

const fieldActions = [
  {
    title: "Show",
    value: "show",
    fields: [
      "geolocation",
      "checkbox",
      "datePicker",
      "timePicker",
      "dropDown",
      "dropDown_with_img",
      "checkbox_with_img",
      "radio_with_img",
      "html",
      "line",
      "multi_range",
      "quantity",
      "radio",
      "range",
      "range_datePicker",
      "range_timePicker",
      "text",
      "toggle",
      "total",
      "file_upload",
      "file_upload_with_price",
      "group",
      "validated_form",
    ],
  },
  {
    title: "Hide",
    value: "hide",
    fields: [
      "geolocation",
      "checkbox",
      "datePicker",
      "timePicker",
      "dropDown",
      "dropDown_with_img",
      "checkbox_with_img",
      "radio_with_img",
      "html",
      "line",
      "multi_range",
      "quantity",
      "radio",
      "range",
      "range_datePicker",
      "range_timePicker",
      "text",
      "toggle",
      "total",
      "file_upload",
      "file_upload_with_price",
      "group",
      "validated_form",
    ],
  },
  {
    title: "Hide (leave in Total)",
    value: "hide_leave_in_total",
    fields: [
      "checkbox",
      "datePicker",
      "timePicker",
      "dropDown",
      "dropDown_with_img",
      "checkbox_with_img",
      "radio_with_img",
      "multi_range",
      "quantity",
      "radio",
      "range",
      "range_datePicker",
      "range_timePicker",
      "toggle",
      "file_upload",
      "geolocation",
    ],
  },
  {
    title: "Disable",
    value: "disable",
    fields: [
      "geolocation",
      "checkbox",
      "datePicker",
      "timePicker",
      "dropDown",
      "dropDown_with_img",
      "checkbox_with_img",
      "radio_with_img",
      "multi_range",
      "quantity",
      "radio",
      "range",
      "range_datePicker",
      "range_timePicker",
      "toggle",
      "file_upload",
    ],
  },
  {
    title: "Unset All",
    value: "unset",
    fields: [
      "datePicker",
      "timePicker",
      "dropDown",
      "dropDown_with_img",
      "radio_with_img",
      "quantity",
      "radio",
      "range_datePicker",
      "range_timePicker",
      "checkbox",
      "checkbox_with_img",
      "toggle",
    ],
  },
  {
    title: "Unset Option(s)",
    value: "unset_option",
    fields: ["checkbox", "checkbox_with_img", "toggle"],
    type: "multi_select",
  },
  {
    title: "Set value",
    value: "set_value",
    fields: ["quantity", "range", "file_upload", "file_upload_with_price"],
    type: "input",
  },
  {
    title: "Set value and disable",
    value: "set_value_and_disable",
    fields: ["quantity", "range"],
    type: "input",
  },
  {
    title: "Select option",
    value: "select_option",
    fields: ["dropDown", "dropDown_with_img", "radio_with_img", "radio"],
    type: "select",
  },
  {
    title: "Select option(s)",
    value: "select_option",
    fields: ["checkbox", "toggle", "checkbox_with_img"],
    type: "multi_select",
  },
  {
    title: "Disable option",
    value: "disable_option",
    fields: ["dropDown", "dropDown_with_img", "radio_with_img", "radio"],
    type: "select",
  },
  {
    title: "Disable option(s)",
    value: "disable_option",
    fields: ["checkbox", "toggle", "checkbox_with_img"],
    type: "multi_select",
  },
  {
    title: "Select option and disable",
    value: "select_option_and_disable",
    fields: ["dropDown", "dropDown_with_img", "radio_with_img", "radio"],
    type: "select",
  },
  {
    title: "Select option(s) and disable",
    value: "select_option_and_disable",
    fields: ["checkbox", "toggle", "checkbox_with_img"],
    type: "multi_select",
  },
  {
    title: "Set date",
    value: "set_date",
    fields: ["datePicker"],
    type: "date",
  },
  {
    title: "Set date and disable",
    value: "set_date_and_disable",
    fields: ["datePicker"],
    type: "date",
  },
  {
    title: "Set time",
    value: "set_time",
    fields: ["timePicker"],
    type: "time",
  },
  {
    title: "Set time",
    value: "set_time",
    fields: ["range_timePicker"],
    type: "period_time",
  },
  {
    title: "Set time and disable",
    value: "set_time_and_disable",
    fields: ["timePicker"],
    type: "time",
  },
  {
    title: "Set time and disable",
    value: "set_time_and_disable",
    fields: ["range_timePicker"],
    type: "period_time",
  },
  {
    title: "Set period",
    value: "set_period",
    fields: ["multi_range"],
    type: "period_range",
  },
  {
    title: "Set period",
    value: "set_period",
    fields: ["range_datePicker"],
    type: "period_date",
  },
  {
    title: "Set period and disable",
    value: "set_period_and_disable",
    fields: ["multi_range"],
    type: "period_range",
  },
  {
    title: "Set period and disable",
    value: "set_period_and_disable",
    fields: ["range_datePicker"],
    type: "period_date",
  },
  {
    title: "Set Location",
    value: "set_location",
    fields: ["geolocation"],
    type: "location",
  },

  {
    title: "Set Location and Disable",
    value: "set_location_and_disable",
    fields: ["geolocation"],
    type: "location",
  },
];

const multiOptionsFields = ["checkbox", "toggle", "checkbox_with_img"];
const selectOptionsFields = [
  "geolocation",
  "dropDown",
  "radio",
  "dropDown_with_img",
  "radio_with_img",
];

interface IConditionHelper {
  getActionsByAlias: (alias: string) => IDropdownOption[];
  getActionType: (action: ConditionLogic, alias: string) => string;
  getFieldActionsByAlias: (alias: string) => IDropdownOption[];
  getActionOptionType: (action: string, alias: string) => string;
  getActionsByAliasWithField: (
    alias: string,
    field: IField | undefined,
  ) => IDropdownOption[];
  getFieldActionsByAliasWithField: (
    alias: string,
    field: IField | undefined,
  ) => IDropdownOption[];
  getActionOptionTypeWithField: (
    action: string,
    alias: string,
    field: IField | undefined,
  ) => string;
}

export const useConditionHelpers = (): IConditionHelper => {
  const getActionsByAlias = (alias: string): IDropdownOption[] => {
    const data = conditionStates
      .filter((state) => state.fields.includes(alias))
      .map((state) => ({
        label: state.title,
        value: state.value,
      }));

    return Array.from(
      new Map(data.map((item) => [JSON.stringify(item), item])).values(),
    );
  };

  const getActionsByAliasWithField = (
    alias: string,
    field: IField | undefined,
  ): IDropdownOption[] => {
    const resolved = field ? resolveFieldName(alias, field) : alias;

    if (resolved === "geolocation" && field) {
      const all = conditionStates
        .filter((s) => s.fields.includes("geolocation"))
        .map((s) => ({ label: s.title, value: s.value }));

      if (isGeoMultiplyLocation(field)) {
        return all.filter((item) => item.value === "==");
      }
      return all.filter((item) => item.value !== "==");
    }

    return getActionsByAlias(resolved);
  };

  const getActionType = (action: ConditionLogic, fieldName: string): string => {
    if (["in", "not in"].includes(action)) {
      return "select_multiple_option";
    }

    if (action === "contains") {
      return "select_option";
    }

    if (action === "==") {
      if (multiOptionsFields.includes(fieldName)) {
        return "set_value";
      }

      if (selectOptionsFields.includes(fieldName)) {
        return "select_option";
      }
    }

    return "set_value";
  };

  const getFieldActionsByAlias = (alias: string): IDropdownOption[] => {
    const data = fieldActions
      .filter((action) => action.fields.includes(alias))
      .map((action) => ({
        label: action.title,
        value: action.value,
      }));

    return Array.from(
      new Map(data.map((item) => [JSON.stringify(item), item])).values(),
    );
  };

  const getFieldActionsByAliasWithField = (
    alias: string,
    field: IField | undefined,
  ): IDropdownOption[] => {
    const resolved = field ? resolveFieldName(alias, field) : alias;

    let result = fieldActions
      .filter((a) => a.fields.includes(resolved))
      .map((a) => ({ label: a.title, value: a.value }));

    if (resolved === "geolocation" && field && !isGeoMultiplyLocation(field)) {
      const remove = ["set_location", "set_location_and_disable"];
      result = result.filter((r) => !remove.includes(r.value));
    }

    return Array.from(
      new Map(result.map((item) => [JSON.stringify(item), item])).values(),
    );
  };

  const getActionOptionType = (action: string, alias: string): string => {
    const actionData = fieldActions.find(
      (a) => a.value === action && a.fields.includes(alias),
    );

    return actionData?.type || "";
  };

  const getActionOptionTypeWithField = (
    action: string,
    alias: string,
    field: IField | undefined,
  ): string => {
    const resolved = field ? resolveFieldName(alias, field) : alias;
    return getActionOptionType(action, resolved);
  };

  return {
    getActionsByAlias,
    getActionType,
    getFieldActionsByAlias,
    getActionOptionType,
    getActionsByAliasWithField,
    getFieldActionsByAliasWithField,
    getActionOptionTypeWithField,
  };
};
