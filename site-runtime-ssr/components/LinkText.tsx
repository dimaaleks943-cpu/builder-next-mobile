import { useMemo } from "react";
import { useContentData } from "./ContentDataContext";
import { useSiteCollections } from "./SiteCollectionsContext";
import {
  findContentItemField,
  getContentFieldDisplayValue,
} from "@/lib/contentFieldValue";
import type { IContentItem } from "@/lib/contentTypes";
import { buildStorefrontTemplateHref } from "@/lib/catalogPathResolve";
import { normalizeItemPathPrefix } from "@/lib/templateRoute";
import { useContentListContext } from "@/components/ContentListContext";
import { useCollectionFilterScope } from "@/components/CollectionFilterScopeContext";
import { useStorefrontPage } from "@/components/StorefrontPageContext";
import { usePageLocale } from "@/components/PageLocaleContext";
import { prefixPublicPath } from "@/lib/localeFromPath";
import { resolveTranslationText } from "@/lib/resolvePageTranslation";
import {
  type CraftVisualEffectsProps,
} from "@/lib/craftVisualEffects";

interface LinkTextProps extends CraftVisualEffectsProps {
  className?: string;
  "data-craft-node-id"?: string;
  text?: string;
  i18nKey?: string | null;
  collectionField?: string | null;
  href?: string;
  linkMode?: "url" | "page" | "collectionItemPage";
  collectionItemLinkTarget?: "none" | "template";
  collectionItemTemplatePageId?: string | null;
  openInNewTab?: boolean;
}

export const LinkText = ({
  className,
  "data-craft-node-id": dataCraftNodeId,
  text = "Ссылка",
  i18nKey = null,
  collectionField = null,
  href = "http://www.google.com",
  linkMode = "url",
  collectionItemLinkTarget = "none",
  collectionItemTemplatePageId = null,
  openInNewTab = false,
}: LinkTextProps) => {
  const contentData = useContentData();
  const { sitePages } = useSiteCollections();
  const { filterScope } = useContentListContext();
  const { selectedCategorySlugByScope } = useCollectionFilterScope();
  const { locale, categorySlugTrailFromUrl } = useStorefrontPage();
  const pageLocale = usePageLocale();

  const displayText = useMemo(() => {
    if (collectionField && contentData?.itemData) {
      const item = contentData.itemData as IContentItem;
      const field = findContentItemField(item, collectionField);
      if (field) {
        const resolved = getContentFieldDisplayValue(field);
        return resolved !== "" ? resolved : text;
      }
    }
    if (!collectionField || !contentData?.itemData) {
      return resolveTranslationText(
        pageLocale.translate,
        pageLocale.locale,
        i18nKey,
        text as string,
      );
    }
    return text;
  }, [
    collectionField,
    contentData?.itemData,
    i18nKey,
    pageLocale.locale,
    pageLocale.translate,
    text,
  ]);

  const resolvedHref = useMemo(() => {
    const templateId =
      typeof collectionItemTemplatePageId === "string"
        ? collectionItemTemplatePageId.trim()
        : "";
    const useTemplate =
      linkMode === "collectionItemPage" &&
      collectionItemLinkTarget === "template" &&
      templateId.length > 0;

    if (!useTemplate) {
      if (linkMode === "page") {
        const h = href?.trim() ?? "";
        if (h.startsWith("/") && !h.startsWith("//")) {
          return prefixPublicPath(h, locale);
        }
      }
      return href;
    }

    const page = sitePages.find((p) => p.id === templateId);
    if (!page) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          "[LinkText] collectionItemTemplatePageId not found in sitePages:",
          templateId,
        );
      }
      return href?.trim() ? href : "#";
    }

    const item = contentData?.itemData as IContentItem | undefined;
    if (!item) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          "[LinkText] collection item template link needs row context (itemData); using fallback href.",
        );
      }
      return href?.trim() ? href : "#";
    }

    const prefix = normalizeItemPathPrefix(page.item_path_prefix ?? page.slug);
    const rawSlug = (item as Record<string, unknown>).slug;
    const segment =
      typeof rawSlug === "string" && rawSlug.trim()
        ? rawSlug.trim()
        : "";
    if (!segment) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          "[LinkText] collection item template link needs item.slug; using fallback href.",
        );
      }
      return href?.trim() ? href : "#";
    }
    const scopeKey = filterScope?.trim() ?? "";
    const categoryTrail =
      (scopeKey && selectedCategorySlugByScope[scopeKey]) ??
      categorySlugTrailFromUrl ??
      null;
    const internal = buildStorefrontTemplateHref(
      prefix,
      segment,
      categoryTrail,
    );
    return prefixPublicPath(internal, locale);
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
  ]);

  return (
    <a
      className={className}
      data-craft-node-id={dataCraftNodeId}
      href={resolvedHref}
      target={openInNewTab ? "_blank" : "_self"}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
    >
      {displayText}
    </a>
  );
}
