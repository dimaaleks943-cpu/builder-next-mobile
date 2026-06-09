import { createContext, useContext } from "react"
import { PreviewViewport } from "../builder.enum.ts"

export interface NavbarMenuPreview {
  show: "show"
  hide: "hide"
}

export type NavbarMenuPreviewValue = NavbarMenuPreview[keyof NavbarMenuPreview]

export interface NavbarMenuType {
  dropDown: "dropDown"
  overRight: "overRight"
  overLeft: "overLeft"
}

export type NavbarMenuTypeValue = NavbarMenuType[keyof NavbarMenuType]

export interface NavbarEasing {
  ease: "ease"
  linear: "linear"
  easeIn: "ease-in"
  easeOut: "ease-out"
  easeInOut: "ease-in-out"
}

export type NavbarEasingValue = NavbarEasing[keyof NavbarEasing]

export interface NavbarMenuContextValue {
  isMenuOpen: boolean
  setIsMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void
  isCompact: boolean
  menuPreview: NavbarMenuPreviewValue
  menuType: NavbarMenuTypeValue
  easingOpen: NavbarEasingValue
  easingClose: NavbarEasingValue
  durationMs: number
}

export const NavbarMenuContext = createContext<NavbarMenuContextValue | null>(
  null,
)

export const useNavbarMenu = (): NavbarMenuContextValue => {
  const context = useContext(NavbarMenuContext)
  if (!context) {
    throw new Error("useNavbarMenu must be used within NavbarMenuContext")
  }
  return context
}

export const isCompactPreviewViewport = (viewport: PreviewViewport): boolean =>
  viewport !== PreviewViewport.DESKTOP
