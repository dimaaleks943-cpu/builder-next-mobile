import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import {
  EXTRANET_API_TOKEN,
  EXTRANET_SITES_BASE,
  type IContentItem,
  type TranslationsByLocale,
  type ContentType,
  type ContentCategory,
  type ExtranetPageResponse,
  type ExtranetPagesResponse,
  type PaginatedResponse,
  type ExtranetPage,
  type PageType,
  type PAGE_MODES,
  type PAGE_VISIBILITY,
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
  type: PageType
  content_types: string[]
  collection_type_id: string | null
  item_path_prefix: string | null
  content: string | null
  content_mobile: string | null
  translate: TranslationsByLocale
  translate_mobile: TranslationsByLocale
  sort: number
  site_id: number
}

export type UpdateExtranetPageBody = {
  directory_id: string | null
  name: string
  slug: string
  type: PageType
  content_types: string[]
  collection_type_id: string | null
  item_path_prefix: string | null
  content: string | null
  content_mobile: string | null
  translate: TranslationsByLocale
  translate_mobile: TranslationsByLocale
  sort: number
  site_id: number
  mode: PAGE_MODES
  visibility: PAGE_VISIBILITY
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

    /** Категории контента для UI фильтра (дерево от заданного корня). */
    getContentCategories: build.query<
      PaginatedResponse<ContentCategory>,
      {
        contentCategoryId: string
        limit?: number
        offset?: number
      }
    >({
      query: ({ contentCategoryId }) => {
        const id = contentCategoryId.trim()
        const params: Record<string, string | number> = {
          filter: JSON.stringify({ content_type_id: [id] }),
        }
        return {
          url: `/content/categories`,
          params,
        }
      },
      transformResponse: (
        response: PaginatedResponse<ContentCategory>,
      ): PaginatedResponse<ContentCategory> => ({
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
        categoryIds?: string[]
      }
    >({
      query: ({ contentTypeId, limit, offset, categoryIds }) => {
        const filterPayload: Record<string, string[]> = {
          content_type_id: [contentTypeId.trim()],
        }
        // Фильтр по категории — только когда в билдере у списка задан filterScope и выбрана категория.
        const catIds = categoryIds?.map((c) => c.trim()).filter(Boolean)
        if (catIds?.length) filterPayload.category_id = catIds
        const filter = JSON.stringify(filterPayload)
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
      ExtranetPage,
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
  useGetContentCategoriesQuery,
  useLazyGetContentCategoriesQuery,
  useGetContentItemsQuery,
  useLazyGetContentItemsQuery,
  useGetExtranetPageQuery,
  useGetExtranetPagesQuery,
  useLazyGetExtranetPagesQuery,
  useUpdateExtranetPageMutation,
  useCreateExtranetPageMutation,
} = extranetApi
