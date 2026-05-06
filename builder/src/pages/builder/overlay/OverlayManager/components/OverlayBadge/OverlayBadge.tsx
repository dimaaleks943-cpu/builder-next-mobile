import { COLORS } from "../../../../../../theme/colors.ts"
import { OVERLAY_BADGE_GAP_Y, OVERLAY_BADGE_OFFSET_Y } from "../../../constants.ts"
import type { OverlayGeometry } from "../../../interface.ts"

interface Props {
  geometry: OverlayGeometry
  label: string
  showSettingsButton: boolean
  onSettingsClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const OverlayBadge = ({
  geometry,
  label,
  showSettingsButton,
  onSettingsClick,
}: Props) => {
  if (!geometry.isVisible) {
    return null
  }

  return (
    <div
      style={{
        position: "absolute",
        top: geometry.top - OVERLAY_BADGE_OFFSET_Y,
        left: geometry.left,
        maxWidth: Math.max(120, geometry.width),
        padding: "2px 6px",
        borderRadius: 4,
        backgroundColor: COLORS.purple400,
        color: COLORS.white,
        display: "flex",
        alignItems: "center",
        gap: OVERLAY_BADGE_GAP_Y,
        fontSize: 10,
        lineHeight: "14px",
        fontFamily: "Inter, Arial, sans-serif",
        boxSizing: "border-box",
        pointerEvents: "auto",
      }}
      onMouseDown={(event) => {
        event.stopPropagation()
      }}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
        }}
      >
        {label}
      </span>
      {showSettingsButton ? (
        <button
          type="button"
          onMouseDown={(event) => {
            event.stopPropagation()
            event.preventDefault()
          }}
          onClick={(event) => {
            event.stopPropagation()
            event.preventDefault()
            onSettingsClick(event)
          }}
          style={{
            all: "unset",
            color: COLORS.white,
            cursor: "pointer",
            flexShrink: 0,
            fontSize: 10,
            lineHeight: "14px",
          }}
        >
          ⚙
        </button>
      ) : null}
    </div>
  )
}
