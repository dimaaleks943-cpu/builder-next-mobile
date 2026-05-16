import { useEffect, useMemo, useState } from "react"
import type { BorderSide, BorderSidesSelection } from "../craftStylesComponents/BorderSidesFrame.tsx"
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../responsiveStyle.ts"
import { useStyleEditing } from "./useStyleEditing.ts"

const ALL_SIDES: BorderSide[] = ["top", "right", "bottom", "left"]

export const useBorderSidesControl = () => {
  const viewport = usePreviewViewport()
  const { selectedId, getStyleProp, mutateClassStyle } = useStyleEditing()

  const initialSides = useMemo<BorderSidesSelection>(() => {
    if (!selectedId) return "all"
    const enabled: BorderSide[] = []
    if ((getStyleProp("borderTopWidth") as number) > 0) enabled.push("top")
    if ((getStyleProp("borderRightWidth") as number) > 0) enabled.push("right")
    if ((getStyleProp("borderBottomWidth") as number) > 0) enabled.push("bottom")
    if ((getStyleProp("borderLeftWidth") as number) > 0) enabled.push("left")
    if (enabled.length === 0 || enabled.length === 4) return "all"
    return enabled
  }, [selectedId, getStyleProp])

  const [activeSides, setActiveSides] = useState<BorderSidesSelection>(initialSides)

  useEffect(() => {
    setActiveSides(initialSides)
  }, [selectedId, initialSides])

  const applySidesToBlock = (sides: BorderSidesSelection) => {
    if (!selectedId) return
    const enabled = sides === "all" ? ALL_SIDES : sides

    mutateClassStyle((draft) => {
      const currentWidth =
        (getResponsiveStyleProp(draft, "borderTopWidth", viewport) as number | undefined) ??
        0
      const width = currentWidth > 0 ? currentWidth : 1

      setResponsiveStyleProp(
        draft,
        "borderTopWidth",
        enabled.includes("top") ? width : 0,
        viewport,
      )
      setResponsiveStyleProp(
        draft,
        "borderRightWidth",
        enabled.includes("right") ? width : 0,
        viewport,
      )
      setResponsiveStyleProp(
        draft,
        "borderBottomWidth",
        enabled.includes("bottom") ? width : 0,
        viewport,
      )
      setResponsiveStyleProp(
        draft,
        "borderLeftWidth",
        enabled.includes("left") ? width : 0,
        viewport,
      )
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
