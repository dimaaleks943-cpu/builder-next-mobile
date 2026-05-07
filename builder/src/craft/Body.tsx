import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import { usePreviewViewport } from "../pages/builder/context/PreviewViewportContext.tsx"
import { resolveResponsiveStyle, type ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
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
      },
    },
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}
