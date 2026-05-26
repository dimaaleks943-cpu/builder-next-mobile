import { useCallback, useMemo } from "react"
import type { IContentItem, ProductsListQueryParams } from "../api/extranet"
import { type IProduct, useGetProductsListQuery, } from "../store/productsApi"


export interface UseFullProductsListParams {
  params?: ProductsListQueryParams
  skip?: boolean
}

/** Хук для получения продукта + доп полей из контент продукта */
export const useFullProductsList = ({
  params,
  skip = false,
}: UseFullProductsListParams = {}) => {
  const productsQuery = useGetProductsListQuery({ params }, { skip })

  // useGetDistributorProductsQuery( //TODO будущий хук для получения контент продукта, запрашивается по массиву ид полученных продуктов

  /** Мердж продукта и контект продукта */
  const products = useMemo((): IFullProduct[] => {
    const items = productsQuery.data?.data ?? []
    return items.map((core) => mergeProductWithContent(core, []))
  }, [productsQuery.data])

  const refetch = useCallback(() => {
    void productsQuery.refetch()
  }, [productsQuery.refetch])

  return {
    products,
    total: productsQuery.data?.total ?? 0,
    isLoading: productsQuery.isLoading,
    isFetching: productsQuery.isFetching,
    isError: productsQuery.isError,
    error: productsQuery.error,
    refetch,
  }
}

export interface IFullProduct {
  core: IProduct
  distributorContent: IContentItem | null
}

const mergeProductWithContent = (
  core: IProduct,
  distributorItems: IContentItem[],
  productId?: number,
): IFullProduct => {
  const id = productId ?? core.id
  if (id == null || !distributorItems.length) {
    return { core, distributorContent: null }
  }

  const match = distributorItems.find((item) => Number(item.id) === id)
  return { core, distributorContent: match ?? null }
}
