import { useMemo } from "react"
import { useContentData } from "./ContentDataContext"

interface ImageProps {
  className?: string
  "data-craft-node-id"?: string
  htmlId?: string
  src?: string
  alt?: string
  collectionField?: string | null
}

const DEFAULT_PLACEHOLDER =
  "https://cdn-icons-png.flaticon.com/128/17807/17807769.png"

export const Image = ({
  className,
  "data-craft-node-id": dataCraftNodeId,
  htmlId,
  src,
  alt = "Изображение",
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
      className={className}
      data-craft-node-id={dataCraftNodeId}
      {...(htmlId ? { id: htmlId } : {})}
      src={effectiveSrc}
      alt={alt}
    />
  )
}
