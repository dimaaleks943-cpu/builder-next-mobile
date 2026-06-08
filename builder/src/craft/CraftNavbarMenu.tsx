import { useNode } from "@craftjs/core"
import type { CSSProperties, ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import { useCraftNodeStyle } from "../pages/builder/hooks/useCraftNodeStyle.ts"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import { COLORS } from "../theme/colors"
import { useNavbarMenu } from "../pages/builder/context/navbarMenuContext.tsx"

interface Props {
  children?: ReactNode
  style?: ResponsiveStyle
  styleClassIds?: string[]
}

export const CraftNavbarMenu = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const { isMenuOpen, isCompact } = useNavbarMenu()
  const {
    connectors: { connect, drag },
  } = useNode()

  const mergedStyle: CSSProperties = {
    ...(responsiveStyle as CSSProperties),
    ...(!isCompact
      ? { display: "none" }
      : isMenuOpen
        ? { display: "flex", flexDirection: "column" }
        : { display: "none" }),
    transition: "max-height 0.3s ease, opacity 0.2s ease",
  }

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      role="menu"
      style={mergedStyle}
    >
      {props.children}
    </div>
  )
};

(CraftNavbarMenu as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.NavbarMenu,
  props: {
    style: {
      [PreviewViewport.DESKTOP]: {
        display: "none",
      },
      [PreviewViewport.TABLET_LANDSCAPE]: {
        display: "none",
        flexDirection: "column",
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: COLORS.white,
        paddingTop: "8px",
        paddingRight: "16px",
        paddingBottom: "8px",
        paddingLeft: "16px",
        gap: "8px",
      },
    },
  },
  rules: {
    canMoveIn: (nodes: { data: { type: { resolvedName?: string } } }[]) =>
      nodes.every((n) => n.data?.type?.resolvedName === "LinkText"),
  },
  isCanvas: true,
}
