import { useMemo } from "react";
import {
  Linking,
  Pressable,
  Text as RNText,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { IContentItem } from "../api/contentTypes";
import { useContentData } from "../contexts/ContentDataContext";
import { useContentListContext } from "../contexts/ContentListContext";
import { useCollectionFilterScope } from "../contexts/CollectionFilterScopeContext";
import { useStorefrontPage } from "../contexts/StorefrontPageContext";
import { useSiteCollections } from "../contexts/SiteCollectionsContext";
import { useResponsiveViewport } from "../contexts/ResponsiveViewportContext";
import {
  pickResolvedNumber,
  resolveResponsiveStyle,
} from "../content/responsiveStyle";
import { buildStorefrontTemplateHref } from "../lib/catalogPathResolve";
import { normalizeItemPathPrefix } from "../lib/templateRoute";
import {
  findContentItemField,
  getContentFieldDisplayValue,
} from "../content/contentFieldValue";
import { resolveCraftVisualEffectsRnStyle } from "../lib/craftVisualEffectsRn";

interface LinkTextProps {
  style?: unknown;
  text?: string;
  collectionField?: string | null;
  href?: string;
  linkMode?: "url" | "page" | "collectionItemPage";
  collectionItemLinkTarget?: "none" | "template";
  collectionItemTemplatePageId?: string | null;
  openInNewTab?: boolean;
}

export const LinkText = ({
  text = "Ссылка",
  collectionField = null,
  href = "http://www.google.com",
  linkMode = "url",
  collectionItemLinkTarget = "none",
  collectionItemTemplatePageId = null,
  openInNewTab: _openInNewTab, // не используется в RN, оставлен для совместимости с типом конструктора
  style,
}: LinkTextProps) => {
  const { viewport } = useResponsiveViewport();
  const rs = resolveResponsiveStyle(style, viewport);
  const navigation = useNavigation<any>();
  const contentData = useContentData();
  const { sitePages } = useSiteCollections();
  const { filterScope } = useContentListContext();
  const { selectedCategorySlugByScope } = useCollectionFilterScope();
  const { categorySlugTrailFromUrl } = useStorefrontPage();

  const fontSize = pickResolvedNumber(rs, "fontSize", 14);
  const fontWeight = (rs.fontWeight as "normal" | "bold" | undefined) ?? "normal";
  const textAlign = (rs.textAlign as "left" | "center" | "right" | undefined) ?? "left";
  const color =
    rs.color != null && rs.color !== "" ? String(rs.color) : "#00C78D";
  const fontFamily = rs.fontFamily as string | undefined;
  const lineHeight = pickResolvedNumber(rs, "lineHeight", 20);
  const textTransform =
    (rs.textTransform as "none" | "uppercase" | "lowercase" | "capitalize" | undefined) ??
    "none";
  const isItalic = Boolean(rs.isItalic);
  const isUnderline = Boolean(rs.isUnderline);
  const isStrikethrough = Boolean(rs.isStrikethrough);
  const marginTop = pickResolvedNumber(rs, "marginTop", 0);
  const marginRight = pickResolvedNumber(rs, "marginRight", 0);
  const marginBottom = pickResolvedNumber(rs, "marginBottom", 0);
  const marginLeft = pickResolvedNumber(rs, "marginLeft", 0);
  const paddingTop = pickResolvedNumber(rs, "paddingTop", 0);
  const paddingRight = pickResolvedNumber(rs, "paddingRight", 0);
  const paddingBottom = pickResolvedNumber(rs, "paddingBottom", 0);
  const paddingLeft = pickResolvedNumber(rs, "paddingLeft", 0);
  const backgroundColor = rs.backgroundColor as string | undefined;
  const rawOpacity = rs.opacityPercent;
  const opacityPercent =
    typeof rawOpacity === "number" && Number.isFinite(rawOpacity)
      ? rawOpacity
      : typeof rawOpacity === "string" && rawOpacity.trim() !== ""
        ? Number(rawOpacity)
        : undefined;

  const displayText = useMemo(() => {
    if (collectionField && contentData?.itemData) {
      const field = findContentItemField(contentData.itemData, collectionField);
      const resolvedText = getContentFieldDisplayValue(field);
      if (resolvedText !== "") {
        return resolvedText;
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
      if (__DEV__) {
        console.warn(
          "[LinkText] collectionItemTemplatePageId not found in sitePages:",
          templateId,
        );
      }
      return href?.trim() ? href : "#";
    }

    const item = contentData?.itemData as IContentItem | undefined;
    if (!item) {
      if (__DEV__) {
        console.warn(
          "[LinkText] collection item template link needs row context (itemData); using fallback href.",
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
  ]);

  const handlePress = () => {
    const target =
      typeof resolvedHref === "string" ? resolvedHref.trim() : "";
    if (!target || target === "#") return;

    if (target.startsWith("/")) {
      navigation.navigate("Page", { slug: target });
      return;
    }

    Linking.openURL(target).catch((error) => {
      console.warn("[LinkText] Failed to open URL:", target, error);
    });
  };

  const textDecorationParts: ("underline" | "line-through")[] = ["underline"];
  if (isStrikethrough) {
    textDecorationParts.push("line-through");
  }
  if (isUnderline) {
    textDecorationParts.push("underline");
  }

  const opacityEffects =
    opacityPercent !== undefined && Number.isFinite(opacityPercent)
      ? resolveCraftVisualEffectsRnStyle({ opacityPercent })
      : {};

  const linkTextStyle: StyleProp<TextStyle> = {
    fontSize,
    fontWeight,
    textAlign,
    color,
    fontFamily,
    lineHeight,
    textTransform,
    fontStyle: isItalic ? "italic" : "normal",
    textDecorationLine: textDecorationParts.join(" "),
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    ...(backgroundColor ? { backgroundColor } : {}),
    ...opacityEffects,
  } as TextStyle;

  return (
    <Pressable onPress={handlePress}>
      <RNText style={linkTextStyle}>
        {displayText}
      </RNText>
    </Pressable>
  );
};
