import type { ReactNode } from "react"
import { withOpacity } from "@/lib/colorUtils"
import {
  DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  resolveCraftVisualEffectsStyle,
  type CraftVisualEffectsProps,
} from "@/lib/craftVisualEffects"

interface BodyProps extends CraftVisualEffectsProps {
  children?: ReactNode
  layout?: "block" | "flex" | "grid" | "absolute"
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  borderRadius?: number
  borderTopWidth?: number
  borderRightWidth?: number
  borderBottomWidth?: number
  borderLeftWidth?: number
  borderColor?: string
  borderStyle?: "none" | "solid" | "dashed"
  borderOpacity?: number
  backgroundColor?: string
  /** Зарезервировано под будущий UI; в рендере пока не используется */
  backgroundClip?: string
}

export const Body = ({
  children,
  layout = "block",
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
  paddingTop = 0,
  paddingRight = 0,
  paddingBottom = 0,
  paddingLeft = 0,
  borderRadius = 0,
  borderTopWidth = 0,
  borderRightWidth = 0,
  borderBottomWidth = 0,
  borderLeftWidth = 0,
  borderColor = "#CBD5E0",
  borderStyle = "solid",
  borderOpacity = 1,
  backgroundColor = "#FFFFFF",
  backgroundClip: _backgroundClip,
  mixBlendMode = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.mixBlendMode,
  opacityPercent = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.opacityPercent,
  outlineStyleMode = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineStyleMode,
  outlineWidth = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineWidth,
  outlineOffset = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineOffset,
  outlineColor = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineColor,
}: BodyProps) => {
  const hasBorder =
    borderTopWidth > 0 ||
    borderRightWidth > 0 ||
    borderBottomWidth > 0 ||
    borderLeftWidth > 0

  const effectiveBorderColor = hasBorder
    ? withOpacity(borderColor ?? "#CBD5E0", borderOpacity ?? 1)
    : "transparent"

  return (
    <div
      style={{
        width: "100%",
        minHeight: 80,
        display:
          layout === "flex" ? "flex" : layout === "grid" ? "grid" : "block",
        position: layout === "absolute" ? "absolute" : "relative",
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        borderRadius,
        borderTopWidth: hasBorder ? borderTopWidth : 0,
        borderRightWidth: hasBorder ? borderRightWidth : 0,
        borderBottomWidth: hasBorder ? borderBottomWidth : 0,
        borderLeftWidth: hasBorder ? borderLeftWidth : 0,
        borderColor: effectiveBorderColor,
        borderStyle: hasBorder ? borderStyle : "solid",
        backgroundColor,
        boxSizing: "border-box",
        ...resolveCraftVisualEffectsStyle({
          mixBlendMode,
          opacityPercent,
          outlineStyleMode,
          outlineWidth,
          outlineOffset,
          outlineColor,
        }),
      }}
    >
      {children}
    </div>
  )
}
