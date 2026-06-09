import { useEditor, useNode } from "@craftjs/core"
import { createContext, useContext, useMemo } from "react"
import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts"
import { PreviewViewport } from "../builder.enum.ts"
import { usePreviewViewport } from "./PreviewViewportContext.tsx"

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

interface NavbarMenuProps {
  menuPreview?: NavbarMenuPreviewValue
  menuType?: NavbarMenuTypeValue
  easingOpen?: NavbarEasingValue
  easingClose?: NavbarEasingValue
  durationMs?: number
}

const noopSetIsMenuOpen = () => {}

export const buildNavbarMenuContextValue = (
  props: NavbarMenuProps,
  viewport: PreviewViewport,
): NavbarMenuContextValue => {
  const menuPreview = props.menuPreview ?? "hide"
  const isCompact = isCompactPreviewViewport(viewport)
  const isMenuOpen = isCompact && menuPreview === "show"

  return {
    isMenuOpen,
    setIsMenuOpen: noopSetIsMenuOpen,
    isCompact,
    menuPreview,
    menuType: props.menuType ?? "dropDown",
    easingOpen: props.easingOpen ?? "ease",
    easingClose: props.easingClose ?? "ease",
    durationMs: props.durationMs ?? 400,
  }
}

const useNavbarMenuFromAncestor = (): NavbarMenuContextValue => {
  const { id } = useNode()
  const viewport = usePreviewViewport()

  const { navbarMenuProps } = useEditor((_, query): { navbarMenuProps: NavbarMenuProps | null } => {
    try {
      const ancestors = query.node(id).ancestors(true) as string[]
      for (const ancestorId of ancestors) {
        const ancestorNode = query.node(ancestorId).get()
        if (resolveNodeDisplayName(ancestorNode) === CRAFT_DISPLAY_NAME.Navbar) {
          return {
            navbarMenuProps: ancestorNode.data.props as NavbarMenuProps,
          }
        }
      }
    } catch {
      // Craft query может быть недоступен при раннем mount или во время drag
    }
    return { navbarMenuProps: null }
  })

  return useMemo(
    () => buildNavbarMenuContextValue(navbarMenuProps ?? {}, viewport),
    [navbarMenuProps, viewport],
  )
}

export const useNavbarMenu = (): NavbarMenuContextValue => {
  const context = useContext(NavbarMenuContext)
  const fromAncestor = useNavbarMenuFromAncestor()
  return context ?? fromAncestor
}

export const isCompactPreviewViewport = (viewport: PreviewViewport): boolean =>
  viewport !== PreviewViewport.DESKTOP
