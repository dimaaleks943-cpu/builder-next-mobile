import { useNode } from "@craftjs/core"
import type { CSSProperties, ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import { useCraftNodeStyle } from "../pages/builder/hooks/useCraftNodeStyle.ts"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"

export interface NavbarProps {
  children?: ReactNode
  style?: ResponsiveStyle
  styleClassIds?: string[]
}

export const CraftNavbar = (props: NavbarProps) => {
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

(CraftNavbar as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.Navbar,
  props: {
    style: {
      [PreviewViewport.DESKTOP]: {
        display: "flex",
        justifyContent: "flex-start",
        width: "100%",
        boxSizing: "border-box",
      },
    },
  },
  rules: {
    canMoveIn: (nodes: { data: { type: { resolvedName?: string } } }[]) =>
      nodes.every((n) => n.data?.type?.resolvedName === "Block"),
  },
  isCanvas: true,
}
