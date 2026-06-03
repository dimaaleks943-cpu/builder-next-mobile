/** Узел категории поставщика (`GET /v3/client/distributors/{id}/categories`). */
export interface DistributorCategoryNode {
  id: number
  name: string
  slug: string
  sort: number
  /** Признак наличия дочерних категорий (не вложенный список). */
  children?: boolean
}

export interface DistributorCategoriesData {
  product_variations?: number
  categories?: DistributorCategoryNode[]
}

export interface DistributorCategoriesResponse {
  data?: DistributorCategoriesData
  links?: unknown
}
