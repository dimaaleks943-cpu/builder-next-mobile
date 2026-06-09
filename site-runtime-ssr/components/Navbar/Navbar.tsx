import type { ReactNode } from "react"
import {
  NavbarMenuProvider,
  normalizeMenuIconBreakpoint,
} from "@/lib/navbar/navbarMenuContext"
import { NAVBAR_ROOT_DATA_ATTR } from "@/lib/navbar/navbarAnchorScroll"
import type { NavbarProps } from "@/lib/navbar/navbarTypes"

interface Props extends NavbarProps {
  children?: ReactNode;
  className?: string;
  "data-craft-node-id"?: string;
}

export const Navbar = ({
  children,
  className,
  "data-craft-node-id": dataCraftNodeId,
  menuType,
  easingOpen,
  easingClose,
  durationMs,
  menuIconBreakpoint,
  menuFillsPageHeight,
  disableScrollOffsetWhenFixed,
}: Props) => (
  <NavbarMenuProvider
    menuType={menuType}
    easingOpen={easingOpen}
    easingClose={easingClose}
    durationMs={durationMs}
    menuFillsPageHeight={menuFillsPageHeight}
  >
    <div
      className={className}
      data-craft-node-id={dataCraftNodeId}
      style={{ position: "relative" }}
      {...{ [NAVBAR_ROOT_DATA_ATTR]: dataCraftNodeId ?? "" }}
      data-disable-scroll-offset={
        disableScrollOffsetWhenFixed ? "true" : undefined
      }
      data-menu-icon-breakpoint={normalizeMenuIconBreakpoint(menuIconBreakpoint)}
    >
      {children}
    </div>
  </NavbarMenuProvider>
)
