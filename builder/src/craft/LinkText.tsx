import { useState, useEffect, useRef, useMemo } from "react"
import { useEditor, useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { COLORS } from "../theme/colors"
import { InlineSettingsBadge } from "../components/InlineSettingsBadge.tsx"
import { InlineSettingsModal } from "../components/InlineSettingsModal.tsx"
import { useRightPanelContext } from "../pages/builder/context/RightPanelContext.tsx"
import { useContentListData } from "../pages/builder/context/ContentListDataContext.tsx"
import { LinkTextSettingsFields } from "../pages/builder/settingsCraftComponents"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import { useBuilderModeContext } from "../pages/builder/context/BuilderModeContext.tsx"
import {
  commitCraftTextDraft,
  getCraftTextDisplayText,
} from "../utils/craftLocalizedText.ts"

export type TextAlign = "left" | "center" | "right"

export interface LinkTextProps {
  text?: string
  i18nKey?: string | null
  collectionField?: string | null
  href?: string
  linkMode?: "url" | "page" | "collectionItemPage"
  collectionItemLinkTarget?: "none" | "template"
  collectionItemTemplatePageId?: string | null
  openInNewTab?: boolean
  fontSize?: number
  fontWeight?: "normal" | "bold"
  textAlign?: TextAlign
  color?: string
  fontFamily?: string
  lineHeight?: number
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize"
  strokeColor?: string
  strokeWidth?: number
  isItalic?: boolean
  isUnderline?: boolean
  isStrikethrough?: boolean
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
}

export const CraftLinkText = ({
  text = "Ссылка",
  i18nKey = null,
  collectionField = null,
  href = "http://www.google.com",
  openInNewTab = false,
  fontSize = 14,
  fontWeight = "normal",
  textAlign = "left",
  color = COLORS.green300,
  fontFamily,
  lineHeight = 20,
  textTransform = "none",
  strokeColor,
  strokeWidth = 0,
  isItalic = false,
  isUnderline = false,
  isStrikethrough = false,
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
  paddingTop = 0,
  paddingRight = 0,
  paddingBottom = 0,
  paddingLeft = 0,
}: LinkTextProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const spanRef = useRef<HTMLSpanElement | null>(null)
  const badgeRef = useRef<HTMLDivElement | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })

  const {
    connectors: { connect, drag },
    selected,
    id,
  } = useNode((node) => ({
    selected: node.events.selected,
    id: node.id,
  }))

  const { actions } = useEditor()
  const rightPanelContext = useRightPanelContext()
  const contentListData = useContentListData()
  const modeContext = useBuilderModeContext()

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

  const openSettingsModal = (event?: React.MouseEvent | React.PointerEvent) => {
    if (event && "stopPropagation" in event) {
      event.stopPropagation()
      event.preventDefault()
    }
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect()
      setModalPosition({
        top: rect.bottom + 4,
        left: rect.left,
      })
    }
    if (id) {
      actions.selectNode(id)
    }
    setIsSettingsOpen(true)
  }

  const handleShowAllSettings = () => {
    rightPanelContext?.setTabIndex(1)
    setIsSettingsOpen(false)
  }

  const style: CSSProperties = {
    display: "inline-block",
    fontSize,
    fontWeight,
    textAlign,
    color,
    fontFamily,
    lineHeight: typeof lineHeight === "number" ? `${lineHeight}px` : undefined,
    textTransform,
    fontStyle: isItalic ? "italic" : "normal",
    textDecoration: [
      "underline",
      isStrikethrough ? "line-through" : "",
      isUnderline ? "underline" : "",
    ]
      .filter(Boolean)
      .join(" "),
    WebkitTextStrokeWidth: strokeWidth ? strokeWidth : undefined,
    WebkitTextStrokeColor: strokeColor,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    borderRadius: 2,
    border: selected ? `2px solid ${COLORS.purple400}` : "1px solid transparent",
    boxSizing: "border-box",
    minWidth: 20,
    outline: "none",
    cursor: collectionField ? "default" : isEditing ? "text" : selected ? "move" : "pointer",
    userSelect: collectionField ? "none" : isEditing ? "text" : "none",
  }

  return (
    <>
      <a
        href={href}
        target={openInNewTab ? "_blank" : "_self"}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        onClick={handleLinkClick}
        style={{
          textDecoration: "none",
          color: "inherit",
          position: "relative",
          display: "inline-block",
        }}
      >
        {selected && (
          <InlineSettingsBadge
            ref={badgeRef}
            icon={<span style={{ fontSize: 11 }}>🔗</span>}
            label="Текст-ссылка"
            maxWidth={140}
            showSettingsButton
            onSettingsClick={openSettingsModal}
          />
        )}
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
          style={style}
        >
          {displayText}
        </span>
      </a>
      <InlineSettingsModal
        open={selected && isSettingsOpen}
        title="Настройки ссылки"
        top={modalPosition.top}
        left={modalPosition.left}
        onClose={() => setIsSettingsOpen(false)}
        onShowAllSettings={handleShowAllSettings}
      >
        <LinkTextSettingsFields/>
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
    fontSize: 14,
    fontWeight: "normal" as const,
    textAlign: "left" as const,
    color: COLORS.green300,
    fontFamily: undefined,
    lineHeight: 20,
    textTransform: "none" as const,
    strokeColor: undefined,
    strokeWidth: 0,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  },
}
