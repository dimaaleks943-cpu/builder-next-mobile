import { useMemo } from "react";
import { useContentData } from "./ContentDataContext";
import {
  findContentItemField,
  getContentFieldDisplayValue,
} from "@/lib/contentFieldValue";
import type { IContentItem } from "@/lib/contentTypes";
import { usePageLocale } from "@/components/PageLocaleContext";
import { resolveTranslationText } from "@/lib/resolvePageTranslation";
import { useResolvedLinkHref } from "@/hooks/useResolvedLinkHref";

interface LinkTextProps {
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

  const resolvedHref = useResolvedLinkHref({
    href,
    linkMode,
    collectionItemLinkTarget,
    collectionItemTemplatePageId,
    logTag: "LinkText",
  });

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
