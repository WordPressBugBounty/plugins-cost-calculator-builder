import { ICalculator } from "@/admin/shared/types/calculator.type";

export type ImportInfoMap = Record<string, number>;

export interface IImportCustomTotalResponse {
  success: boolean;
  message: ImportInfoMap;
}

export type IDemoImportTotalResponse = ImportInfoMap;

export interface IImportRunResponse {
  success: boolean;
  step: string | null;
  key: number;
  data?: string;
  calculators?: ICalculator[];
  message?: string;
}

export interface IRunCalcUpdatesResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}
