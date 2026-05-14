import { Box } from "@mui/material"
import { useLayoutEffect, useRef, useState } from "react"
import type { MouseEvent } from "react"

import {
  GRID_MANUAL_ROW_LABEL_MIN_HEIGHT_FOR_AUTO_PX,
  OverlayGridManualRowLabel,
  OverlayGridManualRowLabelAutoFitPrimary,
  OverlayGridManualRowLabelFull,
  OverlayGridManualRowLabelGhost,
  OverlayGridManualRowLabelGhostFull,
  OverlayGridManualRowTrack,
  OverlayGridManualRowTrackGhost,
  OverlayGridManualRowTrackGhostSingleRow,
  OverlayGridManualRowTrackSingleRow,
} from "../../styles.ts"
import { COLORS } from "../../../../../../theme/colors.ts";
import { UpdateIcon } from "../../../../../../icons/UpdateIcon.tsx";

interface Props {
  /** При одном визуальном ряду всегда полное «AUTO» и достаточная высота дорожки. */
  singleRowMode: boolean
  label: string
  variant?: "solid" | "ghost"
  showAutoFitIcon?: boolean
  onLabelClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

export const RowTrackWithAutoLabel = ({
  singleRowMode,
  label,
  variant = "solid",
  showAutoFitIcon = false,
  onLabelClick,
}: Props) => {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [compact, setCompact] = useState(false)

  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) {
      return
    }
    const sync = () => {
      if (singleRowMode) {
        setCompact(false)
        return
      }
      setCompact(
        el.getBoundingClientRect().height < GRID_MANUAL_ROW_LABEL_MIN_HEIGHT_FOR_AUTO_PX,
      )
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => {
      ro.disconnect()
    }
  }, [singleRowMode])

  const TrackSolid = singleRowMode ? OverlayGridManualRowTrackSingleRow : OverlayGridManualRowTrack
  const TrackGhost = singleRowMode
    ? OverlayGridManualRowTrackGhostSingleRow
    : OverlayGridManualRowTrackGhost
  const Track = variant === "ghost" ? TrackGhost : TrackSolid

  const LabelSolid = singleRowMode ? OverlayGridManualRowLabelFull : OverlayGridManualRowLabel
  const LabelGhost = singleRowMode ? OverlayGridManualRowLabelGhostFull : OverlayGridManualRowLabelGhost

  const text = compact ? "..." : label

  const inner =
    showAutoFitIcon ? (
      <OverlayGridManualRowLabelAutoFitPrimary>
        <UpdateIcon size={12} fill={COLORS.white} />
        <LabelSolid sx={{ flexShrink: 0 }}>{text}</LabelSolid>
      </OverlayGridManualRowLabelAutoFitPrimary>
    ) : variant === "ghost" ? (
      <LabelGhost>{text}</LabelGhost>
    ) : (
      <LabelSolid>{text}</LabelSolid>
    )

  return (
    <Track ref={trackRef}>
      {onLabelClick ? (
        <Box
          component="button"
          type="button"
          onClick={onLabelClick}
          sx={{
            cursor: "pointer",
            border: "none",
            background: "none",
            font: "inherit",
            color: "inherit",
            padding: "2px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: 0,
            flex: variant === "ghost" ? 1 : undefined,
            "&:hover": { opacity: 0.92 },
          }}
        >
          {inner}
        </Box>
      ) : (
        inner
      )}
    </Track>
  )
}
