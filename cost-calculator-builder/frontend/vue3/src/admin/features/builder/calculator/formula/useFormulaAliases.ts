import { computed, type Ref } from "vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import type {
  IField,
  IGroupField,
  IRepeaterField,
  IPageBreaker,
} from "@/admin/shared/types/fields.type";
import type { IAvailableField } from "./formula.types";
import { numHash } from "./formulaMappings";

const NON_CALCULABLE_TYPES = [
  "html",
  "line",
  "text",
  "group",
  "validated_form",
  "page_break",
  "section",
];

const HIDDEN_FROM_FORMULA = ["timePicker"];

function extractFieldType(alias: string): string {
  return alias.replace(/_field_id.*/, "");
}

function extractFieldNumericId(alias: string): number {
  return parseInt(alias.replace(/[^0-9]/g, ""), 10) || 0;
}

function hasGroupElements(
  field: IField,
): field is IGroupField | IRepeaterField {
  return "groupElements" in field && Array.isArray(field.groupElements);
}

/**
 * Flatten all builder fields from pages -> sections -> fields,
 * expanding groups/repeaters/page-breaks into their children.
 * Ported from available.mixin.js `prepareAvailable`.
 */
function flattenBuilderFields(builderFields: IPageBreaker[]): IField[] {
  let fields: IField[] = [];

  const allTopLevel = builderFields.flatMap((page) =>
    page.groupElements.flatMap((section) => section.fields),
  );

  for (const field of allTopLevel) {
    fields.push(field);
  }

  for (const page of builderFields) {
    if (page.alias?.includes("page")) {
      for (const section of page.groupElements) {
        if (section.fields) {
          fields = [...fields, ...section.fields];
          for (const innerField of section.fields) {
            if (hasGroupElements(innerField)) {
              fields = [...fields, ...innerField.groupElements];
            }
          }
        }
      }
    }
  }

  for (const field of allTopLevel) {
    if (
      field.alias &&
      (field.alias.includes("group") || field.alias.includes("page_break"))
    ) {
      if (hasGroupElements(field) && field.groupElements.length) {
        fields = [...fields, ...field.groupElements];
      }
    }
  }

  return fields;
}

/**
 * Composable that provides the list of available fields for the formula editor.
 *
 * @param currentFieldAlias - reactive ref to the alias of the field being edited (to exclude self & filter totals)
 * @param isTotal - whether the current field is a total (filters out repeater inner fields)
 */
export function useFormulaAliases(
  currentFieldAlias: Ref<string | undefined>,
  isTotal: Ref<boolean>,
) {
  const builderStore = useBuilderStore();

  const availableFields = computed<IAvailableField[]>(() => {
    const builderFields = builderStore.getBuilderFields;
    if (!builderFields.length) return [];

    const allFields = flattenBuilderFields(builderFields);

    const repeaterInnerAliases = new Set<string>();
    const repeaterFields = allFields.filter((f) =>
      f.alias?.includes("repeater"),
    );
    for (const repeater of repeaterFields) {
      if (hasGroupElements(repeater)) {
        for (const inner of repeater.groupElements) {
          repeaterInnerAliases.add(inner.alias);
        }
      }
    }

    const currentAlias = currentFieldAlias.value;
    const currentNumericId = currentAlias
      ? extractFieldNumericId(currentAlias)
      : 999;

    const result: IAvailableField[] = [];
    const seen = new Set<string>();

    for (const field of allFields) {
      if (!field.alias || seen.has(field.alias)) continue;
      seen.add(field.alias);

      if (field.alias === currentAlias) continue;

      if (isTotal.value && repeaterInnerAliases.has(field.alias)) continue;

      const fieldType = extractFieldType(field.alias);
      const fieldId = extractFieldNumericId(field.alias);

      if (NON_CALCULABLE_TYPES.includes(fieldType)) continue;
      if (HIDDEN_FROM_FORMULA.includes(fieldType)) continue;
      if (typeof field._id === "undefined") continue;

      if (fieldType === "total" && field.alias !== "total") {
        if (fieldId >= currentNumericId) continue;
      }

      result.push({
        alias: field.alias,
        label: field.label,
        letter: numHash(
          typeof field._id === "string"
            ? parseInt(field._id, 10)
            : (field._id ?? 0),
        ),
        _id: field._id,
      });
    }

    return result;
  });

  return { availableFields };
}

/**
 * Composable that provides available fields scoped to a repeater's inner elements only.
 * Used by the Repeater field settings so its formula only references its own children.
 */
export function useRepeaterFormulaAliases(
  repeaterAlias: Ref<string | undefined>,
) {
  const builderStore = useBuilderStore();

  const availableFields = computed<IAvailableField[]>(() => {
    const alias = repeaterAlias.value;
    if (!alias) return [];

    const builderFields = builderStore.getBuilderFields;
    if (!builderFields.length) return [];

    let repeaterField: IField | undefined;
    for (const page of builderFields) {
      for (const section of page.groupElements) {
        for (const field of section.fields) {
          if (field.alias === alias) {
            repeaterField = field;
            break;
          }
        }
        if (repeaterField) break;
      }
      if (repeaterField) break;
    }

    if (!repeaterField || !hasGroupElements(repeaterField)) return [];

    const result: IAvailableField[] = [];
    for (const child of repeaterField.groupElements) {
      if (!child.alias) continue;

      const fieldType = extractFieldType(child.alias);
      if (NON_CALCULABLE_TYPES.includes(fieldType)) continue;
      if (HIDDEN_FROM_FORMULA.includes(fieldType)) continue;
      if (typeof child._id === "undefined") continue;

      result.push({
        alias: child.alias,
        label: child.label,
        letter: numHash(
          typeof child._id === "string"
            ? parseInt(child._id, 10)
            : (child._id ?? 0),
        ),
        _id: child._id,
      });
    }

    return result;
  });

  return { availableFields };
}
