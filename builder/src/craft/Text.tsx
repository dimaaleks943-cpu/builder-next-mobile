import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useEditor, useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { COLORS } from "../theme/colors"
import { useRightPanelContext } from "../pages/builder/RightPanelContext"
import { useInsideContentListCell } from "./ContentListCellContext"
import { useContentListData } from "./ContentListDataContext"
import { useCollectionsContext } from "../pages/builder/CollectionsContext"

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
    // ref с актуальным флагом открытия модалки, чтобы обработчики событий на document
    // не зависели от «устаревшего» значения isTextModalOpen из замыкания
    const isTextModalOpenRef = useRef(false)

    // Режим: "manual" для ручного ввода, "collection" для поля коллекции
    const inputMode = collectionField ? "collection" : "manual"

    // Синхронно обновляем ref при каждом изменении isTextModalOpen,
    // чтобы обработчики кликов (outside-click) всегда видели текущее состояние модалки
    useEffect(() => {
      isTextModalOpenRef.current = isTextModalOpen
    }, [isTextModalOpen])

    // DOM-элемент бирки Text (используем для позиционирования модалки и поиска кнопки-шестерёнки)
    const badgeRef = useRef<HTMLDivElement | null>(null)
    // Корневой DOM-элемент модалки (нужен для outside-click логики и перехвата событий)
    const textModalRef = useRef<HTMLDivElement>(null)

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
        return  typeof value !== "function"
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

    // Настраиваем переработку событий для модалки:
    // 1) гасим события внутри модалки (capture), чтобы Craft.js/другие обработчики не мешали
    // 2) отслеживаем клики по документу и закрываем модалку только при «клике снаружи»
    useEffect(() => {
      const modalElement = textModalRef.current
      if (!modalElement) return

      // Обработчик на самой модалке в capture phase - останавливаем события
      const handleModalCapture = (event: Event) => {
        event.stopPropagation()
        event.stopImmediatePropagation()
      }

      // Добавляем обработчики на саму модалку в capture phase
      modalElement.addEventListener("mousedown", handleModalCapture, true)
      // modalElement.addEventListener("click", handleModalCapture, true)
      // modalElement.addEventListener("pointerdown", handleModalCapture, true)

      // Обработчик для кликов вне модалки
      const handleClickOutside = (event: MouseEvent) => {
        // Используем ref для синхронной проверки состояния
        if (!isTextModalOpenRef.current) {
          return
        }

        // Сохраняем ссылку на элемент модалки в момент события
        const currentModalElement = textModalRef.current

        // Проверяем что модалка все еще существует в DOM
        if (!currentModalElement || !document.body.contains(currentModalElement)) {
          return
        }

        // Используем composedPath для проверки пути события
        const path = event.composedPath() as HTMLElement[]
        const clickedInsideModal = path.some(
          (el) => el === currentModalElement || (el.nodeType === 1 && currentModalElement.contains(el))
        )

        const badgeElement = badgeRef.current
        const clickedOnBadge = badgeElement && path.some(
          (el) => el === badgeElement || (el.nodeType === 1 && badgeElement.contains(el))
        )

        if (clickedInsideModal || clickedOnBadge) {
          return
        }

        // Клик был вне модалки - закрываем только если модалка все еще открыта
        if (isTextModalOpenRef.current && textModalRef.current && document.body.contains(textModalRef.current)) {
          setIsTextModalOpen(false)
        }
      }

      // Используем обычный bubbling phase, не capture
      document.addEventListener("mousedown", handleClickOutside)

      return () => {
        modalElement.removeEventListener("mousedown", handleModalCapture, true)
        // modalElement.removeEventListener("click", handleModalCapture, true)
        // modalElement.removeEventListener("pointerdown", handleModalCapture, true)
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [isTextModalOpen])

    // Вешаем обработчики на кнопку-шестерёнку в бирке Text (в capture phase),
    // чтобы гарантированно открыть нашу модалку и не дать Craft.js перехватить клик
    useEffect(() => {
      const shouldShow = isInsideContentList && selected
      if (!badgeRef.current || !shouldShow) return
      const badge = badgeRef.current
      const gearButton = badge.querySelector("button")
      if (!gearButton) return

      const handleGearClick = (e: Event) => {
        e.stopPropagation()
        e.preventDefault()
        openTextModal()
      }

      //Позволяет октрывать модалку после клика на шестеренку
      gearButton.addEventListener("click", handleGearClick, true) // capture phase
      gearButton.addEventListener("mousedown", handleGearClick, true)
      // gearButton.addEventListener("pointerdown", handleGearClick, true)

      return () => {
        gearButton.removeEventListener("click", handleGearClick, true)
        gearButton.removeEventListener("mousedown", handleGearClick, true)
        // gearButton.removeEventListener("pointerdown", handleGearClick, true)
      }
    }, [isInsideContentList, selected, openTextModal])

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
            // Переключаемся на коллекцию - выбираем первое поле если доступно
            if (collectionFields.length > 0 && !props.collectionField) {
              props.collectionField = collectionFields[0]
              // Обновляем текст на значение первого поля
              if (contentListData?.itemData) {
                const fieldValue = contentListData.itemData[collectionFields[0]]
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
            <div
              ref={badgeRef}
              data-text-badge="true"
              style={{
                position: "absolute",
                top: -12,
                left: 0,
                padding: "2px 6px",
                backgroundColor: COLORS.purple400,
                color: COLORS.white,
                fontSize: 10,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                gap: 4,
                pointerEvents: "auto",
                zIndex: 10,
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ flexShrink: 0 }}>T</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {displayText || "Текст"}
              </span>
              <button
                type="button"
                style={{
                  border: "none",
                  background: "transparent",
                  color: COLORS.white,
                  cursor: "pointer",
                  padding: "2px",
                  fontSize: 10,
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 11,
                  pointerEvents: "auto",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  openTextModal(e)
                }}
              >
                ⚙
              </button>
            </div>
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
          <div
            ref={textModalRef}
            data-text-modal="true"
            style={{
              position: "fixed",
              top: modalPosition.top,
              left: modalPosition.left,
              backgroundColor: COLORS.white,
              padding: "12px 14px",
              borderRadius: 8,
              minWidth: 260,
              maxWidth: 320,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              fontSize: 13,
              zIndex: 1000,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Text Block Settings
            </div>

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

            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "none",
                  backgroundColor: COLORS.purple400,
                  color: COLORS.white,
                  fontSize: 12,
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleShowAllSettings()
                }}
              >
                Show All Settings
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

;(Text as any).craft = {
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

