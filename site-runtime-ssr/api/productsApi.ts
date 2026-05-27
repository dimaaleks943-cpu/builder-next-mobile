import type { IFullProduct, IProduct } from "@/interfaces/productTypes"

//TODO вынести
const API_BASE_URL = process.env.API_URL || "https://dev-api.cezyo.com"

interface ProductsListResponse {
  data?: IProduct[]
  links?: ProductsListLinks
}

interface ProductsListLinks {
  pagination?: ProductsListPagination
}

interface ProductsListPagination {
  offset?: number
  limit?: number
  count?: number
}

const PRODUCTS_FULL_ENDPOINT = "/v3/client/catalog/products/full"

const normalizeProductsListResponse = (json: unknown): IProduct[] => {
  if (Array.isArray(json)) return json as IProduct[]
  if (
    json &&
    typeof json === "object" &&
    Array.isArray((json as ProductsListResponse).data)
  ) {
    return (json as ProductsListResponse).data ?? []
  }
  return []
}

const setRangeQueryParams = (
  queryParams: URLSearchParams,
  range?: [number, number],
): void => {
  if (!range) return

  const [start, end] = range
  const offset = Math.max(0, start)
  const limit = Math.max(0, end - start + 1)
  queryParams.set("offset", String(offset))
  queryParams.set("limit", String(limit))
}

export const fetchProductsList = async (params?: {
  range?: [number, number]
  filter?: Record<string, unknown>
}): Promise<IFullProduct[] | null> => {
  try {
    const { filter, range } = params ?? {}
    const queryParams = new URLSearchParams()
    setRangeQueryParams(queryParams, range)
    if (filter) queryParams.set("filter", JSON.stringify(filter))

    const qs = queryParams.toString()
    const response = await fetch(
      `${API_BASE_URL}${PRODUCTS_FULL_ENDPOINT}${qs ? `?${qs}` : ""}`,
    )

    if (!response.ok) {
      console.error(
        "Failed to fetch products list:",
        response.status,
        response.statusText,
      )
      return null
    }

    const json: unknown = await response.json()
    const items = normalizeProductsListResponse(json)
    return items.map((core) => ({ core, distributorContent: null }))
  } catch (error) {
    console.error("Error fetching products list:", error)
    return null
  }
}

export const fetchProductBySlug = async (
  slug: string,
): Promise<IFullProduct | null> => {
  const trimmed = slug.trim()
  if (!trimmed) return null

  const products = await fetchProductsList({ filter: { slug: trimmed } })
  return products?.[0] ?? null
}
