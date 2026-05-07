export interface IImportCustomTotalRequestParams {
  action: "cost-calculator-custom-import-total";
  nonce: string;
  file: File;
  type?: "single";
}

export interface IImportRunRequestParams {
  action: "cost-calculator-import-run";
  nonce: string;
  step: string;
  key: number;
  is_custom_import?: boolean;
}

export interface IRunCalcUpdatesRequestParams {
  action: "calc_run_updates";
  nonce: string;
  access: boolean;
}

export interface IDemoImportTotalRequestParams {
  action: "cost-calculator-demo-calculators-total";
  nonce: string;
}
