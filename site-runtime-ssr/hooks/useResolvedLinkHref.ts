import { useMemo } from "react"
import { useContentData } from "@/components/ContentDataContext"
import { useSiteCollections } from "@/components/SiteCollectionsContext"
import type { IContentItem } from "@/lib/contentTypes"
import { buildStorefrontTemplateHref } from "@/lib/catalogPathResolve"
import { normalizeItemPathPrefix } from "@/lib/templateRoute"
import { useContentListContext } from "@/components/ContentListContext"
import { useCollectionFilterScope } from "@/components/CollectionFilterScopeContext"
import { useStorefrontPage } from "@/components/StorefrontPageContext"
import { prefixPublicPath } from "@/lib/localeFromPath"

export interface ResolvedLinkHrefInput {
  href?: string
  linkMode?: "url" | "page" | "collectionItemPage"
  collectionItemLinkTarget?: "none" | "template"
  collectionItemTemplatePageId?: string | null
  logTag?: string
}

export const useResolvedLinkHref = ({
  href = "http://www.google.com",
  linkMode = "url",
  collectionItemLinkTarget = "none",
  collectionItemTemplatePageId = null,
  logTag = "Link",
}: ResolvedLinkHrefInput): string => {
  const contentData = useContentData()
  const { sitePages } = useSiteCollections()
  const { filterScope } = useContentListContext()
  const { selectedCategorySlugByScope } = useCollectionFilterScope()
  const { locale, categorySlugTrailFromUrl } = useStorefrontPage()

  return useMemo(() => {
    const templateId =
      typeof collectionItemTemplatePageId === "string"
        ? collectionItemTemplatePageId.trim()
        : ""
    const useTemplate =
      linkMode === "collectionItemPage" &&
      collectionItemLinkTarget === "template" &&
      templateId.length > 0

    if (!useTemplate) {
      if (linkMode === "page") {
        const h = href?.trim() ?? ""
        if (h.startsWith("/") && !h.startsWith("//")) {
          return prefixPublicPath(h, locale)
        }
      }
      return href
    }

    const page = sitePages.find((p) => p.id === templateId)
    if (!page) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          `[${logTag}] collectionItemTemplatePageId not found in sitePages:`,
          templateId,
        )
      }
      return href?.trim() ? href : "#"
    }

    const item = contentData?.itemData as IContentItem | undefined
    if (!item) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          `[${logTag}] collection item template link needs row context (itemData); using fallback href.`,
        )
      }
      return href?.trim() ? href : "#"
    }

    const prefix = normalizeItemPathPrefix(page.slug)
    const rawSlug = (item as Record<string, unknown>).slug
    const segment =
      typeof rawSlug === "string" && rawSlug.trim() ? rawSlug.trim() : ""
    if (!segment) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          `[${logTag}] collection item template link needs item.slug; using fallback href.`,
        )
      }
      return href?.trim() ? href : "#"
    }
    const scopeKey = filterScope?.trim() ?? ""
    const categoryTrail =
      (scopeKey && selectedCategorySlugByScope[scopeKey]) ??
      categorySlugTrailFromUrl ??
      null
    const internal = buildStorefrontTemplateHref(
      prefix,
      segment,
      categoryTrail,
    )
    return prefixPublicPath(internal, locale)
  }, [
    href,
    linkMode,
    collectionItemLinkTarget,
    collectionItemTemplatePageId,
    sitePages,
    contentData?.itemData,
    filterScope,
    selectedCategorySlugByScope,
    categorySlugTrailFromUrl,
    locale,
    logTag,
  ])
}
