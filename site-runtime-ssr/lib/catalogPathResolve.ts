/**
 * Разбор публичного URL: базовый slug страницы и последний сегмент (кандидат в slug итема или категории).
 */

import { normalizeItemPathPrefix } from "@/lib/templateRoute"

/**
 * Цепочка slug категории между префиксом витрины и последним сегментом (slug итема).
 * Напр. prefix `/gid`, path `/gid/europe/luvr`, item `luvr` → `europe`.
 */
export function categoryTrailBetweenPrefixAndItemSlug(
  prefix: string,
  slugPath: string,
  itemSlug: string,
): string | null {
  const norm = normalizeItemPathPrefix(prefix)
  const tail = itemSlug.trim()
  if (!tail) return null

  if (norm === "/") {
    const path = slugPath.startsWith("/") ? slugPath : `/${slugPath}`
    const inner = path.slice(1).split("/").filter(Boolean)
    if (inner.length < 2) return null
    const last = inner[inner.length - 1]!
    let lastDecoded: string
    try {
      lastDecoded = decodeURIComponent(last)
    } catch {
      lastDecoded = last
    }
    if (lastDecoded !== tail && last !== tail) return null
    return inner
      .slice(0, -1)
      .map((s) => {
        try {
          return decodeURIComponent(s)
        } catch {
          return s
        }
      })
      .join("/")
  }

  const pathPrefix = `${norm}/`
  if (!slugPath.startsWith(pathPrefix)) return null
  const rest = slugPath.slice(pathPrefix.length)
  const parts = rest.split("/").filter(Boolean)
  if (parts.length < 2) return null
  const last = parts[parts.length - 1]!
  let lastDecoded: string
  try {
    lastDecoded = decodeURIComponent(last)
  } catch {
    lastDecoded = last
  }
  if (lastDecoded !== tail && last !== tail) return null
  return parts
    .slice(0, -1)
    .map((s) => {
      try {
        return decodeURIComponent(s)
      } catch {
        return s
      }
    })
    .join("/")
}

/** URL карточки итема: prefix + опционально категория + slug записи. */
export function buildStorefrontTemplateHref(
  prefix: string,
  itemSlug: string,
  categoryTrail: string | null | undefined,
): string {
  const norm = normalizeItemPathPrefix(prefix)
  const normalizedCategoryTrail = categoryTrail ?? ""
  const catParts = normalizedCategoryTrail.split("/").filter(Boolean)
  const slugParts = itemSlug.split("/").filter(Boolean)
  const allParts = [...catParts, ...slugParts]
  const encoded = allParts.map((p) => encodeURIComponent(p)).join("/")
  if (norm === "/") return `/${encoded}`
  const base = norm.replace(/\/+$/, "")
  return `${base}/${encoded}`
}

/** URL витрины с выбранной категорией: `/gid` или `/gid/europe`. */
export function buildStorefrontCategoryUrl(
  pageBaseSlug: string,
  categorySlug: string | null,
): string {
  const base = normalizeItemPathPrefix(pageBaseSlug)
  const normalizedCategorySlug = categorySlug?.trim() ?? ""
  if (!normalizedCategorySlug) return base
  const b = base.replace(/\/+$/, "") || "/"
  if (b === "/") return `/${encodeURIComponent(normalizedCategorySlug)}`
  return `${b}/${encodeURIComponent(normalizedCategorySlug)}`
}

export function splitBaseSlugAndTail(slugPath: string): {
  baseSlug: string
  tailSlug: string | null
} {
  const raw = slugPath.trim()
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`
  const noTrailing = withSlash.replace(/\/+$/, "") || "/"
  const inner = noTrailing === "/" ? "" : noTrailing.slice(1)
  const segments = inner.split("/").filter(Boolean)

  if (segments.length <= 1) {
    return { baseSlug: noTrailing, tailSlug: null }
  }

  const tailRaw = segments[segments.length - 1]!
  let tailSlug: string
  try {
    tailSlug = decodeURIComponent(tailRaw)
  } catch {
    tailSlug = tailRaw
  }
  const baseSegments = segments.slice(0, -1)
  const baseSlug = `/${baseSegments.join("/")}`
  return { baseSlug, tailSlug }
}
