import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import {
  EXTRANET_API_TOKEN,
  EXTRANET_SITES_BASE,
  type IContentItem,
  type ContentType,
  type ExtranetPageResponse,
  type ExtranetPagesResponse,
  type PaginatedResponse,
} from "../api/extranet"

const baseQuery = fetchBaseQuery({
  baseUrl: EXTRANET_SITES_BASE,
  prepareHeaders: (headers, { type }) => {
    headers.set("Authorization", EXTRANET_API_TOKEN)
    headers.set("Accept", "application/json")
    if (type === "mutation") {
      headers.set("Content-Type", "application/json")
    }
    return headers
  },
})

/** Тело POST `/pages` (создание страницы extranet). */
export type CreateExtranetPageBody = {
  directory_id: string | null
  name: string
  slug: string
  type: "static" | "template"
  collection_type_id: string | null
  item_path_prefix: string | null
  content: string
  content_mobile: string
  sort: number
}

export type UpdateExtranetPageBody = {
  directory_id: string | null
  name: string
  slug: string
  content: string
  content_mobile: string
  sort: number
}

export const extranetApi = createApi({
  reducerPath: "extranetApi",
  baseQuery,
  tagTypes: ["ExtranetPage"],
  endpoints: (build) => ({
    getContentTypes: build.query<
      PaginatedResponse<ContentType>,
      { limit?: number; offset?: number } | void
    >({
      query: (params) => ({
        url: "/content/types",
        params:
          params?.limit != null || params?.offset != null
            ? {
                ...(params.limit != null ? { limit: params.limit } : {}),
                ...(params.offset != null ? { offset: params.offset } : {}),
              }
            : undefined,
      }),
      transformResponse: (
        response: PaginatedResponse<ContentType>,
      ): PaginatedResponse<ContentType> => ({
        ...response,
        data: response?.data ?? [],
      }),
    }),

    getContentItems: build.query<
      PaginatedResponse<IContentItem>,
      {
        contentTypeId: string
        limit?: number
        offset?: number
      }
    >({
      query: ({ contentTypeId, limit, offset }) => {
        const filter = JSON.stringify({
          content_type_id: [contentTypeId],
        })
        const params: Record<string, string | number> = { filter }
        if (limit != null) params.limit = limit
        if (offset != null) params.offset = offset
        return {
          url: "/content/items",
          params,
        }
      },
      transformResponse: (
        response: PaginatedResponse<IContentItem>,
      ): PaginatedResponse<IContentItem> => ({
        ...response,
        data: response?.data ?? [],
      }),
    }),

    getExtranetPage: build.query<ExtranetPageResponse, string>({
      query: (id) => `/pages/${id}`,
      providesTags: (_result, _err, id) => [{ type: "ExtranetPage", id }],
    }),

    getExtranetPages: build.query<ExtranetPagesResponse, void>({
      query: () => "/pages",
      providesTags: ["ExtranetPage"],
      transformResponse: (
        response: ExtranetPagesResponse,
      ): ExtranetPagesResponse => ({
        ...response,
        data: response?.data ?? [],
      }),
    }),

    updateExtranetPage: build.mutation<
      unknown,
      { id: string; body: UpdateExtranetPageBody }
    >({
      query: ({ id, body }) => ({
        url: `/pages/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ExtranetPage"],
    }),

    createExtranetPage: build.mutation<
      ExtranetPageResponse,
      CreateExtranetPageBody
    >({
      query: (body) => ({
        url: "/pages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ExtranetPage"],
    }),
  }),
})

export const {
  useGetContentTypesQuery,
  useGetContentItemsQuery,
  useLazyGetContentItemsQuery,
  useGetExtranetPageQuery,
  useGetExtranetPagesQuery,
  useLazyGetExtranetPagesQuery,
  useUpdateExtranetPageMutation,
  useCreateExtranetPageMutation,
} = extranetApi
