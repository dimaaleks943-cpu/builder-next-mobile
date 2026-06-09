import { useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import { useCraftNodeStyle } from "../pages/builder/hooks/useCraftNodeStyle.ts"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import { BurgerIcon } from "../icons/BurgerIcon.tsx"
import { useNavbarMenu } from "../pages/builder/context/navbarMenuContext.tsx"

interface Props {
  style?: ResponsiveStyle
  styleClassIds?: string[]
}

export const CraftNavbarMenuButton = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const { isMenuOpen, isCompact } = useNavbarMenu()
  const {
    connectors: { connect, drag },
  } = useNode()

  const mergedStyle: CSSProperties = {
    ...(responsiveStyle as CSSProperties),
    ...(!isCompact ? { display: "none" } : { cursor: "default" }),
  }

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      role="button"
      aria-label="menu"
      aria-haspopup="menu"
      aria-expanded={isMenuOpen}
      style={mergedStyle}
    >
      <div>
        <BurgerIcon />
      </div>
    </div>
  )
};

(CraftNavbarMenuButton as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.NavbarMenuButton,
  props: {
    style: {
      [PreviewViewport.DESKTOP]: {
        display: "none",
      },
      [PreviewViewport.TABLET_LANDSCAPE]: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px",
        cursor: "default",
        boxSizing: "border-box",
      },
    },
  },
  rules: {
    canMoveIn: () => false,
  },
}
