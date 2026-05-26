export interface IStock {
  id: string | null;
  product_variation_id: number | null;
  distributor_id: number | null;
  distributor_warehouse_id: number | null;
  distributor_warehouse_name: string | null;
  quantity: number | null;
  created_at: string | null;
  updated_at: string | null;
  reserved: number;
  available: boolean;
  countable: boolean;
}
