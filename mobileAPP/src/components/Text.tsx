import { useMemo } from "react";
import { Text as RNText, type TextStyle, StyleProp } from "react-native";
import { useContentData } from "../contexts/ContentDataContext";
import { useResponsiveViewport } from "../contexts/ResponsiveViewportContext";
import {
  pickResolvedNumber,
  resolveResponsiveStyle,
} from "../content/responsiveStyle";
import {
  findContentItemField,
  getContentFieldDisplayValue,
} from "../content/contentFieldValue";
import { resolveCraftVisualEffectsRnStyle } from "../lib/craftVisualEffectsRn";

interface TextProps {
  style?: unknown;
  text?: string;
  collectionField?: string | null;
}

export const Text = ({
  text,
  collectionField = null,
  style,
}: TextProps) => {
  const { viewport } = useResponsiveViewport();
  const rs = resolveResponsiveStyle(style, viewport);
  const contentData = useContentData();

  const fontSize = pickResolvedNumber(rs, "fontSize", 14);
  const fontWeight = (rs.fontWeight as "normal" | "bold" | undefined) ?? "normal";
  const textAlign = (rs.textAlign as "left" | "center" | "right" | undefined) ?? "left";
  const color =
    rs.color != null && rs.color !== "" ? String(rs.color) : "#333333";
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

  const textDecorationParts: ("underline" | "line-through")[] = [];
  if (isUnderline) {
    textDecorationParts.push("underline");
  }
  if (isStrikethrough) {
    textDecorationParts.push("line-through");
  }

  const opacityEffects =
    opacityPercent !== undefined && Number.isFinite(opacityPercent)
      ? resolveCraftVisualEffectsRnStyle({ opacityPercent })
      : {};

  const textStyle: StyleProp<TextStyle> = {
    fontSize,
    fontWeight,
    textAlign,
    color,
    fontFamily,
    lineHeight,
    textTransform,
    fontStyle: isItalic ? "italic" : "normal",
    textDecorationLine:
      textDecorationParts.length > 0 ? textDecorationParts.join(" ") : "none",
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

  return <RNText style={textStyle}>{displayText}</RNText>;
};
