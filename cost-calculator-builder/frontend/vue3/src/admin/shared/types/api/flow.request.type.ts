export interface IFetchFlowRequestParams {
  sortBy: "id" | "title" | "created_at";
  direction: "asc" | "desc";
  limit: number;
  page: number;
}

export interface IFetchTemplatesRequestParams {
  action: string;
  nonce: string;
}

export interface IFetchCalculatorsRequestParams {
  action: string;
  nonce: string;
  params: IFetchFlowRequestParams;
}

export interface ICreateCalculatorRequestParams {
  action: string;
  nonce: string;
}

export interface IEditCalculatorRequestParams {
  action: string;
  nonce: string;
  id: number;
}

export interface IUseTemplateRequestParams {
  action: string;
  nonce: string;
  template_id: number;
}

export interface IDeleteTemplateRequestParams {
  action: string;
  nonce: string;
  id: number;
}

export interface IDeleteCalculatorsRequestParams {
  action: string;
  nonce: string;
  ids: number[];
}

export interface IDuplicateCalculatorsRequestParams {
  action: string;
  nonce: string;
  ids: number[];
}

export interface IAddFavoriteTemplateRequestParams {
  action: string;
  nonce: string;
  template_id: number;
}
