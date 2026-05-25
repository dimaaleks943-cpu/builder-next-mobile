import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
import {
  EXTRANET_API_ROOT,
  EXTRANET_API_TOKEN,
  EXTRANET_SITES_BASE,
  type DistributorProductsQueryParams,
  type IDistributorProductContent,
  type IProduct,
  type PaginatedResponse,
} from "../api/extranet"

const prepareHeaders = (
  headers: Headers,
  { type }: { type: "query" | "mutation" },
) => {
  headers.set("Authorization", EXTRANET_API_TOKEN)
  headers.set("Accept", "application/json")
  if (type === "mutation") {
    headers.set("Content-Type", "application/json")
  }
  return headers
}

const productsV2BaseQuery = fetchBaseQuery({
  baseUrl: EXTRANET_API_ROOT,
  prepareHeaders,
})

const extranetSitesBaseQuery = fetchBaseQuery({
  baseUrl: EXTRANET_SITES_BASE,
  prepareHeaders,
})

const productsBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args.url
  if (typeof url === "string" && url.startsWith("v2/")) {
    return productsV2BaseQuery(args, api, extraOptions)
  }
  return extranetSitesBaseQuery(args, api, extraOptions)
}

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: productsBaseQuery,
  tagTypes: ["Product", "DistributorProduct"],
  endpoints: (build) => ({
    getProductsList: build.query<
      { data: IProduct[]; total: number },
      {
        params?: {
          range?: [number, number]
          filter?: Record<string, unknown>
          with?: string
          sort?: unknown
          [key: string]: unknown
        }
      }
    >({
      query: ({ params = {} }) => {
        const { filter, range, sort, ...restParams } = params

        return {
          url: "v2/Products",
          method: "GET",
          params: {
            ...(range ? { range: JSON.stringify(range) } : {}),
            ...(sort ? { sort: JSON.stringify(sort) } : {}),
            ...(filter ? { filter: JSON.stringify(filter) } : {}),
            ...restParams,
          },
        }
      },
      transformResponse: (
        response: { data?: IProduct[]; total?: number },
      ): { data: IProduct[]; total: number } => ({
        data: response?.data ?? [],
        total: response?.total ?? 0,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((product) => ({
                type: "Product" as const,
                id: product.id ?? "UNKNOWN",
              })),
              { type: "Product" as const, id: "LIST" },
            ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),

    getDistributorProducts: build.query<
      PaginatedResponse<IDistributorProductContent>,
      { params?: DistributorProductsQueryParams }
    >({
      query: ({ params = {} }) => {
        const { filter, limit, offset, ...restParams } = params
        const queryParams: Record<string, string | number> = {
          ...(restParams as Record<string, string | number>),
        }
        if (filter) queryParams.filter = JSON.stringify(filter)
        if (limit != null) queryParams.limit = limit
        if (offset != null) queryParams.offset = offset
        return {
          url: "/content/distributor/products",
          method: "GET",
          params: queryParams,
        }
      },
      transformResponse: (
        response: PaginatedResponse<IDistributorProductContent>,
      ): PaginatedResponse<IDistributorProductContent> => ({
        ...response,
        data: response?.data ?? [],
      }),
      providesTags: [{ type: "DistributorProduct", id: "LIST" }],
    }),
  }),
})

export const {
  useGetProductsListQuery,
  useLazyGetProductsListQuery,
  useGetDistributorProductsQuery,
  useLazyGetDistributorProductsQuery,
} = productsApi
