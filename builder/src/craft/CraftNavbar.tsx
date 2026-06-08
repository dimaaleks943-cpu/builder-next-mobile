import { useNode } from "@craftjs/core"
import type { CSSProperties, ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import { useCraftNodeStyle } from "../pages/builder/hooks/useCraftNodeStyle.ts"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import { usePreviewViewport } from "../pages/builder/context/PreviewViewportContext.tsx"
import {
  isCompactPreviewViewport,
  NavbarMenuContext,
} from "../pages/builder/context/navbarMenuContext.tsx"

export interface Props {
  children?: ReactNode
  style?: ResponsiveStyle
  styleClassIds?: string[]
}

export const CraftNavbar = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const viewport = usePreviewViewport()
  const isCompact = isCompactPreviewViewport(viewport)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const {
    connectors: { connect, drag },
  } = useNode((node) => ({
    id: node.id,
  }))

  useEffect(() => {
    if (!isCompact) {
      setIsMenuOpen(false)
    }
  }, [isCompact])

  const menuContextValue = useMemo(
    () => ({ isMenuOpen, setIsMenuOpen, isCompact }),
    [isMenuOpen, isCompact],
  )

  return (
    <NavbarMenuContext.Provider value={menuContextValue}>
      <div
        ref={(ref) => {
          if (!ref) return
          connect(drag(ref))
        }}
        style={responsiveStyle as CSSProperties}
      >
        {props.children}
      </div>
    </NavbarMenuContext.Provider>
  )
};

(CraftNavbar as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.Navbar,
  props: {
    style: {
      [PreviewViewport.DESKTOP]: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        width: "100%",
        boxSizing: "border-box",
      },
    },
  },
  rules: {
    canMoveIn: (nodes: { data: { type: { resolvedName?: string } } }[]) =>
      nodes.every((n) => {
        const resolvedName = n.data?.type?.resolvedName
        return resolvedName === "Block" || resolvedName === "NavbarMenu"
      }),
  },
  isCanvas: true,
}
