import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useEditor, useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { InlineSettingsModal } from "../components/InlineSettingsModal.tsx"
import { TextSettingsFields } from "../pages/builder/settingsCraftComponents/TextSettingsFields.tsx"
import { useRightPanelContext } from "../pages/builder/context/RightPanelContext.tsx"
import {
  useReactToInlineSettingsOpenRequest,
  type InlineSettingsViewportAnchor,
} from "../pages/builder/context/CraftInlineSettingsBridgeContext.tsx"
import { useContentListData } from "../pages/builder/context/ContentListDataContext.tsx"
import { COLORS } from "../theme/colors"
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

export interface TextProps {
  text?: string
  i18nKey?: string | null
  collectionField?: string | null
  style?: ResponsiveStyle
}

export const CraftText = (props: TextProps) => {
  const viewport = usePreviewViewport()
  const responsiveStyle = resolveResponsiveStyle(props.style, viewport)
  const text = props.text ?? "Текст"
  const i18nKey = props.i18nKey ?? null
  const collectionField = props.collectionField ?? null
  const lineHeight = (responsiveStyle.lineHeight as number | undefined) ?? 20
  const strokeColor = responsiveStyle.strokeColor as string | undefined
  const strokeWidth = (responsiveStyle.strokeWidth as number | undefined) ?? 0
  const isItalic = (responsiveStyle.isItalic as boolean | undefined) ?? false
  const isUnderline = (responsiveStyle.isUnderline as boolean | undefined) ?? false
  const isStrikethrough = (responsiveStyle.isStrikethrough as boolean | undefined) ?? false
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
  const outerWrapperRef = useRef<HTMLSpanElement | null>(null)
  const [isTextModalOpen, setIsTextModalOpen] = useState(false)
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

  const openTextInlineSettings = useCallback(
    (viewportAnchor: InlineSettingsViewportAnchor | null) => {
      if (viewportAnchor) {
        setModalPosition({
          top: viewportAnchor.top,
          left: viewportAnchor.left,
        })
      } else if (outerWrapperRef.current) {
        const rect = outerWrapperRef.current.getBoundingClientRect()
        setModalPosition({ top: rect.bottom + 6, left: rect.left })
      }
      setIsTextModalOpen(true)
    },
    [],
  )

  useReactToInlineSettingsOpenRequest(id, openTextInlineSettings)

  const handleShowAllSettings = () => {
    rightPanelContext?.setTabIndex(1)
    setIsTextModalOpen(false)
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
    ...responsiveStyle,
    display: "inline-block",
    //TODO сохранять значение в px сразу
    lineHeight: typeof lineHeight === "number" ? `${lineHeight}px` : undefined,
    //TODO переписать на прямую привязку к fontStyle
    fontStyle: isItalic ? "italic" : "normal",
    textDecoration: [
      isUnderline ? "underline" : "",
      isStrikethrough ? "line-through" : "",
    ]
      .filter(Boolean)
      .join(" ") || "none",
    WebkitTextStrokeWidth: strokeWidth ? strokeWidth : undefined,
    WebkitTextStrokeColor: strokeColor,

    border: "1px solid transparent",
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
  }

  return (
    <>
      <span ref={outerWrapperRef} style={outerWrapperStyle}>
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
      <InlineSettingsModal
        open={isTextModalOpen}
        title="Настройки текста"
        top={modalPosition.top}
        left={modalPosition.left}
        onClose={() => setIsTextModalOpen(false)}
        onShowAllSettings={handleShowAllSettings}
      >
        <TextSettingsFields />
      </InlineSettingsModal>
    </>
  )
};

;(CraftText as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.Text,
  props: {
    text: "Текст",
    i18nKey: null,
    collectionField: null,
    style: {
      [PreviewViewport.DESKTOP]: {
        fontSize: 14,
        fontWeight: "normal" as const,
        textAlign: "left" as const,
        color: COLORS.gray700,
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

