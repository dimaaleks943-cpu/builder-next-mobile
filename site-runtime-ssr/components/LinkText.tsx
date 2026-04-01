import { useMemo } from "react";
import { useContentData } from "./ContentDataContext";
import { useSiteCollections } from "./SiteCollectionsContext";
import {
  findContentItemField,
  getContentFieldDisplayValue,
} from "@/lib/contentFieldValue";
import type { IContentItem } from "@/lib/contentTypes";
import { normalizeItemPathPrefix } from "@/lib/templateRoute";

function buildCollectionItemTemplateHref(
  prefixNormalized: string,
  segment: string,
): string {
  const raw = segment.trim();
  if (!raw) return "#";
  const encoded = raw
    .split("/")
    .filter(Boolean)
    .map((p) => encodeURIComponent(p))
    .join("/");
  if (!encoded) return "#";
  if (prefixNormalized === "/") {
    return `/${encoded}`;
  }
  const base = prefixNormalized.replace(/\/+$/, "");
  return `${base}/${encoded}`;
}

interface LinkTextProps {
  text?: string;
  collectionField?: string | null;
  href?: string;
  linkMode?: "url" | "page" | "collectionItemPage";
  collectionItemLinkTarget?: "none" | "template";
  collectionItemTemplatePageId?: string | null;
  openInNewTab?: boolean;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  textAlign?: "left" | "center" | "right";
  color?: string;
  fontFamily?: string;
  lineHeight?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  strokeColor?: string;
  strokeWidth?: number;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
}

export const LinkText = ({
  text = "Ссылка",
  collectionField = null,
  href = "http://www.google.com",
  linkMode = "url",
  collectionItemLinkTarget = "none",
  collectionItemTemplatePageId = null,
  openInNewTab = false,
  fontSize = 14,
  fontWeight = "normal",
  textAlign = "left",
  color = "#00C78D",
  fontFamily,
  lineHeight = 20,
  textTransform = "none",
  strokeColor,
  strokeWidth = 0,
  isItalic = false,
  isUnderline = false,
  isStrikethrough = false,
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
  paddingTop = 0,
  paddingRight = 0,
  paddingBottom = 0,
  paddingLeft = 0,
}: LinkTextProps) => {
  const contentData = useContentData();
  const { sitePages } = useSiteCollections();

  const displayText = useMemo(() => {
    if (collectionField && contentData?.itemData) {
      const item = contentData.itemData as IContentItem;
      const field = findContentItemField(item, collectionField);
      if (field) {
        return getContentFieldDisplayValue(field);
      }
    }
    return text;
  }, [collectionField, contentData?.itemData, text]);

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
    const segment =
      typeof item.id === "string" ? item.id.trim() : String(item.id ?? "").trim();
    return buildCollectionItemTemplateHref(prefix, segment);
  }, [
    href,
    linkMode,
    collectionItemLinkTarget,
    collectionItemTemplatePageId,
    sitePages,
    contentData?.itemData,
  ]);

  const textDecoration = [
    "underline",
    isStrikethrough ? "line-through" : "",
    isUnderline ? "underline" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      href={resolvedHref}
      target={openInNewTab ? "_blank" : "_self"}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      style={{
        display: "inline-block",
        fontSize,
        fontWeight,
        textAlign,
        color,
        fontFamily,
        lineHeight: typeof lineHeight === "number" ? `${lineHeight}px` : undefined,
        textTransform,
        fontStyle: isItalic ? "italic" : "normal",
        textDecoration,
        WebkitTextStrokeWidth: strokeWidth ? strokeWidth : undefined,
        WebkitTextStrokeColor: strokeColor,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        boxSizing: "border-box",
      }}
    >
      {displayText}
    </a>
  );
}
