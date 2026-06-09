import type { NavbarMenuIconBreakpointValue } from "./navbarTypes"

export const DEFAULT_NAVBAR_MENU_ICON_BREAKPOINT: NavbarMenuIconBreakpointValue =
  "tablet_landscape"

export const MENU_ICON_BREAKPOINT_MAX_WIDTH: Record<
  Exclude<NavbarMenuIconBreakpointValue, "none" | "desktop">,
  number
> = {
  tablet_landscape: 1279,
  tablet: 1023,
  phone_landscape: 767,
  phone: 567,
}

export const getCompactMaxWidthPx = (
  breakpoint: NavbarMenuIconBreakpointValue,
): number | null => {
  if (breakpoint === "none" || breakpoint === "desktop") {
    return null
  }
  return MENU_ICON_BREAKPOINT_MAX_WIDTH[breakpoint]
}
