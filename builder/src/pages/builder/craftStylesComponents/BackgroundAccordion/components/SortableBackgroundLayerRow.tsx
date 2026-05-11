import type { DraggableAttributes } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { MouseEvent as ReactMouseEvent } from "react"
import { BackgroundImageSummaryRow } from "./BackgroundImageSummaryRow.tsx"

interface Props {
  id: string
  previewUrl: string | null
  gradientFillCss: string | null
  summaryLabel: string
  layerVisibleOnCanvas: boolean
  popperOpen: boolean
  onOpenMenu: (event: ReactMouseEvent<HTMLElement>) => void
  onToggleCanvasVisibility: () => void
  onClear: () => void
}

export const SortableBackgroundLayerRow = ({
  id,
  previewUrl,
  gradientFillCss,
  summaryLabel,
  layerVisibleOnCanvas,
  popperOpen,
  onOpenMenu,
  onToggleCanvasVisibility,
  onClear,
}: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.85 : 1,
        width: "100%",
        touchAction: "none",
      }}
    >
      <BackgroundImageSummaryRow
        dragAttributes={attributes as DraggableAttributes}
        dragListeners={listeners}
        previewUrl={previewUrl}
        gradientFillCss={gradientFillCss}
        summaryLabel={summaryLabel}
        imageOnCanvas={layerVisibleOnCanvas}
        popperOpen={popperOpen}
        onOpenMenu={onOpenMenu}
        onToggleCanvasVisibility={onToggleCanvasVisibility}
        onClear={onClear}
      />
    </div>
  )
}
