import { useMemo } from "react"
import { useContentData } from "./ContentDataContext"

interface ImageProps {
  src?: string
  alt?: string
  width?: number
  height?: number
  borderRadius?: number
  collectionField?: string | null
}

/** извлекает URL из значения поля коллекции TODO пока жестко достает из продукта, изменить после добавления АПИ ти контента  */
const extractUrlFromFieldValue = (fieldValue: unknown): string | null => {
  if (fieldValue === null || fieldValue === undefined) return null
  if (typeof fieldValue === "string") return fieldValue
  if (typeof fieldValue === "object") {
    const asAny = fieldValue as Record<string, unknown>
    const fromDirectUrl = asAny.url as string | undefined
    const fromSmall = (asAny.urls as Record<string, { url?: string }> | undefined)?.small?.url
    const fromOriginal = (asAny.urls as Record<string, { url?: string }> | undefined)?.original?.url
    const candidate = fromDirectUrl ?? fromSmall ?? fromOriginal
    return candidate && typeof candidate === "string" ? candidate : null
  }
  return null
}

export const Image = ({
  src,
  alt = "Изображение",
  width,
  height,
  borderRadius = 8,
  collectionField = null,
}: ImageProps) => {
  const contentData = useContentData()

  const effectiveSrc = useMemo(() => {
    if (collectionField && contentData?.itemData) {
      const fieldValue = contentData.itemData[collectionField]
      const fromCollection = extractUrlFromFieldValue(fieldValue)
      if (fromCollection) return fromCollection
    }

    if (src && src.trim().length > 0) return src

    return "https://cdn-icons-png.flaticon.com/128/17807/17807769.png"
  }, [collectionField, contentData?.itemData, src])

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      style={{
        display: "block",
        width: width ?? "100%",
        height: height ?? "auto",
        minHeight: height ?? 140,
        objectFit: "cover",
        borderRadius,
        boxSizing: "border-box",
        backgroundColor: "#F9F9F9",
      }}
    />
  )
}
