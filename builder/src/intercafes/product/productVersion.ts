import type { IProduct } from "./product.ts";
import { ProductVersionEnum } from "./product.ts";


export interface IProductVersions extends Omit<IProduct, "ProductVersions"> {
  version_type: ProductVersionEnum;
  product_id: number;
  block_date?: string;
}
