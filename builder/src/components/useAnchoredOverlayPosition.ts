import { useEffect, useMemo, useState } from "react"

type AnchoredOverlayPosition = {
  top: number
  left: number
  isReady: boolean
}

interface UseAnchoredOverlayPositionParams {
  anchorElement?: HTMLElement | null
  overlayRootElement?: HTMLElement | null
  offsetTop?: number
}

const DEFAULT_POSITION: AnchoredOverlayPosition = {
  top: 0,
  left: 0,
  isReady: false,
}

export const useAnchoredOverlayPosition = ({
  anchorElement,
  overlayRootElement,
  offsetTop = -20,
}: UseAnchoredOverlayPositionParams): AnchoredOverlayPosition => {
  const [position, setPosition] = useState<AnchoredOverlayPosition>(DEFAULT_POSITION)

  useEffect(() => {
    if (!anchorElement || !overlayRootElement) {
      setPosition(DEFAULT_POSITION)
      return
    }

    let rafId: number | null = null

    const recalculate = () => {
      const anchorRect = anchorElement.getBoundingClientRect()
      const overlayRect = overlayRootElement.getBoundingClientRect()
      setPosition({
        top: anchorRect.top - overlayRect.top + offsetTop,
        left: anchorRect.left - overlayRect.left,
        isReady: true,
      })
    }

    const scheduleRecalculate = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      rafId = requestAnimationFrame(recalculate)
    }

    scheduleRecalculate()
    window.addEventListener("resize", scheduleRecalculate)
    window.addEventListener("scroll", scheduleRecalculate, true)

    const resizeObserver = new ResizeObserver(() => {
      scheduleRecalculate()
    })
    resizeObserver.observe(anchorElement)
    resizeObserver.observe(overlayRootElement)

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      window.removeEventListener("resize", scheduleRecalculate)
      window.removeEventListener("scroll", scheduleRecalculate, true)
      resizeObserver.disconnect()
    }
  }, [anchorElement, overlayRootElement, offsetTop])

  return useMemo(() => position, [position])
}
