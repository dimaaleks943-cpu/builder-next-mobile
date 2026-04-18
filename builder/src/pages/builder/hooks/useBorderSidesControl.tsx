import { useEffect, useMemo, useState } from "react";
import type { BorderSide, BorderSidesSelection } from "../craftStylesComponents/BorderSidesFrame.tsx";

const ALL_SIDES: BorderSide[] = ["top", "right", "bottom", "left"]

interface SetPropActions {
  setProp: (id: string, cb: (props: Record<string, unknown>) => void) => void
}

export const useBorderSidesControl = (
  selectedId: string | null,
  selectedProps: Record<string, unknown> | null,
  actions: SetPropActions,
) => {
  const initialSides = useMemo<BorderSidesSelection>(() => {
    if (!selectedProps) return "all"
    const enabled: BorderSide[] = []
    if ((selectedProps.borderTopWidth as number) > 0) enabled.push("top")
    if ((selectedProps.borderRightWidth as number) > 0) enabled.push("right")
    if ((selectedProps.borderBottomWidth as number) > 0) enabled.push("bottom")
    if ((selectedProps.borderLeftWidth as number) > 0) enabled.push("left")
    if (enabled.length === 0 || enabled.length === 4) return "all"
    return enabled
  }, [selectedProps])

  const [activeSides, setActiveSides] = useState<BorderSidesSelection>(initialSides)

  useEffect(() => {
    setActiveSides(initialSides)
  }, [selectedId, initialSides])

  const applySidesToBlock = (sides: BorderSidesSelection) => {
    if (!selectedId) return
    const enabled = sides === "all" ? ALL_SIDES : sides

    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      const currentWidth = (props.borderTopWidth as number) ?? 0
      const width = currentWidth > 0 ? currentWidth : 1

      props.borderTopWidth = enabled.includes("top") ? width : 0
      props.borderRightWidth = enabled.includes("right") ? width : 0
      props.borderBottomWidth = enabled.includes("bottom") ? width : 0
      props.borderLeftWidth = enabled.includes("left") ? width : 0
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
