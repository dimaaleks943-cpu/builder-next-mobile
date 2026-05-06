import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import { usePreviewViewport } from "../pages/builder/context/PreviewViewportContext.tsx"
import { resolveResponsiveStyle, type ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import {
  type CraftMixBlendMode,
  DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  resolveCraftVisualEffectsStyle,
} from "./craftVisualEffects.ts"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"

export type BodyLayoutMode = "block" | "flex" | "grid" | "absolute"

export type BodyProps = {
  children?: ReactNode
  style?: ResponsiveStyle
}

// Root component используется только как стартовый элемент холста, не удаляется
export const CraftBody = (props: BodyProps) => {
  const viewport = usePreviewViewport()
  const responsiveStyle = resolveResponsiveStyle(props.style, viewport)
  const layout = (responsiveStyle.layout as BodyLayoutMode | undefined) ?? "block"
  const mixBlendMode = (responsiveStyle.mixBlendMode as CraftMixBlendMode | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.mixBlendMode
  const opacityPercent = (responsiveStyle.opacityPercent as number | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.opacityPercent
  const outlineStyleMode =
    (responsiveStyle.outlineStyleMode as (typeof DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS)["outlineStyleMode"]) ??
    DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineStyleMode
  const outlineWidth = (responsiveStyle.outlineWidth as number | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineWidth
  const outlineOffset = (responsiveStyle.outlineOffset as number | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineOffset
  const outlineColor = (responsiveStyle.outlineColor as string | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineColor
  const {
    connectors: { connect, drag }
  } = useNode((node) => ({
    selected: node.events.selected,
  }))

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      style={{
        ...responsiveStyle,
        width: "100%",
        minHeight: 80,
        //TODO изменить после layuotBLock
        display: layout === "flex" ? "flex" : layout === "grid" ? "grid" : "block",
        position: "relative",
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
    style: {
      [PreviewViewport.DESKTOP]: {
        layout: "block" as BodyLayoutMode,
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        ...DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
      },
    },
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}
