import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import {
  EXTRANET_API_ROOT,
  type DistributorCategoriesQueryParams,
  type IDistributorCategory,
} from "../api/extranet"
import { EXTRANET_API_TOKEN } from "../api/tokent.ts"

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

export const distributorCategoriesApi = createApi({
  reducerPath: "distributorCategoriesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: EXTRANET_API_ROOT,
    prepareHeaders,
  }),
  tagTypes: ["DistributorCategory"],
  endpoints: (build) => ({
    getDistributorCategories: build.query<
      IDistributorCategory[],
      { params?: DistributorCategoriesQueryParams }
    >({
      query: ({ params = {} }) => {
        const { filter, parent_id, ...restParams } = params
        const queryParams: Record<string, string | number> = {
          ...(restParams as Record<string, string | number>),
        }
        if (parent_id != null) queryParams.parent_id = parent_id
        if (filter) queryParams.filter = JSON.stringify(filter)
        return {
          url: "v2/DistributorCategories",
          method: "GET",
          params: queryParams,
        }
      },
      transformResponse: (
        response: IDistributorCategory[],
      ): IDistributorCategory[] => response ?? [],
      providesTags: [{ type: "DistributorCategory", id: "LIST" }],
    }),
  }),
})

export const {
  useGetDistributorCategoriesQuery,
  useLazyGetDistributorCategoriesQuery,
} = distributorCategoriesApi
