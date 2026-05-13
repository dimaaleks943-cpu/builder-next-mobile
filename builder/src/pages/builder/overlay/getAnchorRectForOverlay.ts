export type OverlayGeometryBox = "border" | "content"

const readCssLengthPx = (raw: string): number => {
  const t = raw.trim()
  if (!t || t === "none" || t === "auto") {
    return 0
  }
  const px = /^(\d+(?:\.\d+)?)px$/i.exec(t)
  return px ? Number(px[1]) : 0
}

/**
 * Прямоугольник якоря в координатах viewport: либо border box, либо content box
 * (внутри border+padding — как область размещения CSS Grid).
 */
export const getAnchorRectForOverlay = (
  anchorElement: HTMLElement,
  geometryBox: OverlayGeometryBox,
): DOMRect => {
  const r = anchorElement.getBoundingClientRect()
  if (geometryBox === "border") {
    return r
  }
  const cs = getComputedStyle(anchorElement)
  const bl = readCssLengthPx(cs.borderLeftWidth)
  const br = readCssLengthPx(cs.borderRightWidth)
  const bt = readCssLengthPx(cs.borderTopWidth)
  const bb = readCssLengthPx(cs.borderBottomWidth)
  const pl = readCssLengthPx(cs.paddingLeft)
  const pr = readCssLengthPx(cs.paddingRight)
  const pt = readCssLengthPx(cs.paddingTop)
  const pb = readCssLengthPx(cs.paddingBottom)
  return new DOMRect(
    r.left + bl + pl,
    r.top + bt + pt,
    Math.max(0, r.width - bl - br - pl - pr),
    Math.max(0, r.height - bt - bb - pt - pb),
  )
}
