import { useNode } from "@craftjs/core"
import type { CSSProperties, ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import { useCraftResolvedStyle } from "../pages/builder/hooks/useCraftResolvedStyle.ts"

export type BlockProps = {
  children?: ReactNode
  style?: ResponsiveStyle
  styleClassId?: string | null
}

export const CraftBlock = (props: BlockProps) => {
  const responsiveStyle = useCraftResolvedStyle(
    CRAFT_DISPLAY_NAME.Block,
    props.styleClassId,
    props.style,
  )
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
  props: {},
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}

