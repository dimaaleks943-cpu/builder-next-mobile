import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import { BODY_CRAFT_DEFAULT_PROPS } from "./defaultDefaultCraftStyles.ts"
import { useCraftNodeStyle } from "../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"

export type BodyProps = {
  children?: ReactNode
  styleClassIds?: string[]
  style?: ResponsiveStyle
}

// Root component используется только как стартовый элемент холста, не удаляется
export const CraftBody = (props: BodyProps) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)

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
      style={responsiveStyle}
    >
      {props.children}
    </div>
  )
};

(CraftBody as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.Body,
  props: BODY_CRAFT_DEFAULT_PROPS,
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}
