export interface IAvailableField {
  alias: string;
  label: string;
  letter: string;
  _id: string | number | null;
}

export interface IFormulaBuilderProps {
  modelValue: string;
  availableFields: IAvailableField[];
  fieldAlias?: string;
}

export interface IFormulaDiagnostic {
  from: number;
  to: number;
  severity: "error" | "warning";
  message: string;
}

export interface IToolbarItem {
  label: string;
  insertText: string;
  title?: string;
}
