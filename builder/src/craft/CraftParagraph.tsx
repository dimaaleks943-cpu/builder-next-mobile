import { useState, useEffect, useRef, useMemo, useCallback } from "react"
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

export const CRAFT_PARAGRAPH_DEFAULT_TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."

interface Props {
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
  const [draft, setDraft] = useState(text)
  const paragraphRef = useRef<HTMLParagraphElement | null>(null)
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

  useEffect(() => {
    if (!isEditing) {
      setDraft(displayText)
      if (paragraphRef.current) {
        paragraphRef.current.textContent = displayText
      }
    }
  }, [displayText, isEditing])

  const handleDoubleClick = (e: React.MouseEvent<HTMLParagraphElement>) => {
    e.stopPropagation()
    if (!selected) return
    if (collectionField) return
    setIsEditing(true)
  }

  const handleInput = (e: React.FormEvent<HTMLParagraphElement>) => {
    const value = e.currentTarget.textContent ?? ""
    setDraft(value)
  }

  const saveDraft = () => {
    if (!id) return
    const value = paragraphRef.current?.textContent ?? draft
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
    if (e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      setDraft(text)
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
        contentEditable={isEditing && !collectionField}
        suppressContentEditableWarning
        onDoubleClick={handleDoubleClick}
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{ ...responsiveStyle }}
      >
        {displayText}
      </p>
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
