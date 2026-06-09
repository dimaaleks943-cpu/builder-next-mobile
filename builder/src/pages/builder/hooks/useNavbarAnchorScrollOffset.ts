import { useEditor } from "@craftjs/core"
import { useEffect } from "react"
import type { PreviewViewport } from "../builder.enum.ts"
import { useStyleClassContext } from "../context/StyleClassContext.tsx"
import {
  getHashFromHref,
  resolveNavbarScrollOffsetPx,
  scrollElementIntoViewWithOffset,
} from "../utils/navbarAnchorScroll.ts"

export const useNavbarAnchorScrollOffset = (
  canvasElement: HTMLElement | null,
  previewViewport: PreviewViewport,
) => {
  const { query } = useEditor()
  const { classes } = useStyleClassContext()

  useEffect(() => {
    if (!canvasElement) {
      return
    }

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const anchor = target.closest("a[href]")
      if (!(anchor instanceof HTMLAnchorElement)) {
        return
      }

      const href = anchor.getAttribute("href")
      if (!href) {
        return
      }

      const hash = getHashFromHref(href)
      if (!hash) {
        return
      }

      const offsetPx = resolveNavbarScrollOffsetPx(
        query,
        classes,
        previewViewport,
        canvasElement,
      )
      if (offsetPx === null) {
        return
      }

      const section =
        canvasElement.querySelector(`#${CSS.escape(hash)}`) ??
        document.getElementById(hash)
      if (!(section instanceof HTMLElement)) {
        return
      }

      event.preventDefault()
      scrollElementIntoViewWithOffset(canvasElement, section, offsetPx)
    }

    canvasElement.addEventListener("click", handleClick, true)
    return () => {
      canvasElement.removeEventListener("click", handleClick, true)
    }
  }, [canvasElement, classes, previewViewport, query])
}
