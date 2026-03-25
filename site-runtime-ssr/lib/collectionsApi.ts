import type {
  ContentType,
  IContentItem,
  PaginatedResponse,
} from "@/lib/contentTypes"
import { normalizeSiteDomain } from "@/lib/sitePages"

export type CollectionInfo = {
  key: string
  label: string
  items: IContentItem[]
}

export type CollectionsMap = Record<string, CollectionInfo>

const API_BASE_URL = process.env.API_URL || "https://dev-api.cezyo.com"

/**
 * GET /v3/sites/{domain}/content/items с filter по content_type_id (UUID).
 */
export const fetchContentItems = async (
  domain: string,
  contentTypeId: string,
  params?: { limit?: number; offset?: number },
): Promise<IContentItem[] | null> => {
  const cleanDomain = normalizeSiteDomain(domain)
  if (!cleanDomain || !contentTypeId.trim()) return null
  console.log("contentTypeId12312", contentTypeId)
  try {
    const filter = JSON.stringify({
      content_type_id: [contentTypeId],
    })
    const searchParams = new URLSearchParams()
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
