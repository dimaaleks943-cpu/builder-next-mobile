import { useMemo } from "react";
import { useContentData } from "./ContentDataContext";
import {
  findContentItemField,
  getContentFieldDisplayValue,
} from "@/lib/contentFieldValue";
import type { IContentItem } from "@/lib/contentTypes";

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

  const textDecoration = [
    "underline",
    isStrikethrough ? "line-through" : "",
    isUnderline ? "underline" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      href={href}
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
