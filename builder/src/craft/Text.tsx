import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useEditor, useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { COLORS } from "../theme/colors"
import { useRightPanelContext } from "../pages/builder/RightPanelContext"
import { useInsideContentListCell } from "./ContentListCellContext"
import { useContentListData } from "./ContentListDataContext"
import { InlineSettingsModal } from "./InlineSettingsModal"
import { InlineSettingsBadge } from "./InlineSettingsBadge"
import { TextSettingsFields } from "../pages/builder/settingsCraftComponents"

export type TextAlign = "left" | "center" | "right"

export interface TextProps {
  text?: string
  collectionField?: string | null
  fontSize?: number
  fontWeight?: "normal" | "bold"
  textAlign?: TextAlign
  color?: string
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
}

export const Text = ({
  text = "Текст",
  collectionField = null,
  fontSize = 14,
  fontWeight = "normal",
  textAlign = "left",
  color = COLORS.gray800,
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
  paddingTop = 0,
  paddingRight = 0,
  paddingBottom = 0,
  paddingLeft = 0,
}: TextProps) => {
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

  // Вычисляем отображаемый текст: либо значение поля коллекции, либо статический текст
  const displayText = useMemo(() => {
    if (collectionField && contentListData?.itemData) {
      const fieldValue = contentListData.itemData[collectionField]
      if (fieldValue !== null && fieldValue !== undefined) {
        // Преобразуем значение в строку
        if (typeof fieldValue === "object") {
          return JSON.stringify(fieldValue)
        }
        return String(fieldValue)
      }
    }
    return text
  }, [collectionField, contentListData?.itemData, text])

  /**
   / Синхронизируем локальное состояние с пропсами, когда не редактируем
   */
  useEffect(() => {
    if (!isEditing) {
      setDraft(displayText)
      if (spanRef.current && !collectionField) {
        // Обновляем textContent только если не выбрано поле коллекции
        // (иначе текст управляется через children)
        spanRef.current.textContent = displayText
      }
    }
  }, [displayText, isEditing, collectionField])

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
    actions.setProp(id, (props: any) => {
      props.text = value
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
    cursor: collectionField ? "default" : isEditing ? "text" : selected ? "move" : "default",
    userSelect: collectionField ? "none" : isEditing ? "text" : "none",
  }

  const showSettingsButton = isInsideContentList && selected

  return (
    <>
      <span
        style={
          selected
            ? { position: "relative" as const, display: "inline-block", zIndex: 1 }
            : undefined
        }
      >
        {selected && (
          <InlineSettingsBadge
            ref={badgeRef}
            icon={<span style={{ fontSize: 11 }}>T</span>}
            label={displayText || "Текст"}
            maxWidth={120}
            showSettingsButton={showSettingsButton}
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

(Text as any).craft = {
  props: {
    text: "Текст",
    collectionField: null,
    fontSize: 14,
    fontWeight: "normal" as const,
    textAlign: "left" as const,
    color: COLORS.gray800,
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

