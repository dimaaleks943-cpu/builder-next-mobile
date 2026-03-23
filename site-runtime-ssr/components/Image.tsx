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

const DEFAULT_PLACEHOLDER =
  "https://cdn-icons-png.flaticon.com/128/17807/17807769.png"

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
    // TODO: когда в контенте появится тип поля «изображение» с URL, резолвить из item.fields по collectionField.
    if (collectionField && contentData?.itemData) {
      return DEFAULT_PLACEHOLDER
    }

    if (src && src.trim().length > 0) return src

    return DEFAULT_PLACEHOLDER
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
