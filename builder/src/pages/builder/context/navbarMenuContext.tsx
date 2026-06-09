import { useEditor, useNode } from "@craftjs/core"
import { createContext, useContext, useMemo } from "react"
import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts"
import { getPreviewMaxWidth, PreviewViewport } from "../builder.enum.ts"
import { usePreviewViewport } from "./PreviewViewportContext.tsx"

export type NavbarMenuIconBreakpointValue = PreviewViewport | "none"

export const NAVBAR_MENU_ICON_BREAKPOINT_STEPS_WEB: NavbarMenuIconBreakpointValue[] = [
  PreviewViewport.DESKTOP,
  PreviewViewport.TABLET_LANDSCAPE,
  PreviewViewport.TABLET,
  PreviewViewport.PHONE_LANDSCAPE,
  PreviewViewport.PHONE,
  "none",
]

export const NAVBAR_MENU_ICON_BREAKPOINT_STEPS_RN: NavbarMenuIconBreakpointValue[] = [
  PreviewViewport.TABLET_LANDSCAPE,
  PreviewViewport.TABLET,
  PreviewViewport.PHONE_LANDSCAPE,
  PreviewViewport.PHONE,
  "none",
]

export const DEFAULT_NAVBAR_MENU_ICON_BREAKPOINT: NavbarMenuIconBreakpointValue =
  PreviewViewport.TABLET_LANDSCAPE

export const getNavbarMenuIconBreakpointSteps = (
  isRn: boolean,
): NavbarMenuIconBreakpointValue[] =>
  isRn ? NAVBAR_MENU_ICON_BREAKPOINT_STEPS_RN : NAVBAR_MENU_ICON_BREAKPOINT_STEPS_WEB

export const getNavbarMenuIconBreakpointLabel = (
  value: NavbarMenuIconBreakpointValue,
): string => {
  switch (value) {
    case PreviewViewport.DESKTOP:
      return "Desktop and below"
    case PreviewViewport.TABLET_LANDSCAPE:
      return "Tablet landscape and below"
    case PreviewViewport.TABLET:
      return "Tablet and below"
    case PreviewViewport.PHONE_LANDSCAPE:
      return "Phone landscape and below"
    case PreviewViewport.PHONE:
      return "Phone and below"
    case "none":
      return "Never"
    default:
      return "Tablet and below"
  }
}

export const menuIconBreakpointToSliderIndex = (
  value: NavbarMenuIconBreakpointValue,
  isRn: boolean,
): number => {
  const steps = getNavbarMenuIconBreakpointSteps(isRn)
  const index = steps.indexOf(value)
  if (index >= 0) {
    return index
  }
  const fallbackIndex = steps.indexOf(DEFAULT_NAVBAR_MENU_ICON_BREAKPOINT)
  return fallbackIndex >= 0 ? fallbackIndex : 0
}

export const sliderIndexToMenuIconBreakpoint = (
  index: number,
  isRn: boolean,
): NavbarMenuIconBreakpointValue => {
  const steps = getNavbarMenuIconBreakpointSteps(isRn)
  const clamped = Math.min(Math.max(0, Math.round(index)), steps.length - 1)
  return steps[clamped]
}

export const isNavbarMenuCompact = (
  viewport: PreviewViewport,
  menuIconBreakpoint: NavbarMenuIconBreakpointValue,
): boolean => {
  if (menuIconBreakpoint === "none") {
    return false
  }
  if (menuIconBreakpoint === PreviewViewport.DESKTOP) {
    return true
  }
  return getPreviewMaxWidth(viewport) <= getPreviewMaxWidth(menuIconBreakpoint)
}

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
  menuIconBreakpoint?: NavbarMenuIconBreakpointValue
}

const noopSetIsMenuOpen = () => {}

export const buildNavbarMenuContextValue = (
  props: NavbarMenuProps,
  viewport: PreviewViewport,
): NavbarMenuContextValue => {
  const menuPreview = props.menuPreview ?? "hide"
  const menuIconBreakpoint =
    props.menuIconBreakpoint ?? DEFAULT_NAVBAR_MENU_ICON_BREAKPOINT
  const isCompact = isNavbarMenuCompact(viewport, menuIconBreakpoint)
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
