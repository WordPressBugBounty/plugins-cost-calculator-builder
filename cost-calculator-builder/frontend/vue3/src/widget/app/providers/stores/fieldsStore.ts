import { defineStore } from "pinia";
import {
  Field,
  IDefaultTotal,
  IRepeaterField,
  ISourceField,
} from "@/widget/shared/types/fields";
import { useFields } from "@/widget/actions/fields/composable/useFields.ts";
import { useConditionsStore } from "@/widget/app/providers/stores/conditionsStore.ts";
import { useSettingsStore } from "./settingsStore";
import { useFieldsRequired } from "@/widget/actions/fields/composable/useFieldsRequired.ts";
import { useAppStore } from "./appStore";

interface IFieldsStore {
  fields: Map<string, Field>;
  pages: Map<string, Field>;
  defaultTotals: IDefaultTotal | null;
  activePageIndex: number;
  pageBreakEnabled: boolean;
}

const fieldsInstance = useFields();
const requiredFieldsInstance = useFieldsRequired();
const randomId = Math.random().toString(36).substring(2, 15);

export const useFieldsStore = defineStore(`fieldsStore_${randomId}`, {
  state: (): IFieldsStore => ({
    fields: new Map(),
    pages: new Map(),
    defaultTotals: null,
    activePageIndex: 0,
    pageBreakEnabled: false,
  }),

  getters: {
    getActivePageIndex(): number {
      return this.activePageIndex;
    },

    getFields(): Field[] {
      return fieldsInstance.getFields();
    },

    getPages(): Field[] {
      return fieldsInstance.getPages() || [];
    },

    getPageBreakFields(): Field[] {
      const pages = fieldsInstance.getPages();
      if (!pages) {
        return [];
      }
      return pages.filter((f: any) => f.type === "page-break");
    },

    getSummaryList(): Field[] {
      const settings = useSettingsStore();

      if (Array.isArray(this.getFields)) {
        let fields: Field[] = this.getFields.filter(
          (f: { fieldName: string; addToSummary: boolean }) => {
            const excludeFields = ["total", "line", "html"];

            if (excludeFields.includes(f.fieldName) || !f.addToSummary) {
              return false;
            }

            return true;
          },
        );

        if (!settings.general?.hideEmpty) {
          fields = fields.filter((f) =>
            ["validated_form", "text"].includes(f.fieldName)
              ? f.displayValue
              : f.value || f.fieldName === "repeater",
          );
        }

        return fields;
      }

      return [];
    },

    getTotalsList(state: IFieldsStore): Field[] {
      const settings = useSettingsStore();
      if (Array.isArray(this.getFields)) {
        let totals = this.getFields?.filter((f: { fieldName: string }) => {
          return (
            f.fieldName === "total" ||
            (f.fieldName === "repeater" &&
              ((f as IRepeaterField).sumAllAvailable ||
                (f as IRepeaterField).enableFormula))
          );
        });

        if (totals.length === 0) {
          return [state.defaultTotals] as Field[];
        }

        if (!settings.general?.hideEmpty) {
          totals = totals.filter((f) => f.value);
        }

        return totals;
      }

      return [state.defaultTotals] as Field[];
    },

    getField() {
      return (alias: string) => fieldsInstance.getField(alias);
    },

    getDefaultTotals(state: IFieldsStore) {
      return state.defaultTotals;
    },
  },

  actions: {
    updateActivePageIndex(index: number): void {
      this.activePageIndex = index;
    },

    initPageBreaker(dataFields: ISourceField[] = []) {
      for (const field of dataFields) {
        if (field.type === "page-break") {
          fieldsInstance.addPage(field);
        }
      }
    },

    initFields(dataFields: ISourceField[] = []) {
      const appStore = useAppStore();
      const proFields: string[] = [
        "radio_with_img",
        "dropDown_with_img",
        "checkbox_with_img",
        "file_upload",
        "multi_range",
        "geolocation",
        "datePicker",
        "timePicker",
        "repeater",
        "group",
        "validated_form",
      ];

      const conditionStore = useConditionsStore();
      for (const field of dataFields) {
        const fieldName = field.alias.replace(/\_field_id.*/, "");
        if (!appStore.isProActive && proFields.includes(fieldName)) {
          continue;
        }

        if (field.type === "page-break" && field.groupElements) {
          field.groupElements.forEach((item) => {
            const itemFieldName = item.alias.replace(/\_field_id.*/, "");

            if (!appStore.isProActive && proFields.includes(itemFieldName)) {
              return;
            }
            const createField = fieldsInstance.addField(item);
            this.fields.set(item.alias, createField);
          });
          fieldsInstance.setPageBreakEnabled(true);
        } else {
          const createdField = fieldsInstance.addField(field);
          if (createdField) {
            this.fields.set(field.alias, createdField);
          }
        }
      }

      this.recalculateTotals();
      conditionStore.triggerCondition();
    },

    updateField(alias: string, field: Field): void {
      fieldsInstance.updateField(alias, field);
    },

    recalculateTotals() {
      fieldsInstance.recalculateTotals();
    },

    checkRequiredFields(): boolean {
      return !requiredFieldsInstance.hasRequiredFields(
        fieldsInstance.getFields(),
      );
    },

    checkPageRequiredFields(fields: Field[]): boolean {
      return !requiredFieldsInstance.hasRequiredFields(fields);
    },

    checkFieldRequired(field: Field): boolean {
      return requiredFieldsInstance.checkFieldRequired(field);
    },

    setDefaultTotals(totals: IDefaultTotal) {
      this.defaultTotals = totals;
    },
  },
});
