import { useNode } from "@craftjs/core"
import type { CSSProperties, ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import { useCraftNodeStyle } from "../pages/builder/hooks/useCraftNodeStyle.ts"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"

export type BlockProps = {
  children?: ReactNode
  style?: ResponsiveStyle
  styleClassIds?: string[]
}

export const CraftBlock = (props: BlockProps) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
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
        height: "20px",
        boxSizing: "border-box",
      },
    },
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}

