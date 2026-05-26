/**
 * URL builders for storefront category trails and template item links.
 * Page slug is always a single path segment; tail may contain multi-segment category trails.
 */

import { normalizeItemPathPrefix } from "@/lib/templateRoute"

/** URL карточки итема: page slug + опциональный category trail + slug записи. */
export const buildStorefrontTemplateHref = (
  pageBaseSlug: string,
  itemSlug: string,
  categoryTrail: string | null | undefined,
): string => {
  const base = normalizeItemPathPrefix(pageBaseSlug)
  const catParts = (categoryTrail ?? "").split("/").filter(Boolean)
  const slugParts = itemSlug.split("/").filter(Boolean)
  const allParts = [...catParts, ...slugParts]
  const encoded = allParts.map((part) => encodeURIComponent(part)).join("/")
  if (base === "/") return `/${encoded}`
  const trimmedBase = base.replace(/\/+$/, "")
  return `${trimmedBase}/${encoded}`
}

/** URL витрины с выбранной категорией: `/catalog` или `/catalog/europe/asia`. */
export const buildStorefrontCategoryUrl = (
  pageBaseSlug: string,
  categorySlugOrTrail: string | null,
): string => {
  const base = normalizeItemPathPrefix(pageBaseSlug)
  const trail = categorySlugOrTrail?.trim() ?? ""
  if (!trail) return base

  const encodedTrail = trail
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/")

  const trimmedBase = base.replace(/\/+$/, "") || "/"
  if (trimmedBase === "/") return `/${encodedTrail}`
  return `${trimmedBase}/${encodedTrail}`
}
