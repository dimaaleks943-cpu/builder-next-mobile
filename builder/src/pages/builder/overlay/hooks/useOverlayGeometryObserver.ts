import { useEffect, useState } from "react"
import type { OverlayGeometry } from "../interface.ts"

interface Props {
  anchorElement: HTMLElement | null
  overlayRootElement: HTMLElement | null
  canvasElement: HTMLElement | null
  updateKey?: string | number
}

const HIDDEN_GEOMETRY: OverlayGeometry = {
  isVisible: false,
  top: 0,
  left: 0,
  width: 0,
  height: 0,
}

const POSITION_AFFECTING_STYLE_PROPS = [
  "inset",
  "top",
  "right",
  "bottom",
  "left",
  "transform",
  "position",
]

const areGeometriesEqual = (nextGeometry: OverlayGeometry, prevGeometry: OverlayGeometry) => {
  return (
    nextGeometry.isVisible === prevGeometry.isVisible &&
    nextGeometry.top === prevGeometry.top &&
    nextGeometry.left === prevGeometry.left &&
    nextGeometry.width === prevGeometry.width &&
    nextGeometry.height === prevGeometry.height
  )
}

const hasPositionAffectingStyleMutation = (mutation: MutationRecord) => {
  if (mutation.type !== "attributes" || mutation.attributeName !== "style") {
    return false
  }

  const target = mutation.target
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const previousStyleText = mutation.oldValue ?? ""
  const nextStyleText = target.getAttribute("style") ?? ""

  return POSITION_AFFECTING_STYLE_PROPS.some((propName) => {
    const propertyPattern = new RegExp(`(?:^|;)\\s*${propName}\\s*:`)
    const hadProp = propertyPattern.test(previousStyleText)
    const hasProp = propertyPattern.test(nextStyleText)

    if (hadProp !== hasProp) {
      return true
    }

    if (!hadProp && !hasProp) {
      return false
    }

    const prevMatch = previousStyleText.match(new RegExp(`${propName}\\s*:\\s*([^;]+)`))
    const nextMatch = nextStyleText.match(new RegExp(`${propName}\\s*:\\s*([^;]+)`))
    return (prevMatch?.[1] ?? "").trim() !== (nextMatch?.[1] ?? "").trim()
  })
}

export const useOverlayGeometryObserver = ({
  anchorElement,
  overlayRootElement,
  canvasElement,
  updateKey,
}: Props): OverlayGeometry => {
  const [geometry, setGeometry] = useState<OverlayGeometry>(HIDDEN_GEOMETRY)

  useEffect(() => {
    if (!anchorElement || !overlayRootElement || !canvasElement) {
      setGeometry(HIDDEN_GEOMETRY)
      return
    }

    let rafId = 0

    const recalculate = () => {
      const anchorRect = anchorElement.getBoundingClientRect()
      const overlayRect = overlayRootElement.getBoundingClientRect()
      const canvasRect = canvasElement.getBoundingClientRect()

      const isOutOfViewport =
        anchorRect.bottom <= canvasRect.top ||
        anchorRect.top >= canvasRect.bottom ||
        anchorRect.right <= canvasRect.left ||
        anchorRect.left >= canvasRect.right

      if (isOutOfViewport || anchorRect.width <= 0 || anchorRect.height <= 0) {
        setGeometry((prevGeometry) => {
          return areGeometriesEqual(HIDDEN_GEOMETRY, prevGeometry) ? prevGeometry : HIDDEN_GEOMETRY
        })
        return
      }

      const nextGeometry: OverlayGeometry = {
        isVisible: true,
        top: anchorRect.top - overlayRect.top,
        left: anchorRect.left - overlayRect.left,
        width: anchorRect.width,
        height: anchorRect.height,
      }

      setGeometry((prevGeometry) => {
        return areGeometriesEqual(nextGeometry, prevGeometry) ? prevGeometry : nextGeometry
      })
    }

    const scheduleRecalculate = () => {
      if (rafId) {
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
    resizeObserver.observe(canvasElement)

    const mutationObserver = new MutationObserver((mutations) => {
      const shouldRecalculate = mutations.some((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          return true
        }

        return hasPositionAffectingStyleMutation(mutation)
      })

      if (shouldRecalculate) {
        scheduleRecalculate()
      }
    })

    let currentObservedElement: HTMLElement | null = anchorElement
    while (currentObservedElement) {
      mutationObserver.observe(currentObservedElement, {
        attributes: true,
        attributeFilter: ["style", "class"],
        attributeOldValue: true,
      })

      if (currentObservedElement === canvasElement) {
        break
      }

      currentObservedElement = currentObservedElement.parentElement
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      window.removeEventListener("resize", scheduleRecalculate)
      window.removeEventListener("scroll", scheduleRecalculate, true)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [anchorElement, overlayRootElement, canvasElement, updateKey])

  return geometry
}
