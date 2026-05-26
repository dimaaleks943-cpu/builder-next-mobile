export interface IProductImag {
  id: string;
  sort: number | null;
  group_property_value_id: number | null;
  urls: {
    original: string;
    small: string;
  };
  status: string;
}
