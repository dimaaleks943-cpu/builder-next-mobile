

export interface IPrice {
  id: string | null;
  distributor_id: number;
  product_variation_id: number | null;
  price: number | null;
  prices: IPricePrices[] | null;
  min_amount: number;
  price_group_id: number | null;
  price_group_title: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface IPricePrices {
  amount: number;
  price: number;
}
