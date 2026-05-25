import { useCallback, useMemo } from "react"
import type { ProductsListQueryParams } from "../api/extranet"
import {
  useGetDistributorProductsQuery,
  useGetProductsListQuery,
} from "../store/productsApi"
import {
  mergeProductWithDistributor,
  type IFullProduct,
} from "./mergeProductWithDistributor"

export type { IFullProduct }

export interface UseFullProductParams {
  productId: number
  distributorId?: number
  skip?: boolean
}

export interface UseFullProductsListParams {
  params?: ProductsListQueryParams
  distributorId?: number
  skip?: boolean
}

export const useFullProduct = ({
  productId,
  distributorId,
  skip = false,
}: UseFullProductParams) => {
  const productsQuery = useGetProductsListQuery(
    {
      params: {
        filter: { id: [productId] },
        range: [0, 0],
      },
    },
    { skip: skip || !productId },
  )

  // Пока distributor API пуст — запрос пропускаем; позже: skip: !distributorId
  useGetDistributorProductsQuery(
    {
      params: {
        filter: {
          ...(distributorId != null
            ? { distributor_id: [distributorId] }
            : {}),
          product_id: [productId],
        },
      },
    },
    { skip: true },
  )

  const product = useMemo((): IFullProduct | null => {
    const core = productsQuery.data?.data?.[0]
    if (!core) return null
    return mergeProductWithDistributor(core, [], productId)
  }, [productsQuery.data, productId])

  const refetch = useCallback(() => {
    void productsQuery.refetch()
  }, [productsQuery.refetch])

  return {
    product,
    isLoading: productsQuery.isLoading,
    isFetching: productsQuery.isFetching,
    isError: productsQuery.isError,
    error: productsQuery.error,
    refetch,
  }
}

export const useFullProductsList = ({
  params,
  distributorId,
  skip = false,
}: UseFullProductsListParams = {}) => {
  const productsQuery = useGetProductsListQuery({ params }, { skip })

  useGetDistributorProductsQuery(
    {
      params: {
        filter:
          distributorId != null
            ? { distributor_id: [distributorId] }
            : undefined,
      },
    },
    { skip: true },
  )

  const products = useMemo((): IFullProduct[] => {
    const items = productsQuery.data?.data ?? []
    return items.map((core) => mergeProductWithDistributor(core, []))
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
