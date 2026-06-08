import { createContext, useContext } from "react"
import { PreviewViewport } from "../builder.enum.ts"

export interface NavbarMenuContextValue {
  isMenuOpen: boolean
  setIsMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void
  isCompact: boolean
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
