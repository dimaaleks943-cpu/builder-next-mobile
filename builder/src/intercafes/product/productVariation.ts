import type { IStock } from "./stock.ts";
import type { IPrice } from "./price.ts";


export enum ProductVariationStatus {
  ACTIVE = "active",
  DELETED = "deleted",
  INACTIVE = "inactive",
}


export enum ProductVariationPropertyType {
  LIST = "list",
  COLOR = "color",
  FLOAT = "float",
  BOOLEAN = "boolean",
}

export interface IProductVariationPropertyListValue {
  id: number | null;
  distributor_id: number | null;
  value: string;
  additional: {
    hex: string;
  } | null;
}

export interface IProductVariationProperty {
  id: number | null;
  distributor_id: number | null;
  name: string | null;
  type: ProductVariationPropertyType;
  unit: string | null;
  internal_id: string | null;
  in_variation: boolean;
  value_float?: number;
  value_boolean?: boolean;
  list_values?: IProductVariationPropertyListValue[];
  inputId?: string;
}

export interface IProductVariationPackaging {
  weight: number | null;
  weight_unit: string | null;
  length: number | null;
  length_unit: string | null;
  height: number | null;
  height_unit: string | null;
  width: number | null;
  width_unit: string | null;
}

export interface IProductVariationNutrition {
  calories: number | null;
  fats: number | null;
  carbohydrates: number | null;
  proteins: number | null;
}

export interface IProductVariation {
  id: number;
  product_id: number;
  internal_id: string | null;
  status: ProductVariationStatus;
  sku: string | null;
  distributor_sku: string | null;
  barcode: string | null;
  weight: number | null;
  weight_unit: string | null;
  additional_skus: string[];
  orders_count: number;
  distributor_id: number | null;
  nutrition: IProductVariationNutrition;
  packaging: IProductVariationPackaging[];
  product_variation_id: number | null;

  //через with
  Stocks?: IStock[];
  Prices?: IPrice[];
  properties: IProductVariationProperty[];
}
