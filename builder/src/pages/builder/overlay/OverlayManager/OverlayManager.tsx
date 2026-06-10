import { useEditor } from "@craftjs/core"
import { useMemo } from "react"
import type { PreviewViewport } from "../../builder.enum.ts"
import { useCraftGridManualEditBridge } from "../../context/CraftGridManualEditBridgeContext.tsx"
import { useCraftInlineSettingsBridge } from "../../context/CraftInlineSettingsBridgeContext.tsx"
import { CRAFT_INLINE_SETTINGS_BADGE_LABELS } from "../constants.ts"
import { computeInlineModalAnchorNearBadge } from "./inlineModalAnchor.ts"
import { OverlayBadge } from "./components/OverlayBadge/OverlayBadge.tsx"
import { OverlayOutline } from "./components/OverlayOutline/OverlayOutline.tsx"
import { useHoverOverlayCollector } from "../hooks/useHoverOverlayCollector.ts"
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
  const { activeNodeId: gridManualEditNodeId } = useCraftGridManualEditBridge()
  const selection = useSelectionHoverCollector()
  const hover = useHoverOverlayCollector()
  const { requestInlineSettingsOpen } = useCraftInlineSettingsBridge()
  const { actions } = useEditor()

  const hoverAnchor =
    hover && hover.nodeId !== selection?.nodeId ? hover.dom : null

  const selectionGeometry = useOverlayGeometryObserver({
    anchorElement: selection?.dom ?? null,
    overlayRootElement,
    canvasElement,
    updateKey: previewViewport,
  })

  const hoverGeometry = useOverlayGeometryObserver({
    anchorElement: hoverAnchor,
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

  if (gridManualEditNodeId) {
    return null
  }

  const hasHoverOutline = Boolean(hoverAnchor && hoverGeometry.isVisible)
  const hasSelectionOutline = Boolean(
    selection && selectionGeometry.isVisible,
  )

  if (!hasHoverOutline && !hasSelectionOutline) {
    return null
  }

  return (
    <>
      {hasHoverOutline ? (
        <>
          <OverlayOutline geometry={hoverGeometry} />
          <OverlayBadge
            geometry={hoverGeometry}
            label={hover!.label}
            pointerEvents="none"
          />
        </>
      ) : null}
      {hasSelectionOutline ? (
        <>
          <OverlayOutline geometry={selectionGeometry} />
          <OverlayBadge
            geometry={selectionGeometry}
            label={label}
            showSettingsButton={showSettingsButton}
            onSettingsClick={() => {
              actions.selectNode(selection!.nodeId)
              const anchor = computeInlineModalAnchorNearBadge(selection!.dom)
              requestInlineSettingsOpen(selection!.nodeId, anchor)
            }}
          />
        </>
      ) : null}
    </>
  )
}
