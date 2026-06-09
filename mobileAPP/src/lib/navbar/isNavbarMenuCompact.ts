import type { Viewport } from "../../content/responsiveStyle";
import { MENU_ICON_BREAKPOINT_MAX_WIDTH } from "./menuIconBreakpoint";
import type { NavbarMenuIconBreakpointValue } from "./navbarTypes";

const VIEWPORT_MAX_WIDTH: Record<Viewport, number> =
  MENU_ICON_BREAKPOINT_MAX_WIDTH;

export const isNavbarMenuCompact = (
  viewport: Viewport,
  menuIconBreakpoint: NavbarMenuIconBreakpointValue,
): boolean => {
  if (menuIconBreakpoint === "none") {
    return false;
  }
  if (menuIconBreakpoint === "desktop") {
    return true;
  }
  return (
    VIEWPORT_MAX_WIDTH[viewport] <=
    MENU_ICON_BREAKPOINT_MAX_WIDTH[menuIconBreakpoint]
  );
};
