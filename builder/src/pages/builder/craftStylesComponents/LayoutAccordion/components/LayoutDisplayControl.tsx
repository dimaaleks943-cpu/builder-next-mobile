import { useTheme } from "@mui/material/styles"
import { useCallback, useState, type MouseEvent, type ReactNode } from "react"
import {
  LayoutDisplayInlineTrigger,
  LayoutDisplayInlineTriggerChevron,
  LayoutDisplayInlineTriggerLabel,
  LayoutDisplayMenu,
  LayoutDisplayMenuItem,
  LayoutDisplayRow,
  LayoutDisplaySegmentBtn,
  LayoutDisplaySegmented,
} from "./LayoutDisplayControl.styles.ts"
import { ChevronRightIcon } from "../../../../../icons/ChevronRightIcon.tsx"

export interface LayoutDisplayPrimaryOption {
  id: string
  content: ReactNode
}

export interface LayoutDisplayInlineOption {
  /** `undefined` — снять `display` из стилей (пусто в JSON). */
  value: string | undefined
  label: string
}

interface Props {
  /** Текущее значение `display` из craft (после `trim`; пустая строка = свойство не задано). */
  display: string
  primaryOptions: LayoutDisplayPrimaryOption[]
  inlineOptions: LayoutDisplayInlineOption[]
  onDisplayChange: (next: string | undefined) => void
  hideInlineRow?: boolean
}

export const LayoutDisplayControl = ({
  display,
  primaryOptions,
  inlineOptions,
  onDisplayChange,
  hideInlineRow = false,
}: Props) => {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  /** {@link BuilderPage} задаёт оболочке `zIndex: modal+1`, иначе MUI Menu (modal) оказывается под ней. */
  const menuModalZIndex = theme.zIndex.modal + 50

  const handleOpen = useCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handlePickInline = useCallback(
    (value: string | undefined) => {
      onDisplayChange(value)
      handleClose()
    },
    [handleClose, onDisplayChange],
  )

  const primaryIds = new Set(primaryOptions.map((o) => o.id))
  const isPrimaryOrUnset = display === "" || primaryIds.has(display)
  const inlineMatch = inlineOptions.find((row) =>
    row.value === undefined ? display === "" : row.value === display,
  )
  const fourthLabel = isPrimaryOrUnset ? "В строке" : inlineMatch?.label ?? display
  const fourthActive = !isPrimaryOrUnset

  return (
    <LayoutDisplayRow>
      <LayoutDisplaySegmented>
        {primaryOptions.map((option) => (
          <LayoutDisplaySegmentBtn
            key={option.id}
            type="button"
            $active={display !== "" && option.id === display}
            onClick={() => onDisplayChange(option.id)}
          >
            {option.content}
          </LayoutDisplaySegmentBtn>
        ))}
        {!hideInlineRow ? (
          <LayoutDisplayInlineTrigger
            type="button"
            $active={fourthActive}
            onClick={handleOpen}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            aria-label={
              fourthLabel === "В строке"
                ? "Режим в строке"
                : `Режим в строке: ${fourthLabel}`
            }
          >
            <LayoutDisplayInlineTriggerLabel title={fourthLabel}>
              {fourthLabel}
            </LayoutDisplayInlineTriggerLabel>
            <LayoutDisplayInlineTriggerChevron>
              <ChevronRightIcon size={12} />
            </LayoutDisplayInlineTriggerChevron>
          </LayoutDisplayInlineTrigger>
        ) : null}
      </LayoutDisplaySegmented>
      {!hideInlineRow ? (
        <LayoutDisplayMenu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          disableAutoFocusItem
          slotProps={{
            root: {
              sx: { zIndex: menuModalZIndex },
            },
          }}
        >
          {inlineOptions.map((row) => (
            <LayoutDisplayMenuItem
              key={`${row.label}-${row.value ?? "__clear__"}`}
              selected={
                row.value === undefined
                  ? display === ""
                  : row.value === display
              }
              onClick={() => handlePickInline(row.value)}
            >
              {row.label}
            </LayoutDisplayMenuItem>
          ))}
        </LayoutDisplayMenu>
      ) : null}
    </LayoutDisplayRow>
  )
}
