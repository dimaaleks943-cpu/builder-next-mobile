import { PreviewViewport } from "../../../builder.enum.ts"
import type { NavbarMenuIconBreakpointValue } from "../../../context/navbarMenuContext.tsx"

export type MenuIconBreakpointIconType = "monitor" | "tablet" | "mobile" | "eyeHide"

export interface MenuIconBreakpointStepMeta {
  breakpoint: NavbarMenuIconBreakpointValue
  title: string
  ariaLabel: string
  icon: MenuIconBreakpointIconType
  rotated?: boolean
}

export const getMenuIconBreakpointStepMeta = (
  breakpoint: NavbarMenuIconBreakpointValue,
): MenuIconBreakpointStepMeta => {
  switch (breakpoint) {
    case PreviewViewport.DESKTOP:
      return {
        breakpoint,
        title: "Desktop",
        ariaLabel: "Desktop",
        icon: "monitor",
      }
    case PreviewViewport.TABLET_LANDSCAPE:
      return {
        breakpoint,
        title: "Tablet landscape",
        ariaLabel: "Tablet landscape",
        icon: "tablet",
        rotated: true,
      }
    case PreviewViewport.TABLET:
      return {
        breakpoint,
        title: "Tablet",
        ariaLabel: "Tablet",
        icon: "tablet",
      }
    case PreviewViewport.PHONE_LANDSCAPE:
      return {
        breakpoint,
        title: "Phone landscape",
        ariaLabel: "Phone landscape",
        icon: "mobile",
        rotated: true,
      }
    case PreviewViewport.PHONE:
      return {
        breakpoint,
        title: "Phone",
        ariaLabel: "Phone",
        icon: "mobile",
      }
    case "none":
      return {
        breakpoint,
        title: "Never",
        ariaLabel: "Never",
        icon: "eyeHide",
      }
    default:
      return {
        breakpoint: PreviewViewport.TABLET,
        title: "Tablet",
        ariaLabel: "Tablet",
        icon: "tablet",
      }
  }
}
