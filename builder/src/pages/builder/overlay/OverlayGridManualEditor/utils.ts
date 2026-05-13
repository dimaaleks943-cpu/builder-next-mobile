import { getAnchorRectForOverlay } from "../getAnchorRectForOverlay.ts";

/** Разобранная линия оси grid-row/grid-column из `getComputedStyle` (число, span или auto). */
const parseGridAxisPlacementToken = (
  raw: string,
): { type: "line"; line: number } | { type: "span"; span: number } | { type: "auto" } => {
  const t = raw.trim().toLowerCase()
  if (!t || t === "auto") {
    return { type: "auto" }
  }
  const spanM = /^span\s+(\d+)/.exec(t)
  if (spanM) {
    const span = Number(spanM[1])
    return Number.isFinite(span) && span > 0 ? { type: "span", span } : { type: "auto" }
  }
  const n = Number(t)
  return Number.isFinite(n) ? { type: "line", line: Math.trunc(n) } : { type: "auto" }
}

const resolveGridRowStartEndLines = (
  rowStartRaw: string,
  rowEndRaw: string,
): { start: number; end: number } | undefined => {
  const a = parseGridAxisPlacementToken(rowStartRaw)
  const b = parseGridAxisPlacementToken(rowEndRaw)
  if (a.type === "line" && b.type === "line") {
    return b.line > a.line ? { start: a.line, end: b.line } : { start: a.line, end: a.line + 1 }
  }
  if (a.type === "line" && b.type === "span") {
    return { start: a.line, end: a.line + b.span }
  }
  if (a.type === "span" && b.type === "line") {
    return b.line > a.span ? { start: b.line - a.span, end: b.line } : { start: 1, end: b.line }
  }
  if (a.type === "line" && b.type === "auto") {
    return { start: a.line, end: a.line + 1 }
  }
  if (a.type === "auto" && b.type === "line") {
    if (b.line <= 1) {
      return { start: 1, end: 2 }
    }
    return { start: b.line - 1, end: b.line }
  }
  return undefined
}



/** Если линии ряда в computed style остаются `auto`, оцениваем индекс ряда по вертикали (равные полосы + gap). */
const inferGridRowIndexFromLayout = (
  anchor: HTMLElement,
  rowCount: number,
  rowGapPx: number,
  rect: DOMRect,
): number => {
  if (rowCount < 1) {
    return 0
  }
  const ar = getAnchorRectForOverlay(anchor, "content")
  const gap = Math.max(0, rowGapPx)
  const innerH = Math.max(0, ar.height)
  const totalGap = Math.max(0, rowCount - 1) * gap
  const track = (innerH - totalGap) / rowCount
  if (!(track > 0)) {
    return 0
  }
  const cy = (rect.top + rect.bottom) / 2
  const y = cy - ar.top
  const idx = Math.floor((y + gap * 0.5) / (track + gap))
  return Math.max(0, Math.min(rowCount - 1, idx))
}

/** Плоский список детей грид-контейнера с учётом `display: contents` (иначе `grid-row` может быть у внуков). */
const collectGridItemRootElements = (anchor: HTMLElement): HTMLElement[] => {
  const acc: HTMLElement[] = []
  const visit = (parent: HTMLElement) => {
    for (const ch of parent.children) {
      if (!(ch instanceof HTMLElement)) {
        continue
      }
      const cs = getComputedStyle(ch)
      if (cs.display === "none") {
        continue
      }
      if (cs.display === "contents") {
        visit(ch)
      } else {
        acc.push(ch)
      }
    }
  }
  visit(anchor)
  return acc
}


const resolveGridRowLinesFromComputedStyle = (
  itemCs: CSSStyleDeclaration,
): { start: number; end: number } | undefined => {
  const fromParts = resolveGridRowStartEndLines(itemCs.gridRowStart, itemCs.gridRowEnd)
  if (fromParts) {
    return fromParts
  }
  const gr = itemCs.gridRow.trim()
  if (gr && !/^auto$/i.test(gr)) {
    const halves = gr.split(/\s*\/\s*/).map((s) => s.trim())
    if (halves.length === 2 && halves[0] && halves[1]) {
      const r = resolveGridRowStartEndLines(halves[0]!, halves[1]!)
      if (r) {
        return r
      }
    }
    if (halves.length === 1 && halves[0]) {
      const n = Number(halves[0])
      if (Number.isFinite(n)) {
        return { start: Math.trunc(n), end: Math.trunc(n) + 1 }
      }
    }
  }
  const ga = itemCs.gridArea.trim()
  if (ga && !/^auto$/i.test(ga)) {
    const quads = ga.split(/\s*\/\s*/).map((s) => s.trim())
    if (quads.length >= 4 && quads[0] && quads[2]) {
      return resolveGridRowStartEndLines(quads[0]!, quads[2]!)
    }
  }
  return undefined
}

/**
 * Высоты дорожек рядов превью оверлея по фактической вёрстке якорного грида (как в Webflow для `auto`):
 * пустой ряд — минимум `emptyRowMinPx`, ряд с элементами — по максимальной высоте детей в этом ряду (без искусственного пола 75px).
 */
export const measureGridManualRowHeightsPx = (
  anchor: HTMLElement,
  rowCount: number,
  emptyRowMinPx: number,
  rowGapPx: number,
): number[] => {
  const heights = Array.from({ length: rowCount }, () => emptyRowMinPx)
  const hasContent = Array.from({ length: rowCount }, () => false)
  const contentMax = Array.from({ length: rowCount }, () => 0)

  const items = collectGridItemRootElements(anchor)
  items.forEach((node) => {
    const itemCs = getComputedStyle(node)
    if (itemCs.display === "none") {
      return
    }
    const rect = node.getBoundingClientRect()
    const h = rect.height
    if (!Number.isFinite(h) || h <= 0) {
      return
    }
    let resolved = resolveGridRowLinesFromComputedStyle(itemCs)
    if (!resolved || resolved.end <= resolved.start) {
      const inferred = inferGridRowIndexFromLayout(anchor, rowCount, rowGapPx, rect)
      resolved = { start: inferred + 1, end: inferred + 2 }
    }
    const { start, end } = resolved
    if (end <= start) {
      return
    }
    const span = end - start
    const share = span > 1 ? h / span : h
    for (let line = start; line < end; line++) {
      const idx = line - 1
      if (idx >= 0 && idx < rowCount) {
        hasContent[idx] = true
        contentMax[idx] = Math.max(contentMax[idx], share)
      }
    }
  })

  for (let i = 0; i < rowCount; i++) {
    if (hasContent[i]) {
      heights[i] = Math.max(1, Math.ceil(contentMax[i]))
    }
  }
  return heights
}
