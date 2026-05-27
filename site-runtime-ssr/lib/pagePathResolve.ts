import type { SitePage } from "@/lib/sitePages"
import { PAGE_TYPES } from "@/lib/sitePages"
import { fetchContentCategoryBySlug } from "@/lib/categoriesApi"
import { fetchContentItemBySlug } from "@/lib/collectionsApi"
import type { IContentItem } from "@/lib/contentTypes"
import { isProductsSelectedSource, PRODUCTS_SELECTED_SOURCE } from "@/constants/contentListSources"
import { fetchProductBySlug } from "@/api/productsApi"
import { mapFullProductToContentItem } from "@/lib/productToContentItem"
import { getItemContentTypeId } from "@/lib/templateRoute"

export interface ParsedStorefrontPath {
  pageSlugSegment: string | null
  tailSegments: string[]
  categorySlugTrail: string | null
  itemSlug: string | null
  filterBlocksStripped: boolean
}

export interface TemplateTailResolution {
  itemSlug: string
  categorySlugTrail: string | null
}

export interface StaticSystemTailInlineItem {
  mode: "inline-item"
  item: IContentItem
  categorySlugTrail: string | null
  collectionKey: string
}

export interface StaticSystemTailCategoryTrail {
  mode: "category-trail"
  categorySlugTrail: string
}

export type StaticSystemTailResult =
  | StaticSystemTailInlineItem
  | StaticSystemTailCategoryTrail

const decodeSegment = (segment: string): string => {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

export const decodePathSegments = (slugPath: string): string[] => {
  const trimmed = slugPath.trim()
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  const noTrailing = withSlash.replace(/\/+$/, "") || "/"
  if (noTrailing === "/") return []
  return noTrailing
    .slice(1)
    .split("/")
    .filter(Boolean)
    .map(decodeSegment)
}

/**
 * Removes `/filter/.../apply/` blocks from tail segments (structure preserved for extension).
 */
export const stripFilterBlocks = (segments: string[]): string[] => {
  const result: string[] = []
  let index = 0
  while (index < segments.length) {
    if (segments[index] === "filter") {
      let end = index + 1
      while (end < segments.length && segments[end] !== "apply") {
        end += 1
      }
      if (end < segments.length) {
        index = end + 1
        continue
      }
    }
    result.push(segments[index]!)
    index += 1
  }
  return result
}

export const parseStorefrontPath = (
  slugPathWithoutLocale: string,
): ParsedStorefrontPath => {
  const segments = decodePathSegments(slugPathWithoutLocale)
  if (segments.length === 0) {
    return {
      pageSlugSegment: null,
      tailSegments: [],
      categorySlugTrail: null,
      itemSlug: null,
      filterBlocksStripped: false,
    }
  }

  const pageSlugSegment = segments[0] ?? null
  const rawTail = segments.slice(1)
  const tailSegments = stripFilterBlocks(rawTail)

  return {
    pageSlugSegment,
    tailSegments,
    categorySlugTrail: null,
    itemSlug: null,
    filterBlocksStripped: tailSegments.length !== rawTail.length,
  }
}

export const normalizeSitePageSlugSegment = (
  page: SitePage,
): string | null => {
  const raw = (page.slug ?? "").trim()
  if (!raw || raw === "/") return null
  const withSlash = raw.startsWith("/") ? raw.slice(1) : raw
  const segment = withSlash.split("/").filter(Boolean)[0]
  return segment ?? null
}

const isRenderablePageType = (page: SitePage): boolean =>
  page.type === PAGE_TYPES.STATIC ||
  page.type === PAGE_TYPES.TEMPLATE ||
  page.type === PAGE_TYPES.SYSTEM_PAGE

export const resolveRenderablePage = (
  pages: SitePage[],
  pageSlugSegment: string | null,
): SitePage | undefined => {
  if (pageSlugSegment === null) {
    return pages.find(
      (page) =>
        page.slug === "/" &&
        page.version === null &&
        isRenderablePageType(page),
    )
  }

  if (pageSlugSegment.length < 3) {
    return undefined
  }

  return pages.find(
    (page) =>
      page.version === null &&
      isRenderablePageType(page) &&
      normalizeSitePageSlugSegment(page) === pageSlugSegment,
  )
}

export const resolveTailForTemplatePage = (
  tailSegments: string[],
): TemplateTailResolution => {
  if (tailSegments.length === 0) {
    return { itemSlug: "", categorySlugTrail: null }
  }
  const itemSlug = tailSegments[tailSegments.length - 1] ?? ""
  const categorySlugTrail =
    tailSegments.length > 1
      ? tailSegments.slice(0, -1).join("/")
      : null
  return { itemSlug, categorySlugTrail }
}

export const resolveTailForStaticSystemPage = async (
  domain: string,
  tailSegments: string[],
): Promise<StaticSystemTailResult | null> => {
  if (tailSegments.length === 0) return null

  const lastSegment = tailSegments[tailSegments.length - 1] ?? ""
  const categorySlugTrail =
    tailSegments.length > 1
      ? tailSegments.slice(0, -1).join("/")
      : null

  const contentItem = await fetchContentItemBySlug(domain, lastSegment)
  if (contentItem) {
    return {
      mode: "inline-item",
      item: contentItem,
      categorySlugTrail,
      collectionKey: getItemContentTypeId(contentItem)?.trim() ?? "",
    }
  }

  const product = await fetchProductBySlug(lastSegment)
  if (product) {
    return {
      mode: "inline-item",
      item: mapFullProductToContentItem(product),
      categorySlugTrail,
      collectionKey: PRODUCTS_SELECTED_SOURCE,
    }
  }

  return {
    mode: "category-trail",
    categorySlugTrail: tailSegments.join("/"),
  }
}

export const resolveCategoryFromTrail = async (
  domain: string,
  trailSegments: string[],
): Promise<{ id: string; slug: string | null } | null> => {
  if (trailSegments.length === 0) return null
  const deepest = trailSegments[trailSegments.length - 1]?.trim() ?? ""
  if (!deepest) return null

  const category = await fetchContentCategoryBySlug(domain, deepest)
  if (!category) return null

  const slug =
    typeof category.slug === "string" && category.slug.trim()
      ? category.slug.trim()
      : deepest

  return { id: category.id, slug }
}

export const isProductsCollectionTypeId = (
  collectionTypeId: string | null | undefined,
): boolean => isProductsSelectedSource(collectionTypeId ?? "")

export const fetchTemplateItemForPage = async (
  domain: string,
  itemSlug: string,
  collectionTypeId: string | null | undefined,
): Promise<IContentItem | null> => {
  const trimmed = itemSlug.trim()
  if (!trimmed) return null

  if (isProductsCollectionTypeId(collectionTypeId)) {
    const product = await fetchProductBySlug(trimmed)
    return product ? mapFullProductToContentItem(product) : null
  }

  return fetchContentItemBySlug(domain, trimmed)
}

export const itemMatchesPageCollectionType = (
  item: IContentItem,
  collectionTypeId: string | null | undefined,
): boolean => {
  const pageTypeId = collectionTypeId?.trim() ?? ""
  if (!pageTypeId) return false

  if (isProductsCollectionTypeId(pageTypeId)) {
    return isProductsSelectedSource(getItemContentTypeId(item) ?? "")
  }

  const itemTypeId = getItemContentTypeId(item)?.trim()
  if (!itemTypeId) return false
  return itemTypeId.toLowerCase() === pageTypeId.toLowerCase()
}
