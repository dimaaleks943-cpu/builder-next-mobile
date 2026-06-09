import { NodeElement, useEditor, useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { CRAFT_DISPLAY_NAME } from "../../craftDisplayNames.ts"
import type { ResponsiveStyle } from "../../../pages/builder/responsiveStyle.ts"
import { useCraftNodeStyle } from "../../../pages/builder/hooks/useCraftNodeStyle.ts"
import { PreviewViewport } from "../../../pages/builder/builder.enum.ts"
import { COLORS } from "../../../theme/colors.ts"
import { useNavbarMenu } from "../../../pages/builder/context/navbarMenuContext.tsx"
import {
  findNavbarAncestorId,
  findNavbarLinkContainerIds,
  getNavbarLinkTextChildIds,
} from "../../../pages/builder/utils/navbarLinkUtils.ts"

interface Props {
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
    menuFillsPageHeight,
  } = useNavbarMenu()
  const {
    connectors: { connect, drag },
    id,
  } = useNode()

  const { linkIds } = useEditor((_, query): { linkIds: string[] } => {
    try {
      const navbarId = findNavbarAncestorId(query, id)
      if (!navbarId) {
        return { linkIds: [] }
      }
      const { navbarLinksId } = findNavbarLinkContainerIds(query, navbarId)
      if (!navbarLinksId) {
        return { linkIds: [] }
      }
      return { linkIds: getNavbarLinkTextChildIds(query, navbarLinksId) }
    } catch {
      return { linkIds: [] }
    }
  })

  const easing = isMenuOpen ? easingOpen : easingClose
  const overlayTransition = `opacity ${durationMs}ms ${easing}, transform ${durationMs}ms ${easing}`
  const dropDownClipTransition = `max-height ${durationMs}ms ${easing}`
  const dropDownMenuTransition = `transform ${durationMs}ms ${easing}`

  const renderMenuLinks = () =>
    isCompact
      ? linkIds.map((linkId) => <NodeElement key={linkId} id={linkId} />)
      : null

  if (!isCompact) {
    return (
      <div
        ref={(ref) => {
          if (!ref) return
          connect(drag(ref))
        }}
        role="menu"
        style={{ ...(responsiveStyle as CSSProperties), display: "none" }}
      />
    )
  }

  if (menuType === "dropDown") {
    const clipStyle: CSSProperties = {
      position: "absolute",
      top: "100%",
      left: 0,
      width: "100%",
      overflow: "hidden",
      maxHeight: isMenuOpen
        ? menuFillsPageHeight
          ? "100vh"
          : "2000px"
        : 0,
      transition: dropDownClipTransition,
      zIndex: 10,
      pointerEvents: isMenuOpen ? "auto" : "none",
    }

    const menuStyle: CSSProperties = {
      ...(responsiveStyle as CSSProperties),
      display: "flex",
      flexDirection: "column",
      width: "100%",
      boxSizing: "border-box",
      transform: isMenuOpen ? "translateY(0)" : "translateY(-100%)",
      transition: dropDownMenuTransition,
      ...(menuFillsPageHeight && isMenuOpen
        ? { minHeight: "100vh", height: "100vh" }
        : {}),
    }

    return (
      <div
        ref={(ref) => {
          if (!ref) return
          connect(drag(ref))
        }}
        style={clipStyle}
      >
        <div role="menu" style={menuStyle}>
          {renderMenuLinks()}
        </div>
      </div>
    )
  }

  const typeLayout: CSSProperties =
    menuType === "overRight"
      ? {
          top: 0,
          right: 0,
          height: menuFillsPageHeight ? "100vh" : "max-content",
          width: "min(280px, 80%)",
          flexDirection: "column",
          transform: isMenuOpen ? "translateX(0)" : "translateX(100%)",
        }
      : {
          top: 0,
          left: 0,
          height: menuFillsPageHeight ? "100vh" : "max-content",
          width: "min(280px, 80%)",
          flexDirection: "column",
          transform: isMenuOpen ? "translateX(0)" : "translateX(-100%)",
        }

  const mergedStyle: CSSProperties = {
    ...(responsiveStyle as CSSProperties),
    display: "flex",
    position: "absolute",
    boxSizing: "border-box",
    zIndex: 10,
    opacity: isMenuOpen ? 1 : 0,
    pointerEvents: isMenuOpen ? "auto" : "none",
    transition: overlayTransition,
    ...typeLayout,
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
      {renderMenuLinks()}
    </div>
  )
};

(CraftNavbarMenu as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.NavbarMenu,
  props: {
    style: {
      [PreviewViewport.DESKTOP]: {
        flexDirection: "column",
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: COLORS.white,
        paddingTop: 8,
        paddingRight: 16,
        paddingBottom: 8,
        paddingLeft: 16,
        gap: "8px",
      },
    },
  },
  rules: {
    canMoveIn: () => false,
  },
  isCanvas: false,
}
