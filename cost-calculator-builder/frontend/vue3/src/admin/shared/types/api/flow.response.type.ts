import {
  ITemplate,
  ITemplateCategory,
} from "@/admin/shared/types/template.type";
import { ICalculator } from "@/admin/shared/types/calculator.type";

export interface IFetchTemplatesResponse {
  success: boolean;
  message: string;
  data: {
    templates: ITemplate[];
    favorites: number[];
    categories: ITemplateCategory[];
    admin_email: string;
    pro_active: boolean;
    unlock: boolean;
  };
}

export interface IFetchCalculatorsResponse {
  success: boolean;
  message: string;
  data: {
    calculators: ICalculator[];
    total: number;
  };
}

export interface ICreateCalculatorResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    url: string;
  };
}

export interface IEditCalculatorResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
  };
}

export interface IUseTemplateResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
  };
}

export interface IDeleteTemplateResponse {
  success: boolean;
  message: string;
  templates?: ITemplate[] | Record<string, ITemplate>;
  data: unknown[];
}

export interface IDeleteCalculatorsResponse {
  success: boolean;
  message: string;
}

export interface IDuplicateCalculatorsResponse {
  success: boolean;
  message: string;
}

export interface IAddFavoriteTemplateResponse {
  success: boolean;
  message: string;
  data: {
    favorites: number[];
  };
}
