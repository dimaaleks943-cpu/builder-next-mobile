import { useEffect, useMemo, useState } from "react";
import type { BorderSide, BorderSidesSelection } from "../craftStylesComponents/BorderSidesFrame.tsx";
import type { PreviewViewport } from "../builder.enum.ts"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../responsiveStyle.ts"

const ALL_SIDES: BorderSide[] = ["top", "right", "bottom", "left"]

interface SetPropActions {
  setProp: (id: string, cb: (props: Record<string, unknown>) => void) => void
}

export const useBorderSidesControl = (
  selectedId: string | null,
  selectedProps: Record<string, unknown> | null,
  actions: SetPropActions,
  viewport: PreviewViewport,
) => {
  const initialSides = useMemo<BorderSidesSelection>(() => {
    if (!selectedProps) return "all"
    const enabled: BorderSide[] = []
    if ((getResponsiveStyleProp(selectedProps, "borderTopWidth", viewport) as number) > 0) enabled.push("top")
    if ((getResponsiveStyleProp(selectedProps, "borderRightWidth", viewport) as number) > 0) enabled.push("right")
    if ((getResponsiveStyleProp(selectedProps, "borderBottomWidth", viewport) as number) > 0) enabled.push("bottom")
    if ((getResponsiveStyleProp(selectedProps, "borderLeftWidth", viewport) as number) > 0) enabled.push("left")
    if (enabled.length === 0 || enabled.length === 4) return "all"
    return enabled
  }, [selectedProps, viewport])

  const [activeSides, setActiveSides] = useState<BorderSidesSelection>(initialSides)

  useEffect(() => {
    setActiveSides(initialSides)
  }, [selectedId, initialSides])

  const applySidesToBlock = (sides: BorderSidesSelection) => {
    if (!selectedId) return
    const enabled = sides === "all" ? ALL_SIDES : sides

    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      const currentWidth =
        (getResponsiveStyleProp(props, "borderTopWidth", viewport) as number | undefined) ?? 0
      const width = currentWidth > 0 ? currentWidth : 1

      setResponsiveStyleProp(props, "borderTopWidth", enabled.includes("top") ? width : 0, viewport)
      setResponsiveStyleProp(props, "borderRightWidth", enabled.includes("right") ? width : 0, viewport)
      setResponsiveStyleProp(props, "borderBottomWidth", enabled.includes("bottom") ? width : 0, viewport)
      setResponsiveStyleProp(props, "borderLeftWidth", enabled.includes("left") ? width : 0, viewport)
    })
  }

  const isSideActive = (side: BorderSide) =>
    activeSides === "all" || activeSides.includes(side)

  const toggleAllSides = () => {
    setActiveSides((prev) => {
      const next: BorderSidesSelection = prev === "all" ? [] : "all"
      applySidesToBlock(next)
      return next
    })
  }

  const toggleSide = (side: BorderSide) => {
    setActiveSides((prev) => {
      let next: BorderSidesSelection
      if (prev === "all") {
        next = [side]
      } else {
        const exists = prev.includes(side)
        if (exists) {
          const filtered = prev.filter((s) => s !== side)
          next = filtered.length === 0 ? [] : filtered
        } else {
          const added = [...prev, side]
          next = added.length === 4 ? "all" : added
        }
      }
      applySidesToBlock(next)
      return next
    })
  }

  return { activeSides, toggleSide, toggleAllSides, isSideActive }
}
