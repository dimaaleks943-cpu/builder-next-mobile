export interface IProduct {
  id?: number
  name?: string
  slug?: string
  [key: string]: unknown
}

export interface IDistributorProductContent {
  id?: string
  distributor_id?: number
  product_id?: number
  [key: string]: unknown
}

export interface IFullProduct {
  core: IProduct
  distributorContent: IDistributorProductContent | null
}
