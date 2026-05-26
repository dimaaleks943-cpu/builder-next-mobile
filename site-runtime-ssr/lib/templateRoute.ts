import type { IContentItem } from "@/lib/contentTypes"
import type { SitePage } from "@/lib/sitePages"
import { PAGE_TYPES } from "@/lib/sitePages"

/** Согласовано с builder `normalizeItemPathPrefix`: префикс URL страницы на витрине. */
export const normalizeItemPathPrefix = (
  slug: string | null | undefined,
): string => {
  const t = (slug ?? "").trim()
  if (!t) return "/"
  const withSlash = t.startsWith("/") ? t : `/${t}`
  const trimmed = withSlash.replace(/\/+$/, "") || "/"
  return trimmed
}

export const isTemplateSitePage = (page: SitePage): boolean =>
  page.type === PAGE_TYPES.TEMPLATE

export const isStaticSitePage = (page: SitePage): boolean =>
  page.type === PAGE_TYPES.STATIC

export const isSystemPageSitePage = (page: SitePage): boolean =>
  page.type === PAGE_TYPES.SYSTEM_PAGE

export const getItemContentTypeId = (item: IContentItem): string | undefined => {
  const raw = item as Record<string, unknown>
  const a =
    typeof item.content_type_id === "string"
      ? item.content_type_id
      : undefined
  const b =
    typeof raw.collection_type_id === "string"
      ? raw.collection_type_id
      : undefined
  return a ?? b
}
