import { useMemo } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
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
import { buildStorefrontTemplateHref } from "../lib/catalogPathResolve";
import { normalizeItemPathPrefix } from "../lib/templateRoute";
import {
  findContentItemField,
  getContentFieldDisplayValue,
} from "../content/contentFieldValue";

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
  openInNewTab, // не используется в RN, оставлен для совместимости с типом конструктора
  fontSize = 14,
  fontWeight = "normal",
  textAlign = "left",
  color = "#00C78D",
  fontFamily,
  lineHeight = 20,
  textTransform = "none",
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
  const navigation = useNavigation<any>();
  const contentData = useContentData();
  const { sitePages } = useSiteCollections();
  const { filterScope } = useContentListContext();
  const { selectedCategorySlugByScope } = useCollectionFilterScope();
  const { categorySlugTrailFromUrl } = useStorefrontPage();

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

  const style = {
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
  } as TextStyle;

  return (
    <Pressable onPress={handlePress}>
      <RNText style={[styles.base, style] as StyleProp<TextStyle>}>
        {displayText}
      </RNText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
