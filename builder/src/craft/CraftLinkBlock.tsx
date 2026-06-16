import { useState, useRef, useCallback } from "react"
import { useNode } from "@craftjs/core"
import type { CSSProperties, ReactNode } from "react"
import { LinkTextSettingsFields } from "../pages/builder/settingsCraftComponents/LinkTextSettingsFields/LinkTextSettingsFields.tsx"
import { useRightPanelContext } from "../pages/builder/context/RightPanelContext.tsx"
import {
  useCraftInlineSettingsBridge,
  useReactToInlineSettingsOpenRequest,
  type InlineSettingsViewportAnchor,
} from "../pages/builder/context/CraftInlineSettingsBridgeContext.tsx"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import { useCraftNodeStyle } from "../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import { InlineSettingsModal } from "../components/InlineSettingsModal/InlineSettingsModal.tsx"

const LINK_CHILD_RESOLVED_NAMES = new Set(["LinkText", "LinkBlock"])

export interface CraftLinkBlockProps {
  htmlId?: string
  children?: ReactNode
  href?: string
  linkMode?: "url" | "page" | "collectionItemPage"
  collectionItemLinkTarget?: "none" | "template"
  collectionItemTemplatePageId?: string | null
  openInNewTab?: boolean
  styleClassIds?: string[]
  style?: ResponsiveStyle
}

export const CraftLinkBlock = (props: CraftLinkBlockProps) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const href = props.href ?? "http://www.google.com"
  const openInNewTab = props.openInNewTab ?? false
  const anchorRef = useRef<HTMLAnchorElement | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const rightPanelContext = useRightPanelContext()

  const { connectors: { connect, drag }, id} =
    useNode((node) => ({ id: node.id }))

  const { clearInlineSettingsRequest } = useCraftInlineSettingsBridge()

  const openLinkInlineSettings = useCallback(
    (viewportAnchor: InlineSettingsViewportAnchor | null) => {
      if (viewportAnchor) {
        setModalPosition({
          top: viewportAnchor.top,
          left: viewportAnchor.left,
        })
      } else if (anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect()
        setModalPosition({ top: rect.bottom + 6, left: rect.left })
      }
      setIsSettingsOpen(true)
    },
    [],
  )

  const closeLinkInlineSettings = useCallback(() => {
    setIsSettingsOpen(false)
    clearInlineSettingsRequest()
  }, [clearInlineSettingsRequest])

  useReactToInlineSettingsOpenRequest(id, openLinkInlineSettings)

  const handleShowAllSettings = () => {
    rightPanelContext?.setTabIndex(1)
    closeLinkInlineSettings()
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
  }

  return (
    <>
      <a
        ref={(ref) => {
          anchorRef.current = ref
          if (!ref) return
          connect(drag(ref))
        }}
        {...(props.htmlId ? { id: props.htmlId } : {})}
        href={href}
        target={openInNewTab ? "_blank" : "_self"}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        onClick={handleLinkClick}
        onClickCapture={handleLinkClick}
        style={{
          textDecoration: "none",
          color: "inherit",
          position: "relative",
          display: "block",
          boxSizing: "border-box",
          ...(responsiveStyle as CSSProperties),
        }}
      >
        {props.children}
      </a>
      <InlineSettingsModal
        open={isSettingsOpen}
        title="Настройки ссылки"
        top={modalPosition.top}
        left={modalPosition.left}
        onClose={closeLinkInlineSettings}
        onShowAllSettings={handleShowAllSettings}
      >
        <LinkTextSettingsFields />
      </InlineSettingsModal>
    </>
  )
};

(CraftLinkBlock as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.LinkBlock,
  props: {
    href: "http://www.google.com",
    linkMode: "url" as const,
    collectionItemLinkTarget: "none" as const,
    collectionItemTemplatePageId: null,
    openInNewTab: false,
    style: {
      [PreviewViewport.DESKTOP]: {
        minWidth: "75px",
        minHeight: "75px",
        display: "block",
        cursor: "pointer",
      },
    },
  },
  rules: {
    canMoveIn: (nodes: { data: { type: { resolvedName?: string } } }[]) =>
      nodes.every(
        (n) => !LINK_CHILD_RESOLVED_NAMES.has(n.data?.type?.resolvedName ?? ""),
      ),
  },
  isCanvas: true,
}
