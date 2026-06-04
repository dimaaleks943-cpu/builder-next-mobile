import { useMemo } from "react";
import {
  Linking,
  Pressable,
  Text as RNText,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useContentData } from "../contexts/ContentDataContext";
import { useStorefrontPage } from "../contexts/StorefrontPageContext";
import { useResponsiveViewport } from "../contexts/ResponsiveViewportContext";
import { useUploadedFonts } from "../contexts/UploadedFontsContext/UploadedFontsContext";
import {
  buildCraftTextRnStyle,
  resolveResponsiveStyle,
} from "../content/responsiveStyle";
import {
  findContentItemField,
  getContentFieldDisplayValue,
} from "../content/contentFieldValue";
import { resolveCraftVisualEffectsRnStyle } from "../lib/craftVisualEffectsRn";
import { useResolvedLinkHref } from "../hooks/useResolvedLinkHref";

interface LinkTextProps {
  style?: unknown;
  text?: string;
  collectionField?: string | null;
  href?: string;
  linkMode?: "url" | "page" | "collectionItemPage";
  collectionItemLinkTarget?: "none" | "template";
  collectionItemTemplatePageId?: string | null;
  openInNewTab?: boolean;
  nativeID?: string;
}

export const LinkText = ({
  text = "Ссылка",
  collectionField = null,
  href = "http://www.google.com",
  linkMode = "url",
  collectionItemLinkTarget = "none",
  collectionItemTemplatePageId = null,
  openInNewTab: _openInNewTab,
  style,
  nativeID,
}: LinkTextProps) => {
  const { viewport } = useResponsiveViewport();
  const { resolveRnFontFamily } = useUploadedFonts();
  const rs = resolveResponsiveStyle(style, viewport);
  const navigation = useNavigation<any>();
  const contentData = useContentData();
  const { previewParams } = useStorefrontPage();
  const textTransform =
    (rs.textTransform as "none" | "uppercase" | "lowercase" | "capitalize" | undefined) ??
    "none";
  const isItalic = Boolean(rs.isItalic);
  const isUnderline = Boolean(rs.isUnderline);
  const isStrikethrough = Boolean(rs.isStrikethrough);

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

  const resolvedHref = useResolvedLinkHref({
    href,
    linkMode,
    collectionItemLinkTarget,
    collectionItemTemplatePageId,
    logTag: "LinkText",
  });

  const handlePress = () => {
    const target =
      typeof resolvedHref === "string" ? resolvedHref.trim() : "";
    if (!target || target === "#") return;

    if (target.startsWith("/")) {
      navigation.navigate("Page", { slug: target, previewParams });
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
    ...buildCraftTextRnStyle(rs, { resolveRnFontFamily }),
    textDecorationLine: textDecorationParts.join(
      " ",
    ) as TextStyle["textDecorationLine"],
    textTransform,
    ...opacityEffects,
  };

  return (
    <Pressable nativeID={nativeID} onPress={handlePress}>
      <RNText style={linkTextStyle}>
        {displayText}
      </RNText>
    </Pressable>
  );
};
