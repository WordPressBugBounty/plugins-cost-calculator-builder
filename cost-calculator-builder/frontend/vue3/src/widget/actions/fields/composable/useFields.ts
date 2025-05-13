import {
  createTextField,
  createHtmlField,
  createRangeField,
  createDividerField,
  createFormulaField,
  createQuantityField,
  createFileUploadField,
  createDatePickerField,
  createMultiRangeField,
  createTimePickerField,
  createGeolocationField,
  createMultiOptionsField,
  createSingleOptionField,
  createRepeaterField,
  createGroupField,
  createValidatedFormField,
} from "./useFieldFactory";

import {
  Field,
  IOptions,
  ISourceField,
  IFormulaField,
  IRepeaterField,
} from "@/widget/shared/types/fields";

import { useCurrency } from "@/widget/actions/fields/composable/useCurrency.ts";
import { convertKeysToCamelCase } from "@/widget/shared/utils/convert-case-to-camel-case.utils.ts";
import { useDiscounts } from "@/widget/actions/discounts/composable/useDiscounts.ts";
import { useSubmissionStore } from "@/widget/app/providers/stores/submissionStore.ts";
import { useAppStore } from "@/widget/app/providers/stores/appStore.ts";
import { useFieldsRequired } from "@/widget/actions/fields/composable/useFieldsRequired.ts";
import { useOrderFormStore } from "@/widget/app/providers/stores/orderFormStore.ts";
import { usePaymentAfterSubmitStore } from "@/widget/app/providers/stores/paymentAfterSubmit";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { IPageBreakerField } from "@/widget/shared/types/fields/fields.type";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";

let timeout: ReturnType<typeof setTimeout> | null = null;

interface IFieldsResult {
  getActivePage: () => IPageBreakerField;
  updateActivePageIndex: (index: number) => void;
  getPageIndex: (alias: string) => number;
  addField: (
    data: ISourceField,
    repeaterIdx?: number,
    repeaterAlias?: string,
  ) => Field;
  updateField: (alias: string, field: Field) => void;
  resetFields: () => void;
  getFields: () => Field[];
  getField: (alias: string) => Field | undefined;
  recalculateTotals: () => void;
  getPageBreakEnabled: () => boolean;
  setPageBreakEnabled: (bool: boolean) => void;
  addPage: (data: any) => void;
  getPages: () => Field[] | undefined;
  parseContactFormDescriptions: () => string;
  parseContactFormTotals: (formulas: string[]) => string;
}

const discountStore = useDiscounts();

function addField(
  data: ISourceField,
  repeaterIdx?: number,
  repeaterAlias?: string,
): Field {
  data = convertKeysToCamelCase(data);

  const fieldName: string = data.alias.replace(/\_field_id.*/, "");
  const options: IOptions[] = (data.options || []) as IOptions[];

  if (options.length) {
    for (let i = 0; i < options?.length; i++) {
      const option = options[i];
      if (!option.optionValue.includes("_")) {
        options[i].optionValue = `${option.optionValue}_${i}`;
      }
    }

    data.options = options;
  }

  let field;

  switch (fieldName) {
    case "quantity":
      field = createQuantityField(data);
      break;
    case "radio":
    case "dropDown":
    case "radio_with_img":
    case "dropDown_with_img":
      field = createSingleOptionField(data);
      break;
    case "checkbox":
    case "toggle":
    case "checkbox_with_img":
      field = createMultiOptionsField(data);
      break;
    case "text":
      field = createTextField(data);
      break;
    case "line":
      field = createDividerField(data);
      break;
    case "html":
      field = createHtmlField(data);
      break;
    case "file_upload":
      field = createFileUploadField(data);
      break;
    case "range":
      field = createRangeField(data);
      break;
    case "multi_range":
      field = createMultiRangeField(data);
      break;
    case "geolocation":
      field = createGeolocationField(data);
      break;
    case "datePicker":
      field = createDatePickerField(data);
      break;
    case "timePicker":
      field = createTimePickerField(data);
      break;
    case "total":
      field = createFormulaField(data);
      break;
    case "repeater":
      field = createRepeaterField(data);
      break;
    case "group":
      field = createGroupField(data);
      break;
    case "validated_form":
      field = createValidatedFormField(data);
      break;
  }

  if (field && field.fieldName !== "repeater") {
    field.repeaterIdx = repeaterIdx;
    if ("repeaterAlias" in field) field.repeaterAlias = repeaterAlias;
  }

  return field as Field;
}

function addPage(field: Field): void {
  const fieldsStore = useFieldsStore();
  fieldsStore.pages.set(field.alias, field);
}

function updateField(alias: string, field: Field): void {
  const fieldsStore = useFieldsStore();
  const paymentAfterSubmitStore = usePaymentAfterSubmitStore();
  const settingsStore = useSettingsStore();
  const summaryDisplay = settingsStore.getFormSettings?.summaryDisplay;

  if (paymentAfterSubmitStore.getSubmit) {
    paymentAfterSubmitStore.setSubmit(false);
  }

  const orderFormStore = useOrderFormStore();

  if (!summaryDisplay?.enable) {
    orderFormStore.updateNextButton(false);
    orderFormStore.updateNextButtonStatus(true);
  }

  const fieldsRequired = useFieldsRequired();
  fieldsRequired.maybeStartValidation(getFieldsArray());

  if (fieldsStore.fields.has(alias)) {
    const submissionStore = useSubmissionStore();
    submissionStore.resetSubmissions();

    if (field.fieldName !== "total") {
      fieldsStore.fields.set(alias, field);
    } else {
      const currencyFormatter = useCurrency();
      if (alias && field) {
        field.displayValue = currencyFormatter.formatCurrency(
          field.value || 0,
          currencyFormatter.getCurrencyOptions(field),
        );
        fieldsStore.fields.set(alias, field);
      }
    }
    debouncedRecalculateTotals();
  } else if ("repeaterAlias" in field && field.repeaterAlias) {
    debouncedRecalculateTotals();
  }
}

function resetFields(): void {
  const fieldsStore = useFieldsStore();
  fieldsStore.fields.forEach((field: Field) => {
    if ("value" in field && field?.value) {
      field.value = Number(field.defaultValue || 0);
    }
  });
}

function getFieldsArray(): Field[] {
  const fieldsStore = useFieldsStore();
  return Array.from(fieldsStore.fields.values());
}

const updateFormulaHook = (): void => {
  setTimeout(() => {
    const appStore = useAppStore();

    const formulaList = getFieldsArray().filter(
      (f: Field) => f.fieldName === "total",
    );

    const repeaterList = getFieldsArray().filter(
      (f: Field) => f.fieldName === "repeater",
    );

    const formulas = [...formulaList, ...repeaterList];
    const event = new CustomEvent("ccb_formula_update", {
      detail: { formulas, calcId: appStore.getCalcId },
    });

    document.dispatchEvent(event);
  });
};

const debouncedRecalculateTotals = (): void => {
  const currencyFormatter = useCurrency();
  const fieldsStore = useFieldsStore();

  if (!fieldsStore.getDefaultTotals) {
    fieldsStore.setDefaultTotals({
      label: "Total",
      fieldName: "total",
      value: 0,
      displayValue: currencyFormatter.formatCurrency(
        0,
        currencyFormatter.getCurrencyOptions(),
      ),
    });
  }

  if (timeout) clearTimeout(timeout);

  timeout = setTimeout(() => {
    recalculateTotals();
    updateFormulaHook();
  }, 300);
};

function recalculateTotals(): void {
  const fieldsArray = getFieldsArray();
  const currencyFormatter = useCurrency();

  const repeaterFields: IRepeaterField[] = fieldsArray.filter(
    (f: Field) => f.fieldName === "repeater",
  ) as IRepeaterField[];

  let repeaterValue = 0;
  for (let repeater of repeaterFields) {
    if (repeater.sumAllAvailable || repeater.enableFormula) {
      if (repeater.sumAllAvailable) {
        for (const repeaterElement of repeater.groupElements) {
          for (const field of repeaterElement.values()) {
            repeaterValue += field.value || 0;
          }
        }

        repeater.value = repeaterValue;
        repeater.originalValue = repeaterValue;
        repeater.displayValue = currencyFormatter.formatCurrency(
          repeaterValue,
          currencyFormatter.getCurrencyOptions(repeater),
        );
      } else {
        let i: number = 0;
        const repeaterFormulas: Record<string, string> = {};

        if (!repeater.originalFormula) {
          repeater.originalFormula = repeater.formula;
        }

        for (const repeaterElement of repeater.groupElements) {
          repeaterFormulas[i] = repeater.originalFormula;
          const fieldsAliasList =
            repeaterFormulas[i].match(/\w+_field_id_\d+/g) || [];

          fieldsAliasList.forEach((alias: string) => {
            for (const field of repeaterElement.values()) {
              if (field.alias === alias) {
                let value = field.value || 0;
                repeaterFormulas[i] = repeaterFormulas[i].replace(
                  new RegExp("\\b" + alias + "\\b", "g"),
                  value.toString(),
                );
              }
            }
          });

          i++;
        }

        repeater.formula = Object.keys(repeaterFormulas)
          .map((key: string): string => `(${repeaterFormulas[key].trim()})`)
          .join(" + ");

        repeater.originalValue = eval(repeater.formula);
        repeater.value = repeater.originalValue;
        repeater = discountStore.applyDiscounts(repeater) as IRepeaterField;
      }
    }

    repeater.displayValue = currencyFormatter.formatCurrency(
      repeater.value || 0,
      currencyFormatter.getCurrencyOptions(repeater),
    );
    repeater.originalDisplayView = currencyFormatter.formatCurrency(
      repeater.originalValue || 0,
      currencyFormatter.getCurrencyOptions(repeater),
    );
  }

  const totalFields: IFormulaField[] = fieldsArray
    .filter((f: Field) => f.fieldName === "total")
    .sort((a: Field, b: Field) => a.id - b.id) as IFormulaField[];

  if (repeaterFields.length || totalFields.length) {
    const notTotalsIncludes: Record<string, IFormulaField> = {};
    const totalsIncludes: Record<string, IFormulaField> = {};

    totalFields.forEach((total) => {
      if (!total.originalFormula && total.formula) {
        total.originalFormula = total.formula;
      } else {
        total.formula = total.originalFormula;
      }

      const matches = total.formula.match(/total_field_id_\d+/g) || [];
      if (matches.length === 0) {
        notTotalsIncludes[total.alias] = total;
      } else {
        totalsIncludes[total.alias] = total;
      }
    });

    Object.values(notTotalsIncludes).forEach(evaluateFormula);
    Object.keys(totalsIncludes).forEach((key) => {
      const total = totalsIncludes[key];
      evaluateFormula(total);
      if (!notTotalsIncludes[key]) {
        notTotalsIncludes[key] = total;
        delete totalsIncludes[key];
      }
    });
  } else {
    const total = fieldsArray.reduce((acc, field) => {
      acc += field.value || 0;
      return acc;
    }, 0);

    const fieldsStore = useFieldsStore();
    if (fieldsStore.getDefaultTotals) {
      fieldsStore.getDefaultTotals.label = "Total";
      fieldsStore.getDefaultTotals.value = total;
      fieldsStore.getDefaultTotals.displayValue =
        currencyFormatter.formatCurrency(
          total,
          currencyFormatter.getCurrencyOptions(),
        );
    }
  }
}

const evaluateFormula = (total: IFormulaField): void => {
  const currencyFormatter = useCurrency();
  const fieldsStore = useFieldsStore();
  const fieldsMap: Map<string, Field> = fieldsStore.fields;

  const mergedFieldsMap: Map<string, Field> = new Map();

  for (const [key, field] of fieldsMap) {
    if ("groupElements" in field) {
      for (const repeaterElement of field.groupElements) {
        for (const field of repeaterElement.values()) {
          mergedFieldsMap.set(field.alias, field);
        }
      }
    } else {
      mergedFieldsMap.set(key, field);
    }
  }

  const fieldsAliasList = total.formula.match(/\w+_field_id_\d+/g) || [];

  fieldsAliasList.forEach((alias: string) => {
    const field = mergedFieldsMap.get(alias);

    if (field) {
      let value = field.hidden && !field.calculateHidden ? 0 : field.value || 0;
      total.formula = total.formula.replace(
        new RegExp("\\b" + alias + "\\b", "g"),
        value.toString(),
      );
    }
  });

  total.originalValue = eval(total.formula);
  total.value = total.originalValue;
  total = discountStore.applyDiscounts(total) as IFormulaField;
  total.displayValue = currencyFormatter.formatCurrency(
    total.value || 0,
    currencyFormatter.getCurrencyOptions(total),
  );
  total.originalDisplayView = currencyFormatter.formatCurrency(
    total.originalValue || 0,
    currencyFormatter.getCurrencyOptions(total),
  );

  fieldsMap.set(total.alias, total);
};

function getField(alias: string): Field | undefined {
  const fieldsStore = useFieldsStore();
  return fieldsStore.fields.get(alias);
}

function setPageBreakEnabled(bool: boolean): void {
  const fieldsStore = useFieldsStore();
  fieldsStore.pageBreakEnabled = bool;
}

function getPageBreakEnabled(): boolean {
  const fieldsStore = useFieldsStore();
  return fieldsStore.pageBreakEnabled;
}

function getPages(): Field[] {
  const fieldsStore = useFieldsStore();
  return Array.from(fieldsStore.pages.values());
}

function parseContactFormDescriptions(): string {
  const fieldsArray = getFieldsArray();
  const allFields: Field[] = [];

  const exceptions: string[] = ["total", "html", "line"];

  for (const field of fieldsArray) {
    if (exceptions.includes(field.fieldName)) {
      continue;
    }

    if (
      (["validated_form", "text"].includes(field.fieldName) &&
        field.displayValue === "") ||
      !field.value
    ) {
      continue;
    }

    if (field.fieldName === "repeater" && "groupElements" in field) {
      allFields.push(field);
      for (const repeaterElement of field.groupElements) {
        for (const field of repeaterElement.values()) {
          allFields.push(field);
        }
      }
    } else {
      allFields.push(field);
    }
  }

  let subtotal = "";
  for (const field of allFields) {
    if (!field.hidden) {
      subtotal += `\n${field.label} ${field.displayValue}`;
    }
  }

  return `${subtotal}\n`;
}

function parseContactFormTotals(formulas: string[]): string {
  const fieldsArray = getFieldsArray();

  let subtotal = "";

  for (const field of fieldsArray) {
    if (formulas.includes(field.alias) && !field.hidden) {
      subtotal += `\n${field.label} ${field.displayValue}`;
    }
  }

  if (!subtotal) {
    const formula = fieldsArray.find(
      (f) => f.fieldName === "total" || f.fieldName === "repeater",
    );

    if (formula) {
      subtotal = `\n${formula.label} ${formula.displayValue}`;
    }
  }

  return subtotal;
}

function getActivePage(): IPageBreakerField {
  const fieldsStore = useFieldsStore();
  const activePageIndex = fieldsStore.activePageIndex;
  const pages = getPages();
  return pages[activePageIndex] as IPageBreakerField;
}

function updateActivePageIndex(index: number): void {
  const fieldsStore = useFieldsStore();
  fieldsStore.activePageIndex = index;
}

function getPageIndex(alias: string): number {
  const pages = getPages();
  let index = pages.findIndex((page) => page.alias === alias);
  return index;
}

export function useFields(): IFieldsResult {
  return {
    getField,
    addField,
    updateField,
    resetFields,
    getFields: getFieldsArray,
    recalculateTotals: debouncedRecalculateTotals,
    setPageBreakEnabled,
    getPageBreakEnabled,
    addPage,
    getPages,
    getActivePage,
    updateActivePageIndex,
    getPageIndex,
    parseContactFormDescriptions,
    parseContactFormTotals,
  };
}
