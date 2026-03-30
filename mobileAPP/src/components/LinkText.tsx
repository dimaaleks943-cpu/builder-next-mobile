import { useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text as RNText, type TextStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useContentData } from "../contexts/ContentDataContext";
import {
  findContentItemField,
  getContentFieldDisplayValue,
} from "../content/contentFieldValue";

interface LinkTextProps {
  text?: string;
  collectionField?: string | null;
  href?: string;
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
  href,
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


  const handlePress = () => {
    if (!href) return;

    if (href.startsWith("/")) {
      navigation.navigate("Page", { slug: href });
      return;
    }

    Linking.openURL(href).catch((error) => {
      console.warn("[LinkText] Failed to open URL:", href, error);
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
      <RNText style={[styles.base, style]}>{displayText}</RNText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

