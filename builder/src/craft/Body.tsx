import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import { COLORS } from "../theme/colors"
import { withOpacity } from "../utils/colorUtils"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import { usePreviewViewport } from "../pages/builder/context/PreviewViewportContext.tsx"
import { resolveResponsiveStyle, type ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import {
  DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  resolveCraftVisualEffectsStyle,
  type CraftVisualEffectsProps,
} from "./craftVisualEffects.ts"

export type BodyLayoutMode = "block" | "flex" | "grid" | "absolute"

export type BodyProps = {
  children?: ReactNode
  layout?: BodyLayoutMode
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
  style?: ResponsiveStyle
} & CraftVisualEffectsProps

// Root component используется только как стартовый элемент холста, не удаляется
export const CraftBody = (props: BodyProps) => {
  const viewport = usePreviewViewport()
  const responsiveStyle = resolveResponsiveStyle(props.style, viewport)
  const layout = (responsiveStyle.layout as BodyLayoutMode | undefined) ?? props.layout ?? "block"
  const marginTop = (responsiveStyle.marginTop as number | undefined) ?? props.marginTop ?? 0
  const marginRight = (responsiveStyle.marginRight as number | undefined) ?? props.marginRight ?? 0
  const marginBottom = (responsiveStyle.marginBottom as number | undefined) ?? props.marginBottom ?? 0
  const marginLeft = (responsiveStyle.marginLeft as number | undefined) ?? props.marginLeft ?? 0
  const paddingTop = (responsiveStyle.paddingTop as number | undefined) ?? props.paddingTop ?? 0
  const paddingRight = (responsiveStyle.paddingRight as number | undefined) ?? props.paddingRight ?? 0
  const paddingBottom = (responsiveStyle.paddingBottom as number | undefined) ?? props.paddingBottom ?? 0
  const paddingLeft = (responsiveStyle.paddingLeft as number | undefined) ?? props.paddingLeft ?? 0
  const borderRadius = (responsiveStyle.borderRadius as number | undefined) ?? props.borderRadius ?? 0
  const borderTopWidth = (responsiveStyle.borderTopWidth as number | undefined) ?? props.borderTopWidth ?? 0
  const borderRightWidth = (responsiveStyle.borderRightWidth as number | undefined) ?? props.borderRightWidth ?? 0
  const borderBottomWidth = (responsiveStyle.borderBottomWidth as number | undefined) ?? props.borderBottomWidth ?? 0
  const borderLeftWidth = (responsiveStyle.borderLeftWidth as number | undefined) ?? props.borderLeftWidth ?? 0
  const borderColor = (responsiveStyle.borderColor as string | undefined) ?? props.borderColor ?? COLORS.gray400
  const borderStyle = (responsiveStyle.borderStyle as "none" | "solid" | "dashed" | undefined) ?? props.borderStyle ?? "solid"
  const borderOpacity = (responsiveStyle.borderOpacity as number | undefined) ?? props.borderOpacity ?? 1
  const backgroundColor = (responsiveStyle.backgroundColor as string | undefined) ?? props.backgroundColor
  const mixBlendMode = (responsiveStyle.mixBlendMode as string | undefined) ?? props.mixBlendMode ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.mixBlendMode
  const opacityPercent = (responsiveStyle.opacityPercent as number | undefined) ?? props.opacityPercent ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.opacityPercent
  const outlineStyleMode = (responsiveStyle.outlineStyleMode as any) ?? props.outlineStyleMode ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineStyleMode
  const outlineWidth = (responsiveStyle.outlineWidth as number | undefined) ?? props.outlineWidth ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineWidth
  const outlineOffset = (responsiveStyle.outlineOffset as number | undefined) ?? props.outlineOffset ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineOffset
  const outlineColor = (responsiveStyle.outlineColor as string | undefined) ?? props.outlineColor ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineColor
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }))

  const hasCustomBorder =
    borderTopWidth > 0 ||
    borderRightWidth > 0 ||
    borderBottomWidth > 0 ||
    borderLeftWidth > 0

  const effectiveBorderColor = hasCustomBorder
    ? withOpacity(borderColor, borderOpacity)
    : "transparent"

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
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
        borderStyle: selected ? "solid" : hasCustomBorder ? (borderStyle || "solid") : "solid",
        borderColor: selected ? COLORS.purple400 : effectiveBorderColor,
        borderTopWidth: selected ? 2 : hasCustomBorder ? borderTopWidth : 0,
        borderRightWidth: selected ? 2 : hasCustomBorder ? borderRightWidth : 0,
        borderBottomWidth: selected ? 2 : hasCustomBorder ? borderBottomWidth : 0,
        borderLeftWidth: selected ? 2 : hasCustomBorder ? borderLeftWidth : 0,
        backgroundColor: backgroundColor ?? COLORS.white,
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
      {props.children}
    </div>
  )
}

;(CraftBody as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.Body,
  props: {
    layout: "block" as BodyLayoutMode,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    borderRadius: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderColor: COLORS.gray400,
    borderStyle: "solid" as const,
    borderOpacity: 1,
    backgroundColor: undefined,
    backgroundClip: undefined,
    ...DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}
