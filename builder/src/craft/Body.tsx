import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import { useCraftNodeStyle } from "../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"

export type BodyProps = {
  children?: ReactNode
  styleClassId?: string | null
  style?: ResponsiveStyle
}

// Root component используется только как стартовый элемент холста, не удаляется
export const CraftBody = (props: BodyProps) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassId, props.style)

  const {
    connectors: { connect, drag },
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
      }}
    >
      {props.children}
    </div>
  )
};

(CraftBody as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.Body,
  props: {
    style: {
      [PreviewViewport.DESKTOP]: {
        display: "block",
        boxSizing: "border-box",
        position: "relative",
        width: "100%",
      },
    },
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}
