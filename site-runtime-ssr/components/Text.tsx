import { useMemo } from "react"
import { useContentData } from "./ContentDataContext"
import {
  findContentItemField,
  getContentFieldDisplayValue,
} from "@/lib/contentFieldValue"
import type { IContentItem } from "@/lib/contentTypes"

interface TextProps {
  text?: string
  collectionField?: string | null
  fontSize?: number
  fontWeight?: "normal" | "bold"
  textAlign?: "left" | "center" | "right"
  color?: string
  fontFamily?: string
  lineHeight?: number
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize"
  strokeColor?: string
  strokeWidth?: number
  isItalic?: boolean
  isUnderline?: boolean
  isStrikethrough?: boolean
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
}

export const Text = ({
  text = "Текст",
  collectionField = null,
  fontSize = 14,
  fontWeight = "normal",
  textAlign = "left",
  color = "#727280",
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
}: TextProps) => {
  const contentData = useContentData()

  const displayText = useMemo(() => {
    if (collectionField && contentData?.itemData) {
      const item = contentData.itemData as IContentItem
      const field = findContentItemField(item, collectionField)
      if (field) {
        return getContentFieldDisplayValue(field)
      }
    }
    return text
  }, [collectionField, contentData?.itemData, text])

  const textDecoration = [
    isUnderline ? "underline" : "",
    isStrikethrough ? "line-through" : "",
  ]
    .filter(Boolean)
    .join(" ") || "none"

  return (
    <span
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
    </span>
  )
}
