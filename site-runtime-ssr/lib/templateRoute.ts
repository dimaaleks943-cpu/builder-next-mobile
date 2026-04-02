import type { IContentItem } from "@/lib/contentTypes"
import type { SitePage } from "@/lib/sitePages"
import { getContentFieldDisplayValue } from "@/lib/contentFieldValue"

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
/** Простая проверка UUID в сегменте URL (для прямой загрузки записи по id на SSR). */
export function isUuidLikePathSegment(segment: string): boolean {
  const s = segment.trim()
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    s,
  )
}

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

function fieldLooksLikeSlug(f: {
  name?: string
  field_type?: string
}): boolean {
  const name = typeof f.name === "string" ? f.name.toLowerCase() : ""
  if (name === "slug" || name.endsWith("_slug")) return true
  const ft = typeof f.field_type === "string" ? f.field_type.toLowerCase() : ""
  return ft.includes("slug")
}

/**
 * Находит запись коллекции по сегменту из URL: `id`, верхнеуровневый `slug`, поле slug в fields.
 */
export function findContentItemByUrlSegment(
  items: IContentItem[],
  segment: string,
): IContentItem | undefined {
  const decoded = segment.trim()
  if (!decoded) return undefined

  for (const item of items) {
    const topSlug = (item as Record<string, unknown>).slug
    if (typeof topSlug === "string" && topSlug === decoded) return item
    if (item.id === decoded) return item
  }

  for (const item of items) {
    if (!item.fields?.length) continue
    for (const f of item.fields) {
      if (!fieldLooksLikeSlug(f)) continue
      const v = getContentFieldDisplayValue(f).trim()
      if (v === decoded) return item
    }
  }

  return undefined
}

const SORT_FALLBACK = Number.POSITIVE_INFINITY

function pageSortKey(page: SitePage): number {
  const s = page.sort
  return typeof s === "number" && Number.isFinite(s) ? s : SORT_FALLBACK
}

export function isTemplateSitePage(page: SitePage): boolean {
  return page.type === "template"
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
  console.log("candidates", candidates)
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
