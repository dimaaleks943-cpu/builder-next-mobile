import { useMemo } from "react"
import { useContentData } from "./ContentDataContext"
import {
  DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  resolveCraftVisualEffectsStyle,
  type CraftVisualEffectsProps,
} from "@/lib/craftVisualEffects"

interface ImageProps extends CraftVisualEffectsProps {
  src?: string
  alt?: string
  width?: number
  height?: number
  borderRadius?: number
  collectionField?: string | null
  backgroundColor?: string
  /** Зарезервировано под будущий UI; в рендере пока не используется */
  backgroundClip?: string
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
  backgroundColor = "#F9F9F9",
  backgroundClip: _backgroundClip,
  mixBlendMode = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.mixBlendMode,
  opacityPercent = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.opacityPercent,
  outlineStyleMode = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineStyleMode,
  outlineWidth = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineWidth,
  outlineOffset = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineOffset,
  outlineColor = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineColor,
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
        backgroundColor,
        ...resolveCraftVisualEffectsStyle({
          mixBlendMode,
          opacityPercent,
          outlineStyleMode,
          outlineWidth,
          outlineOffset,
          outlineColor,
        }),
      }}
    />
  )
}
