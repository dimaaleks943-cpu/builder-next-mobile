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
import {
  type CraftMixBlendMode,
  DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  resolveCraftVisualEffectsStyle,
} from "./craftVisualEffects.ts"
import { usePreviewViewport } from "../pages/builder/context/PreviewViewportContext.tsx"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import { resolveResponsiveStyle, type ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
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
  style?: ResponsiveStyle
}

export const CraftLinkText = (props: LinkTextProps) => {
  const viewport = usePreviewViewport()
  const responsiveStyle = resolveResponsiveStyle(props.style, viewport)
  const text = props.text ?? "Ссылка"
  const i18nKey = props.i18nKey ?? null
  const collectionField = props.collectionField ?? null
  const href = props.href ?? "http://www.google.com"
  const openInNewTab = props.openInNewTab ?? false
  const fontSize = (responsiveStyle.fontSize as number | undefined) ?? 14
  const fontWeight = (responsiveStyle.fontWeight as "normal" | "bold" | undefined) ?? "normal"
  const textAlign = (responsiveStyle.textAlign as TextAlign | undefined) ?? "left"
  const color = (responsiveStyle.color as string | undefined) ?? COLORS.green300
  const fontFamily = responsiveStyle.fontFamily as string | undefined
  const lineHeight = (responsiveStyle.lineHeight as number | undefined) ?? 20
  const textTransform =
    (responsiveStyle.textTransform as "none" | "uppercase" | "lowercase" | "capitalize" | undefined) ??
    "none"
  const strokeColor = responsiveStyle.strokeColor as string | undefined
  const strokeWidth = (responsiveStyle.strokeWidth as number | undefined) ?? 0
  const isItalic = (responsiveStyle.isItalic as boolean | undefined) ?? false
  const isUnderline = (responsiveStyle.isUnderline as boolean | undefined) ?? false
  const isStrikethrough = (responsiveStyle.isStrikethrough as boolean | undefined) ?? false
  const marginTop = (responsiveStyle.marginTop as number | undefined) ?? 0
  const marginRight = (responsiveStyle.marginRight as number | undefined) ?? 0
  const marginBottom = (responsiveStyle.marginBottom as number | undefined) ?? 0
  const marginLeft = (responsiveStyle.marginLeft as number | undefined) ?? 0
  const paddingTop = (responsiveStyle.paddingTop as number | undefined) ?? 0
  const paddingRight = (responsiveStyle.paddingRight as number | undefined) ?? 0
  const paddingBottom = (responsiveStyle.paddingBottom as number | undefined) ?? 0
  const paddingLeft = (responsiveStyle.paddingLeft as number | undefined) ?? 0
  const backgroundColor = responsiveStyle.backgroundColor as string | undefined
  const width = responsiveStyle.width as string | number | undefined
  const height = responsiveStyle.height as string | number | undefined
  const minWidth = responsiveStyle.minWidth as number | undefined
  const minHeight = responsiveStyle.minHeight as number | undefined
  const maxWidth = responsiveStyle.maxWidth as string | number | undefined
  const maxHeight = responsiveStyle.maxHeight as string | number | undefined
  const overflow = responsiveStyle.overflow as "auto" | "hidden" | "visible" | "scroll" | undefined
  const mixBlendMode =
    (responsiveStyle.mixBlendMode as CraftMixBlendMode | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.mixBlendMode
  const opacityPercent =
    (responsiveStyle.opacityPercent as number | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.opacityPercent
  const outlineStyleMode =
    (responsiveStyle.outlineStyleMode as (typeof DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS)["outlineStyleMode"]) ??
    DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineStyleMode
  const outlineWidth =
    (responsiveStyle.outlineWidth as number | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineWidth
  const outlineOffset =
    (responsiveStyle.outlineOffset as number | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineOffset
  const outlineColor =
    (responsiveStyle.outlineColor as string | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineColor
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const spanRef = useRef<HTMLSpanElement | null>(null)
  const linkRef = useRef<HTMLAnchorElement | null>(null)
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
    width,
    height,
    minWidth: minWidth ?? 20,
    minHeight,
    maxWidth,
    maxHeight,
    overflow,
    outline: "none",
    cursor: collectionField ? "default" : isEditing ? "text" : selected ? "move" : "pointer",
    userSelect: collectionField ? "none" : isEditing ? "text" : "none",
    ...(backgroundColor ? { backgroundColor } : {}),
  }

  return (
    <>
      <a
        ref={linkRef}
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
          ...resolveCraftVisualEffectsStyle({
            mixBlendMode,
            opacityPercent,
            outlineStyleMode,
            outlineWidth,
            outlineOffset,
            outlineColor,
          }),
        }}
      >
        {selected && (
          <InlineSettingsBadge
            ref={badgeRef}
            icon={<span style={{ fontSize: 11 }}>🔗</span>}
            label="Текст-ссылка"
            maxWidth={140}
            showSettingsButton
            anchorElement={linkRef.current}
            usePortal
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
    style: {
      [PreviewViewport.DESKTOP]: {
        fontSize: 14,
        fontWeight: "normal" as const,
        textAlign: "left" as const,
        color: COLORS.green300,
        lineHeight: 20,
        textTransform: "none" as const,
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
        ...DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
      },
    },
  },
}
