import { useMemo } from "react";
import type { IContentItem } from "../api/contentTypes";
import { useContentData } from "../contexts/ContentDataContext";
import { useContentListContext } from "../contexts/ContentListContext";
import { useCollectionFilterScope } from "../contexts/CollectionFilterScopeContext";
import { useStorefrontPage } from "../contexts/StorefrontPageContext";
import { useSiteCollections } from "../contexts/SiteCollectionsContext";
import { buildStorefrontTemplateHref } from "../lib/catalogPathResolve";
import { normalizeItemPathPrefix } from "../lib/templateRoute";

export interface ResolvedLinkHrefInput {
  href?: string;
  linkMode?: "url" | "page" | "collectionItemPage";
  collectionItemLinkTarget?: "none" | "template";
  collectionItemTemplatePageId?: string | null;
  logTag?: string;
}

export const useResolvedLinkHref = ({
  href = "http://www.google.com",
  linkMode = "url",
  collectionItemLinkTarget = "none",
  collectionItemTemplatePageId = null,
  logTag = "Link",
}: ResolvedLinkHrefInput): string => {
  const contentData = useContentData();
  const { sitePages } = useSiteCollections();
  const { filterScope } = useContentListContext();
  const { selectedCategorySlugByScope } = useCollectionFilterScope();
  const { categorySlugTrailFromUrl } = useStorefrontPage();

  return useMemo(() => {
    const templateId =
      typeof collectionItemTemplatePageId === "string"
        ? collectionItemTemplatePageId.trim()
        : "";
    const useTemplate =
      linkMode === "collectionItemPage" &&
      collectionItemLinkTarget === "template" &&
      templateId.length > 0;

    if (!useTemplate) {
      return href;
    }

    const page = sitePages.find((p) => p.id === templateId);
    if (!page) {
      if (__DEV__) {
        console.warn(
          `[${logTag}] collectionItemTemplatePageId not found in sitePages:`,
          templateId,
        );
      }
      return href?.trim() ? href : "#";
    }

    const item = contentData?.itemData as IContentItem | undefined;
    if (!item) {
      if (__DEV__) {
        console.warn(
          `[${logTag}] collection item template link needs row context (itemData); using fallback href.`,
        );
      }
      return href?.trim() ? href : "#";
    }

    const prefix = normalizeItemPathPrefix(page.item_path_prefix ?? page.slug);
    const rawSlug = (item as Record<string, unknown>).slug;
    const segment =
      typeof rawSlug === "string" && rawSlug.trim() ? rawSlug.trim() : "";
    if (!segment) {
      return href?.trim() ? href : "#";
    }
    const scopeKey = filterScope?.trim() ?? "";
    const categoryTrail =
      (scopeKey && selectedCategorySlugByScope[scopeKey]) ??
      categorySlugTrailFromUrl ??
      null;
    return buildStorefrontTemplateHref(prefix, segment, categoryTrail);
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
    logTag,
  ]);
};
