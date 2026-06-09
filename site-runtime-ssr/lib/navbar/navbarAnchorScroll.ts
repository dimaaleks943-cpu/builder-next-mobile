export const NAVBAR_ROOT_DATA_ATTR = "data-craft-navbar-id"

export const getHashFromHref = (href: string): string | null => {
  const trimmed = href.trim()
  if (!trimmed.includes("#")) {
    return null
  }

  const hash = trimmed.slice(trimmed.indexOf("#") + 1)
  return hash.length > 0 ? decodeURIComponent(hash) : null
}

export const resolveNavbarScrollOffsetPxFromDom = (): number | null => {
  const navbars = document.querySelectorAll(`[${NAVBAR_ROOT_DATA_ATTR}]`)
  let maxOffset = 0
  let found = false

  for (const node of navbars) {
    if (!(node instanceof HTMLElement)) {
      continue
    }
    if (node.getAttribute("data-disable-scroll-offset") === "true") {
      continue
    }

    const position = window.getComputedStyle(node).position
    if (position !== "fixed") {
      continue
    }

    found = true
    maxOffset = Math.max(maxOffset, node.getBoundingClientRect().height)
  }

  return found ? maxOffset : null
}

export const scrollElementIntoViewWithOffset = (
  target: HTMLElement,
  offsetPx: number,
) => {
  const top =
    window.scrollY + target.getBoundingClientRect().top - offsetPx

  window.scrollTo({
    top: Math.max(0, top),
    behavior: "smooth",
  })
}
