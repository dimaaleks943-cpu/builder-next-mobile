import { OVERLAY_OUTLINE_BORDER } from "../../../constants.ts"
import type { OverlayGeometry } from "../../../interface.ts"

interface Props {
  geometry: OverlayGeometry
}

export const OverlayOutline = ({ geometry }: Props) => {
  if (!geometry.isVisible) {
    return null
  }

  return (
    <div
      style={{
        position: "absolute",
        top: geometry.top,
        left: geometry.left,
        width: geometry.width,
        height: geometry.height,
        border: OVERLAY_OUTLINE_BORDER,
        boxSizing: "border-box",
        pointerEvents: "none",
      }}
    />
  )
}
