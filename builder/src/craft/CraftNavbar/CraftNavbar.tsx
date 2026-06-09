import { useNode } from "@craftjs/core"
import type { CSSProperties, ReactNode } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CRAFT_DISPLAY_NAME } from "../craftDisplayNames.ts"
import type { ResponsiveStyle } from "../../pages/builder/responsiveStyle.ts"
import { useCraftNodeStyle } from "../../pages/builder/hooks/useCraftNodeStyle.ts"
import { PreviewViewport } from "../../pages/builder/builder.enum.ts"
import { usePreviewViewport } from "../../pages/builder/context/PreviewViewportContext.tsx"
import { useRightPanelContext } from "../../pages/builder/context/RightPanelContext.tsx"
import {
  useCraftInlineSettingsBridge,
  useReactToInlineSettingsOpenRequest,
  type InlineSettingsViewportAnchor,
} from "../../pages/builder/context/CraftInlineSettingsBridgeContext.tsx"
import {
  buildNavbarMenuContextValue,
  NavbarMenuContext,
  type NavbarEasingValue,
  type NavbarMenuIconBreakpointValue,
  type NavbarMenuPreviewValue,
  type NavbarMenuTypeValue,
} from "../../pages/builder/context/navbarMenuContext.tsx"
import { NAVBAR_ROOT_DATA_ATTR } from "../../pages/builder/utils/navbarAnchorScroll.ts"
import { NavbarSettingsFields } from "../../pages/builder/settingsCraftComponents/NavbarSettingsFields.tsx"
import { InlineSettingsModal } from "../../components/InlineSettingsModal/InlineSettingsModal.tsx"

export interface Props {
  children?: ReactNode
  style?: ResponsiveStyle
  styleClassIds?: string[]
  menuPreview?: NavbarMenuPreviewValue
  menuType?: NavbarMenuTypeValue
  easingOpen?: NavbarEasingValue
  easingClose?: NavbarEasingValue
  durationMs?: number
  menuIconBreakpoint?: NavbarMenuIconBreakpointValue
  menuFillsPageHeight?: boolean
  disableScrollOffsetWhenFixed?: boolean
}

export const CraftNavbar = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const viewport = usePreviewViewport()

  const navbarRef = useRef<HTMLDivElement | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const rightPanelContext = useRightPanelContext()

  const {
    connectors: { connect, drag },
    selected,
    id,
  } = useNode((node) => ({
    selected: node.events.selected,
    id: node.id,
  }))

  const openNavbarInlineSettings = useCallback(
    (viewportAnchor: InlineSettingsViewportAnchor | null) => {
      if (viewportAnchor) {
        setModalPosition({
          top: viewportAnchor.top,
          left: viewportAnchor.left,
        })
      } else if (navbarRef.current) {
        const rect = navbarRef.current.getBoundingClientRect()
        setModalPosition({ top: rect.bottom + 6, left: rect.left })
      }
      setIsSettingsOpen(true)
    },
    [],
  )

  const { clearInlineSettingsRequest } = useCraftInlineSettingsBridge()

  const closeNavbarInlineSettings = useCallback(() => {
    setIsSettingsOpen(false)
    clearInlineSettingsRequest()
  }, [clearInlineSettingsRequest])

  useReactToInlineSettingsOpenRequest(id, openNavbarInlineSettings)

  useEffect(() => {
    if (!selected && isSettingsOpen) {
      closeNavbarInlineSettings()
    }
  }, [selected, isSettingsOpen, closeNavbarInlineSettings])

  const handleShowAllSettings = () => {
    rightPanelContext?.setTabIndex(1)
    closeNavbarInlineSettings()
  }

  const menuContextValue = useMemo(
    () => buildNavbarMenuContextValue(props, viewport),
    [
      props.menuPreview,
      props.menuType,
      props.easingOpen,
      props.easingClose,
      props.durationMs,
      props.menuIconBreakpoint,
      props.menuFillsPageHeight,
      viewport,
    ],
  )

  return (
    <>
      <NavbarMenuContext.Provider value={menuContextValue}>
        <div
          ref={(ref) => {
            navbarRef.current = ref
            if (!ref) return
            connect(drag(ref))
          }}
          {...{ [NAVBAR_ROOT_DATA_ATTR]: id }}
          style={responsiveStyle as CSSProperties}
        >
          {props.children}
        </div>
      </NavbarMenuContext.Provider>
      <InlineSettingsModal
        open={isSettingsOpen}
        title="Navbar settings"
        top={modalPosition.top}
        left={modalPosition.left}
        onClose={closeNavbarInlineSettings}
        onShowAllSettings={handleShowAllSettings}
      >
        <NavbarSettingsFields nodeId={id} />
      </InlineSettingsModal>
    </>
  )
};

(CraftNavbar as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.Navbar,
  props: {
    menuPreview: "hide" as const,
    menuType: "dropDown" as const,
    easingOpen: "ease" as const,
    easingClose: "ease" as const,
    durationMs: 400,
    menuIconBreakpoint: PreviewViewport.TABLET_LANDSCAPE,
    menuFillsPageHeight: false,
    disableScrollOffsetWhenFixed: false,
    style: {
      [PreviewViewport.DESKTOP]: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "16px",
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
      },
    },
  },
  rules: {
    canMoveIn: (nodes: { data: { type: { resolvedName?: string } } }[]) =>
      nodes.every((n) => {
        const resolvedName = n.data?.type?.resolvedName

        return (
          resolvedName === "NavbarMenuButton" ||
          resolvedName === "NavbarLinks" ||
          resolvedName === "NavbarMenu"
        )
      }),
  },
  isCanvas: true,
}
