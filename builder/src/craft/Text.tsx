import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useEditor, useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { COLORS } from "../theme/colors"
import { useRightPanelContext } from "../pages/builder/RightPanelContext"
import { useInsideContentListCell } from "./ContentListCellContext"
import { useContentListData } from "./ContentListDataContext"
import { useCollectionsContext } from "../pages/builder/CollectionsContext"
import { InlineSettingsModal } from "./InlineSettingsModal"
import { InlineSettingsBadge } from "./InlineSettingsBadge"

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
  // Последнее выбранное поле коллекции, чтобы можно было вернуться к нему
  // после временного переключения в режим Manual.
  const [savedCollectionField, setSavedCollectionField] = useState<string | null>(
    collectionField,
  )
  const [isTextModalOpen, setIsTextModalOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const spanRef = useRef<HTMLSpanElement | null>(null)

  // Режим: "manual" для ручного ввода, "collection" для поля коллекции
  const inputMode = collectionField ? "collection" : "manual"

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
  const collectionsContext = useCollectionsContext()

  // Получаем список полей коллекции для селекта
  const collectionFields = useMemo(() => {
    if (!contentListData?.collectionKey || !collectionsContext) {
      return []
    }
    const collection = collectionsContext.collections.find(
      (c) => c.key === contentListData.collectionKey
    )
    if (!collection || !collection.items || collection.items.length === 0) {
      return []
    }
    // Берем первый элемент и извлекаем все ключи (поля)
    const firstItem = collection.items[0]
    if (!firstItem || typeof firstItem !== "object") {
      return []
    }
    return Object.keys(firstItem).filter((key) => {
      // Исключаем функции
      const value = firstItem[key]
      return typeof value !== "function"
    })
  }, [contentListData?.collectionKey, collectionsContext])

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

  // Обновляем сохранённое поле коллекции, когда prop меняется на ненулевое значение.
  useEffect(() => {
    if (collectionField) {
      setSavedCollectionField(collectionField)
    }
  }, [collectionField])

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

  const handleModalTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setDraft(value)
    if (id) {
      actions.setProp(id, (props: any) => {
        props.text = value
        // Сбрасываем поле коллекции при ручном редактировании текста
        props.collectionField = null
      })
    }
  }

  const handleCollectionFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value || null
    if (id) {
      actions.setProp(id, (props: any) => {
        props.collectionField = value
        // Если выбрано поле коллекции, обновляем текст на значение поля
        if (value && contentListData?.itemData) {
          const fieldValue = contentListData.itemData[value]
          if (fieldValue !== null && fieldValue !== undefined) {
            if (typeof fieldValue === "object") {
              props.text = JSON.stringify(fieldValue)
            } else {
              props.text = String(fieldValue)
            }
          }
        } else {
          // Если поле не выбрано, используем текущий текст
          props.text = text
        }
      })
    }
  }

  const handleModeSwitch = (mode: "manual" | "collection") => {
    if (id) {
      actions.setProp(id, (props: any) => {
        if (mode === "manual") {
          // Переключаемся на ручной ввод - сбрасываем поле коллекции
          props.collectionField = null
        } else {
          // Переключаемся на коллекцию.
          // 1) Если уже есть выбранное поле, оставляем его.
          // 2) Если поля нет, но раньше было выбрано (savedCollectionField) и оно
          //    всё ещё есть в списке полей коллекции — восстанавливаем его.
          // 3) Иначе берём первое поле, если оно доступно.
          if (!props.collectionField) {
            let nextField: string | null = null

            if (
              savedCollectionField &&
              collectionFields.includes(savedCollectionField)
            ) {
              nextField = savedCollectionField
            } else if (collectionFields.length > 0) {
              nextField = collectionFields[0]
            }

            props.collectionField = nextField

            // Обновляем текст на значение выбранного поля, чтобы первая ячейка
            // сразу показывала корректное значение.
            if (nextField && contentListData?.itemData) {
              const fieldValue = contentListData.itemData[nextField]
              if (fieldValue !== null && fieldValue !== undefined) {
                if (typeof fieldValue === "object") {
                  props.text = JSON.stringify(fieldValue)
                } else {
                  props.text = String(fieldValue)
                }
              }
            }
          }
        }
      })
    }
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

  const showContentListUi = isInsideContentList && selected

  return (
    <>
        <span
          style={
            showContentListUi
              ? { position: "relative" as const, display: "inline-block", zIndex: 1 }
              : undefined
          }
        >
          {showContentListUi && (
            <InlineSettingsBadge
              ref={badgeRef}
              icon={<span style={{ fontSize: 11 }}>T</span>}
              label={displayText || "Текст"}
              maxWidth={120}
              onSettingsClick={() => openTextModal()}
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
      {showContentListUi && isTextModalOpen && (
        <InlineSettingsModal
          open={showContentListUi && isTextModalOpen}
          title="Настройки текста"
          top={modalPosition.top}
          left={modalPosition.left}
          onClose={() => setIsTextModalOpen(false)}
          onShowAllSettings={handleShowAllSettings}
        >
          {/* Переключатель режимов */}
          {collectionFields.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 4,
                marginBottom: 12,
                backgroundColor: COLORS.gray100,
                padding: 4,
                borderRadius: 4,
              }}
            >
              <button
                type="button"
                onClick={() => handleModeSwitch("manual")}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  border: "none",
                  borderRadius: 4,
                  backgroundColor: inputMode === "manual" ? COLORS.white : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontSize: 12,
                  color: inputMode === "manual" ? COLORS.gray800 : COLORS.gray600,
                  boxShadow: inputMode === "manual" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <span>✏️</span>
                <span>Manual</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch("collection")}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  border: "none",
                  borderRadius: 4,
                  backgroundColor: inputMode === "collection" ? COLORS.white : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontSize: 12,
                  color: inputMode === "collection" ? COLORS.gray800 : COLORS.gray600,
                  boxShadow: inputMode === "collection" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <span>🗄️</span>
                <span>Collection</span>
              </button>
            </div>
          )}

          {/* Textarea для ручного ввода */}
          {inputMode === "manual" && (
            <>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontSize: 12,
                  color: COLORS.gray700,
                }}
              >
                Text
              </label>
              <textarea
                value={draft}
                onChange={handleModalTextChange}
                style={{
                  width: "100%",
                  minHeight: 80,
                  borderRadius: 4,
                  border: `1px solid ${COLORS.gray300}`,
                  backgroundColor: COLORS.white,
                  padding: "8px",
                  fontSize: 12,
                  fontFamily: "inherit",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  marginBottom: 8,
                  cursor: "text",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.purple400
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = COLORS.gray300
                }}
              />
            </>
          )}

          {/* Select для выбора поля коллекции */}
          {inputMode === "collection" && collectionFields.length > 0 && (
            <>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontSize: 12,
                  color: COLORS.gray700,
                }}
              >
                Collection Field
              </label>
              <select
                value={collectionField || ""}
                onChange={handleCollectionFieldChange}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  fontSize: 13,
                  borderRadius: 4,
                  border: `1px solid ${COLORS.gray300}`,
                  marginBottom: 8,
                  backgroundColor: COLORS.white,
                  cursor: "pointer",
                }}
              >
                <option value="">Select field...</option>
                {collectionFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </>
          )}
          {/* Кнопка "Показать все настройки" рендерит InlineSettingsModal через onShowAllSettings */}
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

