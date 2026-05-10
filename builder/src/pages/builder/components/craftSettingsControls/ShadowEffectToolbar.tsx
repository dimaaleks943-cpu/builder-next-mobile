import { Box, IconButton, Typography } from "@mui/material"
import type { RefObject } from "react"
import { COLORS } from "../../../../theme/colors.ts"
import { AddIcon } from "../../../../icons/AddIcon.tsx"
import { DeleteIcon } from "../../../../icons/DeleteIcon.tsx"
import { EyeHideIcon } from "../../../../icons/EyeHideIcon.tsx"
import { EyeIcon } from "../../../../icons/EyeIcon.tsx"

interface Props {
  rowLabel: string
  hasShadowConfig: boolean
  swatchColor: string
  summaryLabel: string
  shadowOnCanvas: boolean
  popperOpen: boolean
  wrapRef: RefObject<HTMLDivElement | null>
  /** Unique class for hover-targeted action buttons (e.g. box-shadow-row-actions). */
  rowActionsClassName: string
  onTogglePopper: () => void
  onToggleCanvasVisibility: () => void
  onClear: () => void
  addAriaLabel: string
  hideOnCanvasAriaLabel: string
  showOnCanvasAriaLabel: string
  removeAriaLabel: string
}

export const ShadowEffectToolbar = ({
  rowLabel,
  hasShadowConfig,
  swatchColor,
  summaryLabel,
  shadowOnCanvas,
  popperOpen,
  wrapRef,
  rowActionsClassName,
  onTogglePopper,
  onToggleCanvasVisibility,
  onClear,
  addAriaLabel,
  hideOnCanvasAriaLabel,
  showOnCanvasAriaLabel,
  removeAriaLabel,
}: Props) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      gap: "8px",
    }}
  >
    <Typography
      sx={{
        fontSize: "10px",
        lineHeight: "14px",
        color: COLORS.gray700,
        flexShrink: 0,
        minWidth: "72px",
      }}
    >
      {rowLabel}
    </Typography>

    <Box
      ref={wrapRef}
      sx={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        borderRadius: "6px",
        transition: "box-shadow 0.15s ease, background-color 0.15s ease",
        ...(popperOpen
          ? {
            boxShadow: `0 0 0 1px ${COLORS.purple400}`,
            backgroundColor: COLORS.purple100,
          }
          : {}),
      }}
    >
      {hasShadowConfig ? (
        <Box
          component="button"
          type="button"
          onClick={onTogglePopper}
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 8px",
            borderRadius: "4px",
            border: `1px solid ${COLORS.gray300}`,
            backgroundColor: COLORS.gray100,
            cursor: "pointer",
            textAlign: "left",
            position: "relative",
            transition: "border-color 0.15s ease, background-color 0.15s ease",
            "&:hover": {
              borderColor: COLORS.purple200,
            },
            [`&:hover .${rowActionsClassName}`]: {
              opacity: 1,
            },
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              flexShrink: 0,
              borderRadius: "2px",
              border: `1px solid ${COLORS.gray300}`,
              backgroundColor: swatchColor,
            }}
            aria-hidden
          />
          <Typography
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: "11px",
              lineHeight: "14px",
              color: COLORS.black,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              paddingRight: "52px",
            }}
          >
            {summaryLabel}
          </Typography>
          <Box
            className={rowActionsClassName}
            sx={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "2px",
              opacity: 0,
              transition: "opacity 0.12s ease",
            }}
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
                shadowOnCanvas ? hideOnCanvasAriaLabel : showOnCanvasAriaLabel
              }
            >
              {shadowOnCanvas ? (
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
              aria-label={removeAriaLabel}
            >
              <DeleteIcon size={18} fill="currentColor"/>
            </IconButton>
          </Box>
        </Box>
      ) : (
        <IconButton
          size="small"
          onClick={onTogglePopper}
          sx={{
            color: COLORS.purple400,
            padding: "4px",
          }}
          aria-label={addAriaLabel}
        >
          <AddIcon width={20} height={20} fill={COLORS.purple400}/>
        </IconButton>
      )}
    </Box>
  </Box>
)
