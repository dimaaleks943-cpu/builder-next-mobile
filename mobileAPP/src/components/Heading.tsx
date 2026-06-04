import { useMemo } from "react";
import { Text as RNText, type TextStyle, StyleProp } from "react-native";
import { useContentData } from "../contexts/ContentDataContext";
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

interface Props {
  style?: unknown;
  text?: string;
  collectionField?: string | null;
  nativeID?: string;
  testID?: string;
}

export const Heading = ({
  text,
  collectionField = null,
  style,
  nativeID,
  testID,
}: Props) => {
  const { viewport } = useResponsiveViewport();
  const { resolveRnFontFamily } = useUploadedFonts();
  const rs = resolveResponsiveStyle(style, viewport);
  const contentData = useContentData();
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
    ...buildCraftTextRnStyle(rs, { resolveRnFontFamily }),
    textDecorationLine:
      (textDecorationParts.length > 0
        ? textDecorationParts.join(" ")
        : "none") as TextStyle["textDecorationLine"],
    textTransform,
    ...opacityEffects,
  };

  return (
    <RNText nativeID={nativeID} testID={testID} style={textStyle}>
      {displayText}
    </RNText>
  );
};
