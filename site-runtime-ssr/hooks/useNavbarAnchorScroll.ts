import { useEffect } from "react"
import {
  getHashFromHref,
  resolveNavbarScrollOffsetPxFromDom,
  scrollElementIntoViewWithOffset,
} from "@/lib/navbar/navbarAnchorScroll"

export const useNavbarAnchorScroll = (): void => {
  useEffect(() => {
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

      const offsetPx = resolveNavbarScrollOffsetPxFromDom()
      if (offsetPx === null) {
        return
      }

      const section = document.getElementById(hash)
      if (!(section instanceof HTMLElement)) {
        return
      }

      event.preventDefault()
      scrollElementIntoViewWithOffset(section, offsetPx)
    }

    document.addEventListener("click", handleClick, true)
    return () => {
      document.removeEventListener("click", handleClick, true)
    }
  }, [])
}
