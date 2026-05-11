import type { DraggableAttributes } from "@dnd-kit/core"
import { IconButton } from "@mui/material"
import {
  forwardRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react"
import { COLORS } from "../../../../../theme/colors.ts"
import { DeleteIcon } from "../../../../../icons/DeleteIcon.tsx"
import { DragIcon } from "../../../../../icons/DragIcon.tsx"
import { EyeHideIcon } from "../../../../../icons/EyeHideIcon.tsx"
import { EyeIcon } from "../../../../../icons/EyeIcon.tsx"
import {
  BACKGROUND_IMAGE_ROW_ACTIONS_CLASS,
  DragHandleBox,
  PreviewGradientBox,
  PreviewImg,
  PreviewMediaRoot,
  RowActionsBox,
  SummaryLabel,
  SummaryRowRoot,
} from "./BackgroundImageSummaryRow.styles.ts"

interface Props {
  dragAttributes?: DraggableAttributes
  dragListeners?: Record<string, unknown>
  previewUrl: string | null
  gradientFillCss: string | null
  summaryLabel: string
  imageOnCanvas: boolean
  popperOpen: boolean
  onOpenMenu: (event: ReactMouseEvent<HTMLElement>) => void
  onToggleCanvasVisibility: () => void
  onClear: () => void
}

export const BackgroundImageSummaryRow = forwardRef<HTMLDivElement, Props>(
  (
    {
      dragAttributes,
      dragListeners,
      previewUrl,
      gradientFillCss,
      summaryLabel,
      imageOnCanvas,
      popperOpen,
      onOpenMenu,
      onToggleCanvasVisibility,
      onClear,
    },
    ref,
  ) => {
    const handleRowKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        onOpenMenu(
          event as unknown as ReactMouseEvent<HTMLElement>,
        )
      }
    }

    return (
      <SummaryRowRoot
        ref={ref}
        component="div"
        role="button"
        tabIndex={0}
        popperOpen={popperOpen}
        onClick={onOpenMenu}
        onKeyDown={handleRowKeyDown}
      >
        <DragHandleBox
          className="background-image-drag-handle"
          data-dnd-drag-handle
          {...(dragListeners ?? {})}
          {...(dragAttributes ?? {})}
          onClick={(e) => e.stopPropagation()}
        >
          <DragIcon size={14} fill={COLORS.gray700}/>
        </DragHandleBox>
        {previewUrl ? (
          <PreviewMediaRoot>
            <PreviewImg src={previewUrl} alt="" draggable={false}/>
          </PreviewMediaRoot>
        ) : (
          <PreviewGradientBox
            $backgroundImage={gradientFillCss ?? "none"}
            aria-hidden
          />
        )}
        <SummaryLabel component="span">{summaryLabel}</SummaryLabel>
        <RowActionsBox
          className={BACKGROUND_IMAGE_ROW_ACTIONS_CLASS}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onToggleCanvasVisibility()
            }}
            sx={{
              padding: "2px",
              color: COLORS.gray700,
              "&:hover": { backgroundColor: "none" },
            }}
            aria-label={
              imageOnCanvas ? "Hide background image" : "Show background image"
            }
          >
            {imageOnCanvas ? (
              <EyeIcon size={16} fill="currentColor"/>
            ) : (
              <EyeHideIcon size={16} fill="currentColor"/>
            )}
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onClear()
            }}
            sx={{
              padding: "2px",
              color: COLORS.gray700,
              "&:hover": { backgroundColor: "none" },
            }}
            aria-label="Remove background image"
          >
            <DeleteIcon size={18} fill="currentColor"/>
          </IconButton>
        </RowActionsBox>
      </SummaryRowRoot>
    )
  },
)

BackgroundImageSummaryRow.displayName = "BackgroundImageSummaryRow"
