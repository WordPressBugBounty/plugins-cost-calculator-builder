import { defineStore } from "pinia";
import {
  ICalculatorRawFields,
  IPageBreaker,
  ITotalForSettings,
  IField,
  ISection,
  IGroupField,
} from "@/admin/shared/types/fields.type";
import {
  CalculatorAdminPage,
  IBuilderContent,
  builderContentType,
  builderActiveTabType,
  builderSidebarContentType,
} from "@/admin/shared/types/builder.type";
import {
  findFieldLocation,
  generatePageId,
  generateSectionId,
  generateFieldId,
} from "@/admin/shared/utils/useFieldUtils";
import { getFieldDefaults } from "@/admin/shared/defaults";
import { getStaticFieldStructure } from "@/admin/shared/defaults/field-structure";
import { ICalculatorBuilderData } from "@/admin/shared/types/api/admin.response.type";
import { useConditionsStore } from "@/admin/app/providers/stores/useConditionsStore";

interface IBuilderStore {
  rawFields: ICalculatorRawFields[];
  builderFields: IPageBreaker[];
  builderContent: IBuilderContent;
  activePage: number;
  currentCalculatorPage: CalculatorAdminPage;
  settingsActiveSection: string;
  selectedFieldAlias: string | null;
  pageNavigationSelected: boolean;
  pageSettingsSelected: boolean;
  isDragging: boolean;
}

export const useBuilderStore = defineStore("builder_store", {
  state: (): IBuilderStore => ({
    rawFields: [],
    builderFields: [],
    builderContent: {
      content: "calculator" as builderContentType,
      activeTab: "elements" as builderActiveTabType,
      sidebarCollapse: false,
      sidebarContent: "builder" as builderSidebarContentType,
    },
    activePage: 0,
    currentCalculatorPage: "builder",
    settingsActiveSection: "currency",
    selectedFieldAlias: null,
    pageNavigationSelected: false,
    pageSettingsSelected: false,
    isDragging: false,
  }),

  getters: {
    getSidebarCollapse: (state: IBuilderStore): boolean =>
      state.builderContent.sidebarCollapse,

    getBuilderContent: (state: IBuilderStore): IBuilderContent =>
      state.builderContent,

    getRawFields: (state: IBuilderStore): ICalculatorRawFields[] =>
      state.rawFields,

    getBuilderFields: (state: IBuilderStore): IPageBreaker[] =>
      state.builderFields || [],

    getActivePage: (state: IBuilderStore): number => state.activePage,
    getCurrentCalculatorPage: (state: IBuilderStore): CalculatorAdminPage =>
      state.currentCalculatorPage,
    getSettingsActiveSection: (state: IBuilderStore): string =>
      state.settingsActiveSection,

    getSelectedFieldAlias: (state: IBuilderStore): string | null =>
      state.selectedFieldAlias,

    getPageNavigationSelected: (state: IBuilderStore): boolean =>
      state.pageNavigationSelected,

    getPageSettingsSelected: (state: IBuilderStore): boolean =>
      state.pageSettingsSelected,

    getIsDragging: (state: IBuilderStore): boolean => state.isDragging,

    getSelectedField: (state: IBuilderStore): IField | ISection | null => {
      if (!state.selectedFieldAlias) return null;

      const sections = state.builderFields.flatMap(
        (page) => page.groupElements,
      );
      const fields = state.builderFields.flatMap((page) =>
        page.groupElements.flatMap((section) => section.fields),
      );
      const result: Array<IField | ISection> = [...sections];

      for (const field of fields) {
        if ("groupElements" in field && Array.isArray(field.groupElements)) {
          result.push(field);
          result.push(...(field as IGroupField).groupElements);
        } else {
          result.push(field);
        }
      }

      return (
        result.find((field) => field.alias === state.selectedFieldAlias) || null
      );
    },

    getActivePageData: (state: IBuilderStore): IPageBreaker | null =>
      state.builderFields[state.activePage] || null,

    getTotalElements: (state: IBuilderStore): ITotalForSettings[] => {
      const totalElements: ITotalForSettings[] = [];
      for (const page of state.builderFields) {
        for (const section of page.groupElements) {
          for (const field of section.fields) {
            const isTotal = field.type?.toLowerCase() === "total";
            const isFormulaRepeater =
              field.type === "repeater" &&
              ("enableFormula" in field || "sumAllAvailable" in field) &&
              ((field as any).enableFormula || (field as any).sumAllAvailable);

            if (isTotal || isFormulaRepeater) {
              totalElements.push({
                alias: field.alias,
                title: field.label,
                pageId: field.pageId,
                sectionId: field.sectionId,
                idx: field.index,
              } as ITotalForSettings);
            }
          }
        }
      }

      return totalElements;
    },

    getPages: (state: IBuilderStore): number[] => {
      return state.builderFields.map((page) => Number(page._id || 0) + 1);
    },

    getPageElementsById: (state: IBuilderStore): ((id: number) => IField[]) => {
      return (id: number): IField[] => {
        const pages = state.builderFields.filter(
          (page) => Number(page._id || 0) === id - 1,
        );

        return pages.flatMap((page) =>
          page.groupElements.flatMap((section) => section.fields),
        );
      };
    },

    getFieldByAlias: (
      state: IBuilderStore,
    ): ((alias: string) => IField | undefined) => {
      return (alias: string): IField | undefined => {
        const fields = state.builderFields.flatMap((page) =>
          page.groupElements.flatMap((section) => section.fields),
        );

        const result: IField[] = [];

        for (const field of fields) {
          if ("groupElements" in field && Array.isArray(field.groupElements)) {
            result.push(field);
            result.push(...(field as IGroupField).groupElements);
          } else {
            result.push(field);
          }
        }

        return result.find((field) => field.alias === alias);
      };
    },
  },

  actions: {
    setSidebarCollapse(collapse: boolean): void {
      this.builderContent.sidebarCollapse = collapse;
    },

    setBuilderContent(content: builderContentType): void {
      this.builderContent.content = content;
    },

    setSidebarContent(content: builderSidebarContentType): void {
      this.builderContent.sidebarContent = content;
    },

    setRawFields(fields: ICalculatorRawFields[]): void {
      this.rawFields = fields;
    },

    initBuilder(builder: ICalculatorBuilderData): void {
      this.setRawFields(builder.fields);
      this.setBuilderFields(builder.builder);
      this.syncFieldsStructure();
    },

    setBuilderFields(fields: IPageBreaker[]): void {
      this.builderFields = fields;
      if (this.builderFields.length === 0) {
        this.addPage();
      }
      this.activePage = 0;
      this.selectedFieldAlias = null;
    },

    syncFieldsStructure(): void {
      if (!this.builderFields?.length) return;

      const syncField = (field: IField): IField => {
        const currentField = field as unknown as Record<string, unknown>;
        const defaults = getStaticFieldStructure(field.type) as Record<
          string,
          unknown
        >;
        const mergedField = { ...defaults, ...currentField } as Record<
          string,
          unknown
        >;

        const defaultStyles =
          (defaults.styles as Record<string, unknown> | undefined) || {};
        const currentStyles =
          (currentField.styles as Record<string, unknown> | undefined) || {};

        if (
          Object.keys(defaultStyles).length ||
          Object.keys(currentStyles).length
        ) {
          mergedField.styles = { ...defaultStyles, ...currentStyles };
        }

        const defaultCurrencySettings =
          (defaults.fieldCurrencySettings as
            | Record<string, unknown>
            | undefined) || {};
        const currentCurrencySettings =
          (currentField.fieldCurrencySettings as
            | Record<string, unknown>
            | undefined) || {};

        if (
          Object.keys(defaultCurrencySettings).length ||
          Object.keys(currentCurrencySettings).length
        ) {
          mergedField.fieldCurrencySettings = {
            ...defaultCurrencySettings,
            ...currentCurrencySettings,
          };
        }

        const currentGroupElements = currentField.groupElements as
          | IField[]
          | undefined;
        if (Array.isArray(currentGroupElements)) {
          mergedField.groupElements = currentGroupElements.map(syncField);
        }

        return mergedField as unknown as IField;
      };

      this.builderFields = this.builderFields.map((page) => ({
        ...page,
        groupElements: page.groupElements.map((section) => ({
          ...section,
          fields: section.fields.map(syncField),
        })),
      }));
    },

    setActivePage(index: number): void {
      if (index >= 0 && index <= this.builderFields.length) {
        this.activePage = index;
        this.selectedFieldAlias = null;
      }
    },

    setCurrentCalculatorPage(page: CalculatorAdminPage): void {
      this.currentCalculatorPage = page;
    },

    setSettingsActiveSection(section: string): void {
      this.settingsActiveSection = section;
    },

    setSelectedField(alias: string | null): void {
      this.selectedFieldAlias = alias;
      if (alias) {
        this.pageNavigationSelected = false;
        this.pageSettingsSelected = false;
      }
    },

    setPageNavigationSelected(value: boolean): void {
      this.pageNavigationSelected = value;
      if (value) {
        this.selectedFieldAlias = null;
        this.pageSettingsSelected = false;
      }
    },

    setPageSettingsSelected(value: boolean): void {
      this.pageSettingsSelected = value;
      if (value) {
        this.selectedFieldAlias = null;
        this.pageNavigationSelected = false;
      }
    },

    setDragging(value: boolean): void {
      this.isDragging = value;
    },

    createEmptySection(label?: string): ISection {
      const id = generateSectionId(this.builderFields);
      return {
        fields: [],
        alias: `section_field_id_${id}`,
        description: "",
        label: label || "Section",
        letter: "",
        type: "section",
        _id: id,
      };
    },

    addPage(): void {
      const pageIndex = this.builderFields.length;
      const id = generatePageId(this.builderFields);
      const newPage: IPageBreaker = {
        alias: `page_break_field_id_${id}`,
        description: "",
        groupElements: [this.createEmptySection(`Section #1`)],
        label: `Page ${pageIndex + 1}`,
        letter: "",
        type: "page-break",
        _id: id,
        previousBtnLabel: "Back",
        nextBtnLabel: "Next",
      };
      this.builderFields.push(newPage);
      this.activePage = this.builderFields.length - 1;
      this.setBuilderContent("calculator");
    },

    removePage(index: number): void {
      if (this.builderFields.length <= 1) return;
      this.builderFields.splice(index, 1);
      if (this.activePage >= this.builderFields.length) {
        this.activePage = this.builderFields.length - 1;
      }
      if (
        this.selectedFieldAlias &&
        !findFieldLocation(this.builderFields, this.selectedFieldAlias)
      ) {
        this.selectedFieldAlias = null;
      }
    },

    addSection(pageIndex: number): void {
      const page = this.builderFields[pageIndex];
      if (!page) return;
      const sectionNumber = page.groupElements.length + 1;
      page.groupElements.push(
        this.createEmptySection(`Section #${sectionNumber}`),
      );
    },

    removeSection(pageIndex: number, sectionIndex: number): void {
      const page = this.builderFields[pageIndex];
      if (!page || page.groupElements.length <= 1) return;
      page.groupElements.splice(sectionIndex, 1);
      if (
        this.selectedFieldAlias &&
        !findFieldLocation(this.builderFields, this.selectedFieldAlias)
      ) {
        this.selectedFieldAlias = null;
      }
    },

    createFieldFromRaw(rawField: ICalculatorRawFields): IField {
      const id = generateFieldId(this.builderFields);
      const typeDefaults = getFieldDefaults(rawField.type);

      const aliasPrefix =
        typeDefaults.alias?.replace(/_field_id_?$/, "") ?? rawField.type;

      const baseField = {
        id,
        label: rawField.name,
        fieldName: rawField.name,
        alias: `${aliasPrefix}_field_id_${id}`,
        hidden: false,
        type: rawField.type,
        _id: String(id),
        _tag: rawField.tag,
        icon: rawField.icon,
        pageId: "",
        sectionId: "",
        index: 0,
        width: rawField.width || 100,
      };

      return { ...typeDefaults, ...baseField } as IField;
    },

    addField(rawField: ICalculatorRawFields): void {
      const page = this.builderFields[this.activePage];
      if (!page) return;

      if (page.groupElements.length === 0) {
        page.groupElements.push(this.createEmptySection("Section #1"));
      }

      const newField = this.createFieldFromRaw(rawField);
      const lastSection = page.groupElements[page.groupElements.length - 1];
      lastSection.fields.push(newField);
    },

    duplicateField(alias: string): void {
      const location = findFieldLocation(this.builderFields, alias);
      if (!location) return;

      const { pageIndex, sectionIndex, fieldIndex, groupIndex } = location;
      const section = this.builderFields[pageIndex].groupElements[sectionIndex];

      if (groupIndex !== undefined) {
        const group = section.fields[fieldIndex] as IGroupField;
        const original = group.groupElements[groupIndex];
        const clone: IField = JSON.parse(JSON.stringify(original));
        const newId = generateFieldId(this.builderFields);

        clone._id = String(newId);
        clone.alias = original.alias.replace(/_\d+$/, "") + "_" + newId;
        clone.label = original.label + " (copy)";

        group.groupElements.splice(groupIndex + 1, 0, clone);
      } else {
        const original = section.fields[fieldIndex];
        const clone: IField = JSON.parse(JSON.stringify(original));
        const newId = generateFieldId(this.builderFields);

        clone._id = String(newId);
        clone.alias = original.alias.replace(/_\d+$/, "") + "_" + newId;
        clone.label = original.label + " (copy)";

        if (
          "groupElements" in clone &&
          Array.isArray((clone as IGroupField).groupElements)
        ) {
          (clone as IGroupField).groupElements = (
            clone as IGroupField
          ).groupElements.map((child) => {
            const childId = generateFieldId(this.builderFields);
            return {
              ...child,
              _id: String(childId),
              alias: child.alias.replace(/_\d+$/, "") + "_" + childId,
            };
          });
        }

        section.fields.splice(fieldIndex + 1, 0, clone);
      }
    },

    deleteField(alias: string): void {
      const location = findFieldLocation(this.builderFields, alias);
      if (!location) return;

      const { pageIndex, sectionIndex, fieldIndex, groupIndex } = location;
      const section = this.builderFields[pageIndex].groupElements[sectionIndex];

      if (groupIndex !== undefined) {
        const group = section.fields[fieldIndex] as IGroupField;
        group.groupElements.splice(groupIndex, 1);
      } else {
        section.fields.splice(fieldIndex, 1);
      }

      if (this.selectedFieldAlias === alias) {
        this.selectedFieldAlias = null;
      }

      const cs = useConditionsStore();
      cs.removeByAlias(alias);
    },

    updateFieldWidth(alias: string, width: number): void {
      for (const page of this.builderFields) {
        for (const section of page.groupElements) {
          for (const field of section.fields) {
            if (field.alias === alias) {
              field.width = width;
              return;
            }
            if (
              "groupElements" in field &&
              Array.isArray((field as IGroupField).groupElements)
            ) {
              for (const child of (field as IGroupField).groupElements) {
                if (child.alias === alias) {
                  child.width = width;
                  return;
                }
              }
            }
          }
        }
      }
    },

    moveFieldToPage(alias: string, targetPageIndex: number): void {
      const location = findFieldLocation(this.builderFields, alias);
      if (!location) return;

      const { pageIndex, sectionIndex, fieldIndex, groupIndex } = location;
      if (pageIndex === targetPageIndex) return;

      let fieldToMove: IField;

      if (groupIndex !== undefined) {
        const group = this.builderFields[pageIndex].groupElements[sectionIndex]
          .fields[fieldIndex] as IGroupField;
        [fieldToMove] = group.groupElements.splice(groupIndex, 1);
      } else {
        [fieldToMove] = this.builderFields[pageIndex].groupElements[
          sectionIndex
        ].fields.splice(fieldIndex, 1);
      }

      const targetPage = this.builderFields[targetPageIndex];
      if (!targetPage) return;

      if (targetPage.groupElements.length === 0) {
        targetPage.groupElements.push(this.createEmptySection("Section #1"));
      }

      targetPage.groupElements[0].fields.push(fieldToMove);
      this.activePage = targetPageIndex;
      this.selectedFieldAlias = null;
    },
  },
});
