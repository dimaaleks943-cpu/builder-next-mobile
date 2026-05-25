import type {
  IDistributorProductContent,
  IProduct,
} from "../api/extranet"

export interface IFullProduct {
  core: IProduct
  distributorContent: IDistributorProductContent | null
}

/**
 * Сопоставляет строку distributor content с core по `product_id` ↔ `id`.
 */
export const mergeProductWithDistributor = (
  core: IProduct,
  distributorItems: IDistributorProductContent[],
  productId?: number,
): IFullProduct => {
  const id = productId ?? core.id
  if (id == null || !distributorItems.length) {
    return { core, distributorContent: null }
  }

  const match = distributorItems.find((item) => item.product_id === id)
  return { core, distributorContent: match ?? null }
}
