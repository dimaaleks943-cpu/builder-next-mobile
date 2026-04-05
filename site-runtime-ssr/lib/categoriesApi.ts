import type { ContentCategory, PaginatedResponse } from "@/lib/contentTypes"
import { normalizeSiteDomain } from "@/lib/sitePages"

const API_BASE_URL = process.env.API_URL || "https://dev-api.cezyo.com"

/**
 * GET /v3/sites/{domain}/content/categories — опции для блока CategoryFilter на витрине.
 * Корень дерева в filter задаётся через `categoryRootId` / `content_type_id` в зависимости от контракта API.
 */
export const fetchContentCategories = async (
  domain: string,
  params?: {
    limit?: number
    offset?: number
    /** UUID корня дерева — в filter уходит `category_id: [id]`. */
    categoryRootId?: string
  },
): Promise<ContentCategory[] | null> => {
  const cleanDomain = normalizeSiteDomain(domain)
  if (!cleanDomain) return null

  const rootId = params?.categoryRootId?.trim()
  if (!rootId) return null

  try {
    const searchParams = new URLSearchParams()
    searchParams.set("filter", JSON.stringify({ content_type_id: [rootId] }))
    // if (params?.limit != null) searchParams.set("limit", String(params.limit))
    // if (params?.offset != null) searchParams.set("offset", String(params.offset))
    const qs = searchParams.toString()

    const response = await fetch(
      `${API_BASE_URL}/v3/sites/${encodeURIComponent(cleanDomain)}/content/categories${qs ? `?${qs}` : ""}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    )
    console.log("response123123123", `${API_BASE_URL}/v3/sites/${encodeURIComponent(cleanDomain)}/content/categories${qs ? `?${qs}` : ""}`)
    if (!response.ok) {
      console.error(
        `Не удалось получить content categories для ${cleanDomain}:`,
        response.status,
        response.statusText,
      )
      return null
    }

    const json: PaginatedResponse<ContentCategory> = await response.json()
    return json.data ?? []
  } catch (error) {
    console.error("Ошибка при запросе content categories:", error)
    return null
  }
}
