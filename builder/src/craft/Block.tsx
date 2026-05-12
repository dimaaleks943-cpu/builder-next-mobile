import { useNode } from "@craftjs/core"
import type { CSSProperties, ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import { usePreviewViewport } from "../pages/builder/context/PreviewViewportContext.tsx"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import {
  resolveResponsiveStyle,
  type ResponsiveStyle,
} from "../pages/builder/responsiveStyle.ts"

export type BlockProps = {
  children?: ReactNode
  style?: ResponsiveStyle
}

export const CraftBlock = (props: BlockProps) => {
  const viewport = usePreviewViewport()
  const responsiveStyle = resolveResponsiveStyle(props.style, viewport)
  const {
    connectors: { connect, drag },
  } = useNode((node) => ({
    id: node.id,
  }))

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      style={responsiveStyle as CSSProperties}
    >
      {props.children}
    </div>
  )
};

(CraftBlock as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.Block,
  props: {
    style: {
      [PreviewViewport.DESKTOP]: {
        display: "block",
        height: "20px", //TODO default height что бы видеть блок на холсте
        boxSizing: "border-box",
      },
    },
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}

