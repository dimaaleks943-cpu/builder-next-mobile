import type {
  ContentType,
  IContentItem,
  PaginatedResponse,
} from "@/lib/contentTypes"
import { parseSingleEntityJson } from "@/lib/apiParsers"
import { normalizeSiteDomain } from "@/lib/sitePages"

export type CollectionInfo = {
  key: string
  label: string
  items: IContentItem[]
}

export type CollectionsMap = Record<string, CollectionInfo>

const API_BASE_URL = process.env.API_URL || "https://dev-api.cezyo.com"

/** JSON для query-параметра `filter`: всегда тип контента; при фильтре категорий добавляем `category_id`. */
function buildContentItemsFilter(
  contentTypeId: string,
  categoryIds?: string[],
): string {
  const payload: Record<string, string[]> = {
    content_type_id: [contentTypeId.trim()],
  }
  const ids = categoryIds?.map((id) => id.trim()).filter(Boolean)
  if (ids?.length) payload.category_id = ids
  return JSON.stringify(payload)
}

/**
 * GET /v3/sites/{domain}/content/items с filter по content_type_id (UUID), опционально category_id.
 */
export const fetchContentItems = async (
  domain: string,
  contentTypeId: string,
  params?: {
    limit?: number
    offset?: number
    categoryIds?: string[]
  },
): Promise<IContentItem[] | null> => {
  const cleanDomain = normalizeSiteDomain(domain)
  if (!cleanDomain || !contentTypeId.trim()) return null

  try {
    const filter = buildContentItemsFilter(contentTypeId, params?.categoryIds)
    const searchParams = new URLSearchParams({filter})
    if (params?.limit != null) searchParams.set("limit", String(params.limit))
    if (params?.offset != null) searchParams.set("offset", String(params.offset))

    const response = await fetch(
      `${API_BASE_URL}/v3/sites/${encodeURIComponent(cleanDomain)}/content/items?${searchParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      console.error(
        `Не удалось получить content items для ${cleanDomain}:`,
        response.status,
        response.statusText,
      )
      return null
    }

    const json: PaginatedResponse<IContentItem> = await response.json()
    return json.data ?? []
  } catch (error) {
    console.error("Ошибка при запросе content items:", error)
    return null
  }
}

/**
 * GET /v3/sites/{domain}/content/items/s/{slug}
 */
export const fetchContentItemBySlug = async (
  domain: string,
  slug: string,
): Promise<IContentItem | null> => {
  const cleanDomain = normalizeSiteDomain(domain)
  const s = slug.trim()
  if (!cleanDomain || !s) return null

  try {
    const response = await fetch(
      `${API_BASE_URL}/v3/sites/${encodeURIComponent(cleanDomain)}/content/items/s/${encodeURIComponent(s)}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      if (response.status !== 404) {
        console.error(
          `Не удалось получить content item по slug для ${cleanDomain}:`,
          response.status,
          response.statusText,
        )
      }
      return null
    }

    const json: unknown = await response.json()
    return parseSingleEntityJson<IContentItem>(json)
  } catch (error) {
    console.error("Ошибка при запросе content item по slug:", error)
    return null
  }
}

/**
 * GET /v3/sites/{domain}/content/types (опционально — схемы полей, подписи типов).
 */
export const fetchContentTypes = async (
  domain: string,
  params?: { limit?: number; offset?: number },
): Promise<ContentType[] | null> => {
  const cleanDomain = normalizeSiteDomain(domain)
  if (!cleanDomain) return null

  try {
    const searchParams = new URLSearchParams()
    if (params?.limit != null) searchParams.set("limit", String(params.limit))
    if (params?.offset != null) searchParams.set("offset", String(params.offset))
    const qs = searchParams.toString()

    const response = await fetch(
      `${API_BASE_URL}/v3/sites/${encodeURIComponent(cleanDomain)}/content/types${qs ? `?${qs}` : ""}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      console.error(
        `Не удалось получить content types для ${cleanDomain}:`,
        response.status,
        response.statusText,
      )
      return null
    }

    const json: PaginatedResponse<ContentType> = await response.json()
    return json.data ?? []
  } catch (error) {
    console.error("Ошибка при запросе content types:", error)
    return null
  }
}

/**
 * Загружает все коллекции по списку типов (для отладки / будущего UI).
 */
export const fetchCollections = async (
  domain: string,
  contentTypeIds: string[],
): Promise<CollectionsMap> => {
  const collections: CollectionsMap = {}
  for (const id of contentTypeIds) {
    const items = await fetchContentItems(domain, id)
    if (items && items.length > 0) {
      collections[id] = {
        key: id,
        label: id,
        items,
      }
    }
  }
  return collections
}

/**
 * Коллекция по ключу `content_type_id` (UUID).
 */
export const getCollectionByKey = async (
  domain: string,
  key: string,
): Promise<CollectionInfo | null> => {
  const items = await fetchContentItems(domain, key)
  if (items === null) return null
  return {
    key,
    label: key,
    items,
  }
}
