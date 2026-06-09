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
  const {
    isMenuOpen,
    isCompact,
    menuType,
    easingOpen,
    easingClose,
    durationMs,
  } = useNavbarMenu()
  const {
    connectors: { connect, drag },
  } = useNode()

  const isDropDown = menuType === "dropDown"
  const easing = isMenuOpen ? easingOpen : easingClose
  const transition = `opacity ${durationMs}ms ${easing}, transform ${durationMs}ms ${easing}`

  const typeLayout: CSSProperties =
    menuType === "overRight"
      ? {
          top: 0,
          right: 0,
          height: "100%",
          width: "min(280px, 80%)",
          flexDirection: "column",
          transform: isMenuOpen ? "translateX(0)" : "translateX(100%)",
        }
      : menuType === "overLeft"
        ? {
            top: 0,
            left: 0,
            height: "100%",
            width: "min(280px, 80%)",
            flexDirection: "column",
            transform: isMenuOpen ? "translateX(0)" : "translateX(-100%)",
          }
        : {
            width: "100%",
            flexDirection: "column",
            transform: isMenuOpen ? "translateY(0)" : "translateY(-8px)",
          }

  const mergedStyle: CSSProperties = {
    ...(responsiveStyle as CSSProperties),
    ...(!isCompact
      ? { display: "none" }
      : isDropDown
        ? {
            display: isMenuOpen ? "flex" : "none",
            position: "relative",
            boxSizing: "border-box",
            width: "100%",
            opacity: isMenuOpen ? 1 : 0,
            transition,
            backgroundColor: COLORS.white,
            ...typeLayout,
          }
        : {
            display: "flex",
            position: "absolute",
            boxSizing: "border-box",
            zIndex: 10,
            opacity: isMenuOpen ? 1 : 0,
            pointerEvents: isMenuOpen ? "auto" : "none",
            transition,
            backgroundColor: COLORS.white,
            ...typeLayout,
          }),
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
