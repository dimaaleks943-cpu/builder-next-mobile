import React from "react"
import { useContentData } from "./ContentDataContext"

interface TextProps {
  text?: string
  collectionField?: string | null
  fontSize?: number
  fontWeight?: "normal" | "bold"
  textAlign?: "left" | "center" | "right"
  color?: string
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
  text = "Text",
  collectionField = null,
  fontSize = 14,
  fontWeight = "normal",
  textAlign = "left",
  color = "#2D2D2F",
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

  // Если выбрано поле коллекции, подставляем значение из itemData
  const displayText = React.useMemo(() => {
    if (collectionField && contentData?.itemData) {
      const fieldValue = contentData.itemData[collectionField]
      if (fieldValue !== null && fieldValue !== undefined) {
        // Преобразуем значение в строку
        if (typeof fieldValue === "object") {
          return JSON.stringify(fieldValue)
        }
        return String(fieldValue)
      }
    }
    return text
  }, [collectionField, contentData?.itemData, text])

  return (
    <span
      style={{
        display: "inline-block",
        fontSize,
        fontWeight,
        textAlign,
        color,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
      }}
    >
      {displayText}
    </span>
  )
}
