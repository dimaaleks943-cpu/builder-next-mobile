import { useState, useEffect, useRef } from "react"
import { useEditor, useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { COLORS } from "../theme/colors"

export type TextAlign = "left" | "center" | "right"

export interface TextProps {
  text?: string
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
    const spanRef = useRef<HTMLSpanElement | null>(null)

    const {
      connectors: { connect, drag },
      selected,
      id,
    } = useNode((node) => ({
      selected: node.events.selected,
      id: node.id,
    }))

    const { actions } = useEditor()

    /**
     / Синхронизируем локальное состояние с пропсами, когда не редактируем
     */
    useEffect(() => {
      if (!isEditing) {
        setDraft(text)
        if (spanRef.current) {
          spanRef.current.textContent = text
        }
      }
    }, [text, isEditing])

    const handleDoubleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation()
      if (!selected) return
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
      cursor: isEditing ? "text" : selected ? "move" : "default",
      userSelect: isEditing ? "text" : "none",
    }

    return (
      <span
        ref={(ref) => {
          spanRef.current = ref
          if (!ref) return
          // Во время редактирования отключаем drag, чтобы не мешать вводу текста
          if (isEditing) {
            connect(ref)
          } else {
            connect(drag(ref))
          }
        }}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={handleDoubleClick}
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={style}
      />
    )
  }

;(Text as any).craft = {
  props: {
    text: "Текст",
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

