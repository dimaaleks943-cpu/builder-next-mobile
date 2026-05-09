import type { MouseEvent as ReactMouseEvent, RefObject } from "react"
import { useEffect, useRef, useState } from "react"

export type CraftSettingsLabelResetAnchorClickMode = "set" | "toggle"

export interface UseCraftSettingsLabelResetPopperParams {
  resetEnabled: boolean;
  /** When false, the anchored popover is closed */
  anchorActive: boolean;
  anchorClickMode?: CraftSettingsLabelResetAnchorClickMode;
}

export interface UseCraftSettingsLabelResetPopperResult {
  resetAnchorEl: HTMLElement | null;
  resetPaperRef: RefObject<HTMLDivElement>;
  handleAnchorClick: (event: ReactMouseEvent<HTMLElement>) => void;
  closePopper: () => void;
}

export const useCraftSettingsLabelResetPopper = ({
  resetEnabled,
  anchorActive,
  anchorClickMode = "set",
}: UseCraftSettingsLabelResetPopperParams): UseCraftSettingsLabelResetPopperResult => {
  const [resetAnchorEl, setResetAnchorEl] = useState<HTMLElement | null>(null)
  const resetPaperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!anchorActive) {
      setResetAnchorEl(null)
    }
  }, [anchorActive])

  useEffect(() => {
    if (!resetEnabled || !resetAnchorEl) return
    const onDocMouseDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node
      if (resetAnchorEl.contains(target)) return
      if (resetPaperRef.current?.contains(target)) return
      setResetAnchorEl(null)
    }
    document.addEventListener("mousedown", onDocMouseDown, true)
    return () => document.removeEventListener("mousedown", onDocMouseDown, true)
  }, [resetEnabled, resetAnchorEl])

  const handleAnchorClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (anchorClickMode === "toggle") {
      setResetAnchorEl((prev) => (prev ? null : event.currentTarget))
      return
    }
    setResetAnchorEl(event.currentTarget)
  }

  const closePopper = () => {
    setResetAnchorEl(null)
  }

  return {
    resetAnchorEl,
    resetPaperRef,
    handleAnchorClick,
    closePopper,
  }
}
