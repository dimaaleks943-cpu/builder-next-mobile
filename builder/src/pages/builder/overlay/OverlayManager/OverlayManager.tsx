import { useEditor } from "@craftjs/core"
import { useMemo } from "react"
import type { PreviewViewport } from "../../builder.enum.ts"
import { useCraftInlineSettingsBridge } from "../../context/CraftInlineSettingsBridgeContext.tsx"
import { CRAFT_INLINE_SETTINGS_BADGE_LABELS } from "../constants.ts"
import { computeInlineModalAnchorNearBadge } from "./inlineModalAnchor.ts"
import { OverlayBadge } from "./components/OverlayBadge/OverlayBadge.tsx"
import { OverlayOutline } from "./components/OverlayOutline/OverlayOutline.tsx"
import { useOverlayGeometryObserver } from "../hooks/useOverlayGeometryObserver.ts"
import { useSelectionHoverCollector } from "../hooks/useSelectionHoverCollector.ts"

interface Props {
  previewViewport: PreviewViewport
  overlayRootElement: HTMLElement | null
  canvasElement: HTMLElement | null
}

export const OverlayManager = ({
  previewViewport,
  overlayRootElement,
  canvasElement,
}: Props) => {
  const selection = useSelectionHoverCollector()
  const { requestInlineSettingsOpen } = useCraftInlineSettingsBridge()
  const { actions } = useEditor()

  const geometry = useOverlayGeometryObserver({
    anchorElement: selection?.dom ?? null,
    overlayRootElement,
    canvasElement,
    updateKey: previewViewport,
  })

  const label = useMemo(() => selection?.label ?? "", [selection?.label])

  const showSettingsButton = useMemo(() => {
    const labelKey = selection?.label
    return Boolean(
      labelKey && CRAFT_INLINE_SETTINGS_BADGE_LABELS.has(labelKey),
    )
  }, [selection?.label])

  if (!selection || !geometry.isVisible) {
    return null
  }

  return (
    <>
      <OverlayOutline geometry={geometry} />
      <OverlayBadge
        geometry={geometry}
        label={label}
        showSettingsButton={showSettingsButton}
        onSettingsClick={() => {
          actions.selectNode(selection.nodeId)
          const anchor = computeInlineModalAnchorNearBadge(selection.dom)
          requestInlineSettingsOpen(selection.nodeId, anchor)
        }}
      />
    </>
  )
}
