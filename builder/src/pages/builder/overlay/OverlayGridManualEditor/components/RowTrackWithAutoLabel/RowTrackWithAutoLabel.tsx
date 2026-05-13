import { useLayoutEffect, useRef, useState } from "react";
import {
  GRID_MANUAL_ROW_LABEL_MIN_HEIGHT_FOR_AUTO_PX,
  OverlayGridManualRowLabel,
  OverlayGridManualRowLabelFull,
  OverlayGridManualRowTrack,
  OverlayGridManualRowTrackSingleRow
} from "../../styles.ts";

interface Props {
  /** При одном ряду всегда полное «AUTO» и достаточная высота дорожки. */
  singleRowMode: boolean
}

export const RowTrackWithAutoLabel = ({ singleRowMode }: Props) => {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [compact, setCompact] = useState(false)

  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return
    const sync = () => {
      if (singleRowMode) {
        setCompact(false)
        return
      }
      setCompact(
        el.getBoundingClientRect().height <
        GRID_MANUAL_ROW_LABEL_MIN_HEIGHT_FOR_AUTO_PX,
      )
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => {
      ro.disconnect()
    }
  }, [singleRowMode])

  const Track = singleRowMode ? OverlayGridManualRowTrackSingleRow : OverlayGridManualRowTrack
  const Label = singleRowMode ? OverlayGridManualRowLabelFull : OverlayGridManualRowLabel

  return (
    <Track ref={trackRef}>
      <Label>{compact ? "..." : "AUTO"}</Label>
    </Track>
  )
}
