import { useCallback, useEffect, useRef, useState } from "react"
import { useNode } from "@craftjs/core"
import { useRightPanelContext } from "../../pages/builder/context/RightPanelContext.tsx"
import {
  useCraftInlineSettingsBridge,
  useReactToInlineSettingsOpenRequest,
  type InlineSettingsViewportAnchor,
} from "../../pages/builder/context/CraftInlineSettingsBridgeContext.tsx"

export const useFormInlineSettings = () => {
  const elementRef = useRef<HTMLElement | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const rightPanelContext = useRightPanelContext()

  const { selected, id } = useNode((node) => ({
    selected: node.events.selected,
    id: node.id,
  }))

  const openInlineSettings = useCallback(
    (viewportAnchor: InlineSettingsViewportAnchor | null) => {
      if (viewportAnchor) {
        setModalPosition({
          top: viewportAnchor.top,
          left: viewportAnchor.left,
        })
      } else if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect()
        setModalPosition({ top: rect.bottom + 6, left: rect.left })
      }
      setIsSettingsOpen(true)
    },
    [],
  )

  const { clearInlineSettingsRequest } = useCraftInlineSettingsBridge()

  const closeInlineSettings = useCallback(() => {
    setIsSettingsOpen(false)
    clearInlineSettingsRequest()
  }, [clearInlineSettingsRequest])

  useReactToInlineSettingsOpenRequest(id, openInlineSettings)

  useEffect(() => {
    if (!selected && isSettingsOpen) {
      closeInlineSettings()
    }
  }, [selected, isSettingsOpen, closeInlineSettings])

  const handleShowAllSettings = useCallback(() => {
    rightPanelContext?.setTabIndex(1)
    closeInlineSettings()
  }, [rightPanelContext, closeInlineSettings])

  return {
    elementRef,
    id,
    isSettingsOpen,
    modalPosition,
    closeInlineSettings,
    handleShowAllSettings,
  }
}
