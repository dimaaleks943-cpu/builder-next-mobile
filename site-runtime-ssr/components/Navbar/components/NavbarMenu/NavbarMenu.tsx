import type { CSSProperties, MouseEvent, ReactNode } from "react"
import { useNavbarMenu } from "@/lib/navbar/navbarMenuContext"
import { MenuShell } from "./styles"

interface Props {
  children?: ReactNode;
  className?: string;
  "data-craft-node-id"?: string;
  htmlId?: string;
}

export const NavbarMenu = ({
  children,
  className,
  "data-craft-node-id": dataCraftNodeId,
  htmlId,
}: Props) => {
  const {
    isMenuOpen,
    menuType,
    easingOpen,
    easingClose,
    durationMs,
    menuFillsPageHeight,
    setIsMenuOpen,
  } = useNavbarMenu()

  const easing = isMenuOpen ? easingOpen : easingClose
  const overlayTransition = `opacity ${durationMs}ms ${easing}, transform ${durationMs}ms ${easing}`
  const dropDownClipTransition = `max-height ${durationMs}ms ${easing}`
  const dropDownMenuTransition = `transform ${durationMs}ms ${easing}`

  const handleMenuClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target
    if (target instanceof Element && target.closest("a[href]")) {
      setIsMenuOpen(false)
    }
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
        {...(htmlId ? { id: htmlId } : {})}
        style={clipStyle}
        onClick={handleMenuClick}
      >
        <MenuShell
          className={className}
          data-craft-node-id={dataCraftNodeId}
          role="menu"
          style={menuStyle}
        >
          {children}
        </MenuShell>
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
    <MenuShell
      className={className}
      data-craft-node-id={dataCraftNodeId}
      {...(htmlId ? { id: htmlId } : {})}
      role="menu"
      style={mergedStyle}
      onClick={handleMenuClick}
    >
      {children}
    </MenuShell>
  )
}
