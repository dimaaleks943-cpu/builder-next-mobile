import type { IContentItem } from "@/lib/contentTypes"
import type { SitePage } from "@/lib/sitePages"
import { PAGE_TYPES } from "@/lib/sitePages"

/** Согласовано с builder `normalizeItemPathPrefix`: префикс URL записей коллекции на template-странице. */
export function normalizeItemPathPrefix(
  slug: string | null | undefined,
): string {
  const t = (slug ?? "").trim()
  if (!t) return "/"
  const withSlash = t.startsWith("/") ? t : `/${t}`
  const trimmed = withSlash.replace(/\/+$/, "") || "/"
  return trimmed
}

/**
 * Для template-страницы: сегмент пути записи после префикса (например `/blog/post` → `post`).
 * `null`, если URL не соответствует шаблону или это только префикс без хвоста.
 */
export function extractTemplateItemPathSegment(
  slugPath: string,
  page: SitePage,
): string | null {
  const prefix = normalizeItemPathPrefix(
    page.item_path_prefix ?? page.slug,
  )
  if (prefix === "/") {
    if (slugPath === "/" || slugPath === "") return null
    const s = slugPath.startsWith("/") ? slugPath.slice(1) : slugPath
    if (!s.length) return null
    try {
      return decodeURIComponent(s)
    } catch {
      return s
    }
  }
  const pathPrefix = `${prefix}/`
  if (!slugPath.startsWith(pathPrefix)) return null
  const rest = slugPath.slice(pathPrefix.length)
  if (!rest.length) return null
  try {
    return decodeURIComponent(rest)
  } catch {
    return rest
  }
}

const SORT_FALLBACK = Number.POSITIVE_INFINITY

function pageSortKey(page: SitePage): number {
  const s = page.sort
  return typeof s === "number" && Number.isFinite(s) ? s : SORT_FALLBACK
}

export function isTemplateSitePage(page: SitePage): boolean {
  return page.type === PAGE_TYPES.TEMPLATE
}

export function isStaticSitePage(page: SitePage): boolean {
  return page.type === PAGE_TYPES.STATIC
}

export function isSystemPageSitePage(page: SitePage): boolean {
  return page.type === PAGE_TYPES.SYSTEM_PAGE
}

export function isSystemComponentSitePage(page: SitePage): boolean {
  return page.type === PAGE_TYPES.SYSTEM_COMPONENT
}

/**
 * Выбирает template-страницу с наиболее длинным подходящим префиксом (при пересечениях).
 */
export function resolveTemplatePageForSlug(
  pages: SitePage[],
  slugPath: string,
): { page: SitePage; itemSegment: string } | null {
  const candidates = pages.filter(
    (p) =>
      isTemplateSitePage(p) &&
      Boolean(p.collection_type_id?.trim()),
  )
  const scored = candidates
    .map((page) => {
      const segment = extractTemplateItemPathSegment(slugPath, page)
      if (!segment) return null
      const prefixLen = normalizeItemPathPrefix(
        page.item_path_prefix ?? page.slug,
      ).length
      return { page, itemSegment: segment, prefixLen }
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .sort((a, b) => {
      if (b.prefixLen !== a.prefixLen) return b.prefixLen - a.prefixLen
      const sortDiff = pageSortKey(a.page) - pageSortKey(b.page)
      if (sortDiff !== 0) return sortDiff
      return a.page.id.localeCompare(b.page.id)
    })

  const best = scored[0]
  return best ? { page: best.page, itemSegment: best.itemSegment } : null
}

export function getItemContentTypeId(item: IContentItem): string | undefined {
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
