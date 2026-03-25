import { useMemo } from "react";
import { Text as RNText, StyleSheet, type TextStyle } from "react-native";
import { useContentData } from "../contexts/ContentDataContext";
import {
  findContentItemField,
  getContentFieldDisplayValue,
} from "../content/contentFieldValue";

interface TextProps {
  text?: string;
  collectionField?: string | null;
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

export const Text = ({
  text,
  collectionField = null,
  fontSize = 14,
  fontWeight = "normal",
  textAlign = "left",
  color = "#333333",
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
}: TextProps) => {
  const contentData = useContentData();

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

  const style = {
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
  } as TextStyle;

  return <RNText style={[styles.base, style]}>{displayText}</RNText>;
};

const styles = StyleSheet.create({
  base: {
    fontSize: 14,
    color: "#333333",
  },
});

