import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useEditor, useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { COLORS } from "../theme/colors"
import { useRightPanelContext } from "../pages/builder/context/RightPanelContext.tsx"
import { useInsideContentListCell } from "../pages/builder/context/ContentListCellContext.tsx"
import { useContentListData } from "../pages/builder/context/ContentListDataContext.tsx"
import { InlineSettingsModal } from "../components/InlineSettingsModal.tsx"
import { InlineSettingsBadge } from "../components/InlineSettingsBadge.tsx"
import { TextSettingsFields } from "../pages/builder/settingsCraftComponents"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import {
  DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  resolveCraftVisualEffectsStyle,
  type CraftVisualEffectsProps,
} from "./craftVisualEffects.ts"
import { usePreviewViewport } from "../pages/builder/context/PreviewViewportContext.tsx"
import { resolveResponsiveStyle, type ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import { useBuilderModeContext } from "../pages/builder/context/BuilderModeContext.tsx"
import {
  commitCraftTextDraft,
  getCraftTextDisplayText,
} from "../utils/craftLocalizedText.ts"

export type TextAlign = "left" | "center" | "right"

export interface TextProps extends CraftVisualEffectsProps {
  text?: string
  i18nKey?: string | null
  collectionField?: string | null
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
  backgroundColor?: string
  width?: string | number
  height?: string | number
  minWidth?: number
  minHeight?: number
  maxWidth?: string | number
  maxHeight?: string | number
  overflow?: "auto" | "hidden" | "visible" | "scroll"
  /** Зарезервировано под будущий UI; в рендере пока не используется */
  backgroundClip?: string
  style?: ResponsiveStyle
}

export const CraftText = (props: TextProps) => {
  const viewport = usePreviewViewport()
  const responsiveStyle = resolveResponsiveStyle(props.style, viewport)
  const text = props.text ?? "Текст"
  const i18nKey = props.i18nKey ?? null
  const collectionField = props.collectionField ?? null
  const fontSize = (responsiveStyle.fontSize as number | undefined) ?? props.fontSize ?? 14
  const fontWeight = (responsiveStyle.fontWeight as "normal" | "bold" | undefined) ?? props.fontWeight ?? "normal"
  const textAlign = (responsiveStyle.textAlign as TextAlign | undefined) ?? props.textAlign ?? "left"
  const color = (responsiveStyle.color as string | undefined) ?? props.color ?? COLORS.gray800
  const fontFamily = (responsiveStyle.fontFamily as string | undefined) ?? props.fontFamily
  const lineHeight = (responsiveStyle.lineHeight as number | undefined) ?? props.lineHeight ?? 20
  const textTransform =
    (responsiveStyle.textTransform as "none" | "uppercase" | "lowercase" | "capitalize" | undefined) ??
    props.textTransform ??
    "none"
  const strokeColor = (responsiveStyle.strokeColor as string | undefined) ?? props.strokeColor
  const strokeWidth = (responsiveStyle.strokeWidth as number | undefined) ?? props.strokeWidth ?? 0
  const isItalic = (responsiveStyle.isItalic as boolean | undefined) ?? props.isItalic ?? false
  const isUnderline = (responsiveStyle.isUnderline as boolean | undefined) ?? props.isUnderline ?? false
  const isStrikethrough =
    (responsiveStyle.isStrikethrough as boolean | undefined) ?? props.isStrikethrough ?? false
  const marginTop = (responsiveStyle.marginTop as number | undefined) ?? props.marginTop ?? 0
  const marginRight = (responsiveStyle.marginRight as number | undefined) ?? props.marginRight ?? 0
  const marginBottom = (responsiveStyle.marginBottom as number | undefined) ?? props.marginBottom ?? 0
  const marginLeft = (responsiveStyle.marginLeft as number | undefined) ?? props.marginLeft ?? 0
  const paddingTop = (responsiveStyle.paddingTop as number | undefined) ?? props.paddingTop ?? 0
  const paddingRight = (responsiveStyle.paddingRight as number | undefined) ?? props.paddingRight ?? 0
  const paddingBottom = (responsiveStyle.paddingBottom as number | undefined) ?? props.paddingBottom ?? 0
  const paddingLeft = (responsiveStyle.paddingLeft as number | undefined) ?? props.paddingLeft ?? 0
  const backgroundColor = (responsiveStyle.backgroundColor as string | undefined) ?? props.backgroundColor
  const width = (responsiveStyle.width as string | number | undefined) ?? props.width
  const height = (responsiveStyle.height as string | number | undefined) ?? props.height
  const minWidth = (responsiveStyle.minWidth as number | undefined) ?? props.minWidth
  const minHeight = (responsiveStyle.minHeight as number | undefined) ?? props.minHeight
  const maxWidth = (responsiveStyle.maxWidth as string | number | undefined) ?? props.maxWidth
  const maxHeight = (responsiveStyle.maxHeight as string | number | undefined) ?? props.maxHeight
  const overflow = (responsiveStyle.overflow as TextProps["overflow"] | undefined) ?? props.overflow
  const mixBlendMode = (responsiveStyle.mixBlendMode as string | undefined) ?? props.mixBlendMode ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.mixBlendMode
  const opacityPercent = (responsiveStyle.opacityPercent as number | undefined) ?? props.opacityPercent ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.opacityPercent
  const outlineStyleMode = (responsiveStyle.outlineStyleMode as any) ?? props.outlineStyleMode ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineStyleMode
  const outlineWidth = (responsiveStyle.outlineWidth as number | undefined) ?? props.outlineWidth ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineWidth
  const outlineOffset = (responsiveStyle.outlineOffset as number | undefined) ?? props.outlineOffset ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineOffset
  const outlineColor = (responsiveStyle.outlineColor as string | undefined) ?? props.outlineColor ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineColor
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const [isTextModalOpen, setIsTextModalOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const spanRef = useRef<HTMLSpanElement | null>(null)

  // DOM-элемент бирки Text (используем для позиционирования модалки)
  const badgeRef = useRef<HTMLDivElement | null>(null)

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
  const isInsideContentList = useInsideContentListCell()
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

  /**
   / Синхронизируем локальное состояние с пропсами, когда не редактируем
   */
  useEffect(() => {
    if (!isEditing) {
      setDraft(displayText)
      if (spanRef.current) {
        spanRef.current.textContent = displayText
      }
    }
  }, [displayText, isEditing])


  const openTextModal = useCallback((e?: React.MouseEvent | React.PointerEvent | Event) => {
    if (e && "stopPropagation" in e) {
      e.stopPropagation()
      e.preventDefault()
    }
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect()
      setModalPosition({
        top: rect.bottom + 4,
        left: rect.left,
      })
    }
    // Предотвращаем выделение родительской ячейки
    if (id) {
      actions.selectNode(id)
    }
    setIsTextModalOpen(true)
  }, [id, actions])

  const handleShowAllSettings = () => {
    rightPanelContext?.setTabIndex(1)
    setIsTextModalOpen(false)
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    if (!selected) return
    // Не разрешаем редактирование если выбрано поле коллекции
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

  /**
   / Сохраняем изменения при клике на Enter, отменяем при клике на Escape, работает в режиме радктирования
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      saveDraft()
    } else if (e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      setDraft(text)
      setIsEditing(false)
    }
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
      isUnderline ? "underline" : "",
      isStrikethrough ? "line-through" : "",
    ]
      .filter(Boolean)
      .join(" ") || "none",
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
    cursor: collectionField ? "default" : isEditing ? "text" : selected ? "move" : "default",
    userSelect: collectionField ? "none" : isEditing ? "text" : "none",
    ...(backgroundColor ? { backgroundColor } : {}),
  }

  const outerWrapperStyle: CSSProperties = {
    display: "inline-block",
    ...resolveCraftVisualEffectsStyle({
      mixBlendMode,
      opacityPercent,
      outlineStyleMode,
      outlineWidth,
      outlineOffset,
      outlineColor,
    }),
    ...(selected ? { position: "relative" as const, zIndex: 1 } : {}),
  }

  const showSettingsButton = isInsideContentList && selected

  return (
    <>
      <span style={outerWrapperStyle}>
        {selected && (
          <InlineSettingsBadge
            ref={badgeRef}
            icon={<span style={{ fontSize: 11 }}>T</span>}
            label="Текст"
            maxWidth={120}
            showSettingsButton={showSettingsButton}
            anchorElement={spanRef.current}
            usePortal
            onSettingsClick={
              showSettingsButton ? () => openTextModal() : undefined
            }
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
      </span>
      {showSettingsButton && isTextModalOpen && (
        <InlineSettingsModal
          open={showSettingsButton && isTextModalOpen}
          title="Настройки текста"
          top={modalPosition.top}
          left={modalPosition.left}
          onClose={() => setIsTextModalOpen(false)}
          onShowAllSettings={handleShowAllSettings}
        >
          <TextSettingsFields />
        </InlineSettingsModal>
      )}
    </>
  )
};

;(CraftText as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.Text,
  props: {
    text: "Текст",
    i18nKey: null,
    collectionField: null,
    fontSize: 14,
    fontWeight: "normal" as const,
    textAlign: "left" as const,
    color: COLORS.gray700,
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
    backgroundColor: undefined,
    width: undefined,
    height: undefined,
    minWidth: undefined,
    minHeight: undefined,
    maxWidth: undefined,
    maxHeight: undefined,
    overflow: undefined,
    backgroundClip: undefined,
    ...DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  },
}

