import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from "react"
import { useEditor, useNode } from "@craftjs/core"
import { useRightPanelContext } from "../pages/builder/context/RightPanelContext.tsx"
import {
  useCraftInlineSettingsBridge,
  useReactToInlineSettingsOpenRequest,
  type InlineSettingsViewportAnchor,
} from "../pages/builder/context/CraftInlineSettingsBridgeContext.tsx"
import { useContentListData } from "../pages/builder/context/ContentListDataContext.tsx"
import { COLORS } from "../theme/colors"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import { useCraftNodeStyle } from "../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import { useBuilderModeContext } from "../pages/builder/context/BuilderModeContext.tsx"
import {
  commitCraftTextDraft,
  getCraftTextDisplayText,
} from "../utils/craftLocalizedText.ts"
import { TextSettingsFields } from "../pages/builder/settingsCraftComponents/TextSettingsFields/TextSettingsFields.tsx"
import { InlineSettingsModal } from "../components/InlineSettingsModal/InlineSettingsModal.tsx"

/** One `<br>` ↔ one `\n` in stored `text` / i18n. */
const getParagraphTextFromElement = (element: HTMLElement): string => {
  let out = ""
  element.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += child.textContent ?? ""
      return
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return
    const el = child as HTMLElement
    if (el.tagName === "BR") {
      out += "\n"
    }
  })
  return out
}

const setParagraphContentFromText = (element: HTMLParagraphElement, text: string): void => {
  element.replaceChildren()
  const segments = text.split("\n")
  segments.forEach((segment, index) => {
    if (index > 0) {
      element.appendChild(document.createElement("br"))
    }
    if (segment.length > 0) {
      element.appendChild(document.createTextNode(segment))
    }
  })
}

export const CRAFT_PARAGRAPH_DEFAULT_TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."

interface Props {
  htmlId?: string
  text?: string
  i18nKey?: string | null
  collectionField?: string | null
  styleClassIds?: string[]
  style?: ResponsiveStyle
}

export const CraftParagraph = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const text = props.text ?? ""
  const i18nKey = props.i18nKey ?? null
  const collectionField = props.collectionField ?? null
  const [isEditing, setIsEditing] = useState(false)
  const paragraphRef = useRef<HTMLParagraphElement | null>(null)
  const lastSyncedTextRef = useRef<string | null>(null)
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
      } else if (paragraphRef.current) {
        const rect = paragraphRef.current.getBoundingClientRect()
        setModalPosition({ top: rect.bottom + 6, left: rect.left })
      }
      setIsTextModalOpen(true)
    },
    [],
  )

  const { clearInlineSettingsRequest } = useCraftInlineSettingsBridge()

  const closeTextInlineSettings = useCallback(() => {
    setIsTextModalOpen(false)
    clearInlineSettingsRequest()
  }, [clearInlineSettingsRequest])

  useReactToInlineSettingsOpenRequest(id, openTextInlineSettings)

  useEffect(() => {
    if (!selected && isTextModalOpen) {
      closeTextInlineSettings()
    }
  }, [selected, isTextModalOpen, closeTextInlineSettings])

  const handleShowAllSettings = () => {
    rightPanelContext?.setTabIndex(1)
    closeTextInlineSettings()
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

  const persistParagraphText = useCallback(
    (value: string) => {
      if (!id) return
      commitCraftTextDraft({
        nodeId: id,
        value,
        i18nKey,
        collectionField,
        modeContext,
        setProp: actions.setProp,
      })
    },
    [actions.setProp, collectionField, i18nKey, id, modeContext],
  )

  const endEditing = useCallback(() => {
    const el = paragraphRef.current
    if (!el) {
      setIsEditing(false)
      return
    }
    const value = getParagraphTextFromElement(el)
    persistParagraphText(value)
    setParagraphContentFromText(el, value)
    lastSyncedTextRef.current = value
    setIsEditing(false)
  }, [persistParagraphText])

  useLayoutEffect(() => {
    const el = paragraphRef.current
    if (!el || collectionField || isEditing) return
    if (lastSyncedTextRef.current === displayText) return
    lastSyncedTextRef.current = displayText
    setParagraphContentFromText(el, displayText)
  }, [displayText, isEditing, collectionField])

  useEffect(() => {
    if (selected || !isEditing) return
    endEditing()
  }, [selected, isEditing, endEditing])

  const handleDoubleClick = (e: React.MouseEvent<HTMLParagraphElement>) => {
    e.stopPropagation()
    if (!selected || collectionField) return
    const el = paragraphRef.current
    if (el) {
      setParagraphContentFromText(el, displayText)
      lastSyncedTextRef.current = displayText
    }
    setIsEditing(true)
  }

  const handleBlur = () => {
    if (isEditing) {
      endEditing()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.stopPropagation()
      document.execCommand("insertLineBreak")
      return
    }
    if (e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      const el = paragraphRef.current
      if (el) {
        setParagraphContentFromText(el, displayText)
        lastSyncedTextRef.current = displayText
      }
      setIsEditing(false)
    }
  }

  return (
    <>
      <p
        ref={(ref) => {
          paragraphRef.current = ref
          if (!ref) return
          if (isEditing && !collectionField) {
            connect(ref)
          } else {
            connect(drag(ref))
          }
        }}
        {...(props.htmlId ? { id: props.htmlId } : {})}
        contentEditable={isEditing && !collectionField}
        suppressContentEditableWarning
        onDoubleClick={handleDoubleClick}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{ ...responsiveStyle }}
      />
      <InlineSettingsModal
        open={isTextModalOpen}
        title="Настройки текста"
        top={modalPosition.top}
        left={modalPosition.left}
        onClose={closeTextInlineSettings}
        onShowAllSettings={handleShowAllSettings}
      >
        <TextSettingsFields nodeId={id} />
      </InlineSettingsModal>
    </>
  )
}

(CraftParagraph as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.Paragraph,
  props: {
    text: CRAFT_PARAGRAPH_DEFAULT_TEXT,
    i18nKey: null,
    collectionField: null,
    style: {
      [PreviewViewport.DESKTOP]: {
        display: "block",
        fontSize: "16px",
        lineHeight: "24px",
        color: COLORS.gray700,
        margin: 0,
      },
    },
  },
}
