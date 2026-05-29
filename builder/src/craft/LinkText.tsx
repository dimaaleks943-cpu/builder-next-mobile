import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useEditor, useNode } from "@craftjs/core"
import { LinkTextSettingsFields } from "../pages/builder/settingsCraftComponents/LinkTextSettingsFields.tsx"
import { useRightPanelContext } from "../pages/builder/context/RightPanelContext.tsx"
import {
  useCraftInlineSettingsBridge,
  useReactToInlineSettingsOpenRequest,
  type InlineSettingsViewportAnchor,
} from "../pages/builder/context/CraftInlineSettingsBridgeContext.tsx"
import { COLORS } from "../theme/colors"
import { useContentListData } from "../pages/builder/context/ContentListDataContext.tsx"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import { useCraftNodeStyle } from "../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import { useBuilderModeContext } from "../pages/builder/context/BuilderModeContext.tsx"
import {
  commitCraftTextDraft,
  getCraftTextDisplayText,
} from "../utils/craftLocalizedText.ts"
import { InlineSettingsModal } from "../components/InlineSettingsModal/InlineSettingsModal.tsx";

export interface LinkTextProps {
  text?: string
  i18nKey?: string | null
  collectionField?: string | null
  href?: string
  linkMode?: "url" | "page" | "collectionItemPage"
  collectionItemLinkTarget?: "none" | "template"
  collectionItemTemplatePageId?: string | null
  openInNewTab?: boolean
  styleClassIds?: string[]
  style?: ResponsiveStyle
}

export const CraftLinkText = (props: LinkTextProps) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const text = props.text ?? "Ссылка"
  const i18nKey = props.i18nKey ?? null
  const collectionField = props.collectionField ?? null
  const href = props.href ?? "http://www.google.com"
  const openInNewTab = props.openInNewTab ?? false
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const spanRef = useRef<HTMLSpanElement | null>(null)
  const anchorRef = useRef<HTMLAnchorElement | null>(null)
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

  const { actions } = useEditor()
  const contentListData = useContentListData()
  const modeContext = useBuilderModeContext()

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

  const { clearInlineSettingsRequest } = useCraftInlineSettingsBridge()

  const closeLinkInlineSettings = useCallback(() => {
    setIsSettingsOpen(false)
    clearInlineSettingsRequest()
  }, [clearInlineSettingsRequest])

  useReactToInlineSettingsOpenRequest(id, openLinkInlineSettings)

  const handleShowAllSettings = () => {
    rightPanelContext?.setTabIndex(1)
    closeLinkInlineSettings()
  }

  const displayText = useMemo(
    () =>
      getCraftTextDisplayText({
        text,
        collectionField,
        itemData: contentListData?.itemData,
        i18nKey,
        modeContext,
      }),
    [collectionField, contentListData?.itemData, text, modeContext, i18nKey],
  )

  useEffect(() => {
    if (!isEditing) {
      setDraft(displayText)
      if (spanRef.current) {
        spanRef.current.textContent = displayText
      }
    }
  }, [displayText, isEditing])

  const handleDoubleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    e.preventDefault()
    if (!selected) return
    if (collectionField) return
    setIsEditing(true)
  }

  const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
    const value = e.currentTarget.textContent ?? ""
    setDraft(value)
  }

  const saveDraft = () => {
    if (!id) return
    const value = spanRef.current?.textContent ?? draft
    commitCraftTextDraft({
      nodeId: id,
      value,
      i18nKey,
      collectionField,
      modeContext,
      setProp: actions.setProp,
    })
    setIsEditing(false)
  }

  const handleBlur = () => {
    if (isEditing) {
      saveDraft()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      saveDraft()
    } else if (e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      setDraft(displayText)
      setIsEditing(false)
    }
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (selected) {
      e.preventDefault()
    }
  }

  return (
    <>
    <a
      ref={(ref) => {
        anchorRef.current = ref
      }}
      href={href}
      target={openInNewTab ? "_blank" : "_self"}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      onClick={handleLinkClick}
      style={{
        textDecoration: "none",
        color: "inherit",
        position: "relative",
        display: "inline-block",
        maxWidth: "max-content",
      }}
    >
      <span
        ref={(ref) => {
          spanRef.current = ref
          if (!ref) return
          if (isEditing && !collectionField) {
            connect(ref)
          } else {
            connect(drag(ref))
          }
        }}
        contentEditable={isEditing && !collectionField}
        suppressContentEditableWarning
        onDoubleClick={handleDoubleClick}
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{...responsiveStyle}}
      >
        {displayText}
      </span>
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

(CraftLinkText as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.LinkText,
  props: {
    text: "Ссылка",
    i18nKey: null,
    collectionField: null,
    href: "http://www.google.com",
    linkMode: "url" as const,
    collectionItemLinkTarget: "none" as const,
    collectionItemTemplatePageId: null,
    openInNewTab: false,
    style: {
      [PreviewViewport.DESKTOP]: {
        fontSize: "14px",
        lineHeight: "20px",
        fontWeight: "normal" as const,
        color: COLORS.green300,

        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
      },
    },
  },
}
