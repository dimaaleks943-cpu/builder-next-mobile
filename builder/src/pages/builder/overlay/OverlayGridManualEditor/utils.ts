import { getAnchorRectForOverlay } from "../getAnchorRectForOverlay.ts";
import {
  parseGridTemplateTracksExpanded,
  sliceGridTemplateTrackList
} from "../../craftStylesComponents/LayoutAccordion/components/LayoutGridSection/utils.ts";

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

export const AUTO_FIT_DISABLED_MESSAGE =
  "Auto-fit can't be enabled when another track on the same axis uses auto, min-content, max-content, flexible (fr), minmax(auto, …), or repeat(auto-fit, …)."

const AUTO_FIT_TRACK_RE = /^repeat\s*\(\s*auto-fit\s*,\s*(.+)\)\s*$/i

export const isAutoFitRepeatTrack = (track: string): boolean =>
  AUTO_FIT_TRACK_RE.test(track.trim())

export const parseAutoFitBasisTrack = (track: string): string | undefined => {
  const m = track.trim().match(AUTO_FIT_TRACK_RE)
  if (!m) {
    return undefined
  }
  return m[1]!.trim()
}

export const buildAutoFitTrackFromBasis = (basis: string): string => {
  const b = basis.trim()
  return `repeat(auto-fit, ${b})`
}

/** Other tracks on the same axis that forbid turning auto-fit on for the edited track. */
export const trackConflictsWithAutoFitPeerPolicy = (track: string): boolean => {
  const t = track.trim()
  if (!t) {
    return false
  }
  if (/^auto$/i.test(t)) {
    return true
  }
  if (/^min-content$/i.test(t)) {
    return true
  }
  if (/^max-content$/i.test(t)) {
    return true
  }
  if (/repeat\s*\(\s*auto-fit/i.test(t)) {
    return true
  }
  if (/minmax\s*\(\s*auto\s*,/i.test(t)) {
    return true
  }
  if (/\b\d*\.?\d+fr\b/i.test(t)) {
    return true
  }
  return false
}

export const gridHasAnyAutoFit = (columns: string[], rows: string[]): boolean =>
  columns.some(isAutoFitRepeatTrack) || rows.some(isAutoFitRepeatTrack)

export const autoFitCheckboxDisabled = (
  axis: "column" | "row",
  editIndex: number,
  columnTracks: string[],
  rowTracks: string[],
): { disabled: true; reason: string } | { disabled: false } => {
  const peers = axis === "column" ? columnTracks : rowTracks
  const otherPeers = peers.filter((_, i) => i !== editIndex)
  if (otherPeers.some(trackConflictsWithAutoFitPeerPolicy)) {
    return { disabled: true, reason: AUTO_FIT_DISABLED_MESSAGE }
  }
  return { disabled: false }
}

export const inferSizingTabFromTrack = (track: string): "default" | "minmax" => {
  const inner = (parseAutoFitBasisTrack(track) ?? track.trim()).trim()
  if (/^minmax\s*\(/i.test(inner)) {
    return "minmax"
  }
  return "default"
}

export type ManualGridVisualLabelKind = "fixed" | "autoFitPrimary" | "autoFitGhost"

export interface ManualGridVisualLabel {
  kind: ManualGridVisualLabelKind
  logicalIndex: number
  sourceTrack: string
  displayLabel: string
}

export const readUsedGridTemplateTracksFromComputed = (
  el: HTMLElement,
  axis: "columns" | "rows",
): string[] => {
  if (typeof window === "undefined") {
    return []
  }
  const cs = getComputedStyle(el)
  const raw = axis === "columns" ? cs.gridTemplateColumns : cs.gridTemplateRows
  const s = raw.trim()
  if (!s || s === "none") {
    return []
  }
  return sliceGridTemplateTrackList(s)
}

/**
 * Сопоставляет логические треки редактора с фактическим числом дорожек из computed style
 * (нужно для `repeat(auto-fit, …)`): первая колонка/ряд auto-fit — «основная» с иконкой, остальные — ghost.
 */
export const buildManualGridVisualLabels = (
  logical: string[],
  used: string[],
): ManualGridVisualLabel[] => {
  if (logical.length === 0) {
    return []
  }

  const fallback = (): ManualGridVisualLabel[] =>
    logical.map((t, i) => ({
      kind: "fixed" as const,
      logicalIndex: i,
      sourceTrack: t,
      displayLabel: formatGridTrackLabelForOverlay(t),
    }))

  const hasAutoFit = logical.some(isAutoFitRepeatTrack)
  const usedOk = used.length > 0 && (hasAutoFit || used.length === logical.length)
  const u = usedOk ? used : []

  if (!hasAutoFit) {
    if (u.length === logical.length) {
      return logical.map((t, i) => ({
        kind: "fixed" as const,
        logicalIndex: i,
        sourceTrack: t,
        displayLabel: formatGridTrackLabelForOverlay(t),
      }))
    }
    return fallback()
  }

  if (u.length === 0) {
    return fallback()
  }

  let vi = 0
  const out: ManualGridVisualLabel[] = []

  for (let li = 0; li < logical.length; li++) {
    const L = logical[li]!
    if (isAutoFitRepeatTrack(L)) {
      const basis = parseAutoFitBasisTrack(L) ?? "1fr"
      const displayLabel = formatGridTrackLabelForOverlay(basis)
      const tailLogical = logical.length - li - 1
      const n = Math.max(1, u.length - vi - tailLogical)
      for (let k = 0; k < n; k++) {
        out.push({
          kind: k === 0 ? "autoFitPrimary" : "autoFitGhost",
          logicalIndex: li,
          sourceTrack: L,
          displayLabel,
        })
      }
      vi += n
    } else {
      out.push({
        kind: "fixed",
        logicalIndex: li,
        sourceTrack: L,
        displayLabel: formatGridTrackLabelForOverlay(L),
      })
      vi += 1
    }
  }

  if (vi !== u.length) {
    return fallback()
  }
  return out
}

export const formatGridTrackLabelForOverlay = (track: string): string => {
  const t = track.trim()
  if (isAutoFitRepeatTrack(t)) {
    return "AUTO-FIT"
  }
  if (/^auto$/i.test(t)) {
    return "AUTO"
  }
  if (/^min-content$/i.test(t)) {
    return "MIN"
  }
  if (/^max-content$/i.test(t)) {
    return "MAX"
  }
  const frM = /^(\d+(?:\.\d+)?)fr$/i.exec(t)
  if (frM) {
    return `${frM[1]}FR`
  }
  const pxM = /^(\d+(?:\.\d+)?)px$/i.exec(t)
  if (pxM) {
    return `${pxM[1]}PX`
  }
  if (/^minmax\(/i.test(t)) {
    return "MINMAX"
  }
  if (/^1fr$/i.test(t)) {
    return "1FR"
  }
  const up = t.toUpperCase()
  return up.length <= 8 ? up : `${up.slice(0, 7)}…`
}

export const sizingControlValueFromTrack = (track: string): string => {
  const basis = parseAutoFitBasisTrack(track)
  if (basis) {
    return basis
  }
  return track.trim()
}

/** Top-level comma split inside `minmax( … )` (supports nested parens). */
export const parseMinmaxTrackPair = (trackOrBasis: string): { min: string; max: string } | undefined => {
  const t = trackOrBasis.trim()
  const openM = /^minmax\s*\(\s*(.*)\s*\)$/i.exec(t)
  if (!openM) {
    return undefined
  }
  const inner = openM[1]!
  let depth = 0
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i]!
    if (c === "(") {
      depth++
    } else if (c === ")") {
      depth--
    } else if (c === "," && depth === 0) {
      const min = inner.slice(0, i).trim()
      const max = inner.slice(i + 1).trim()
      if (min && max) {
        return { min, max }
      }
      return undefined
    }
  }
  return undefined
}

export const buildMinmaxTrack = (min: string, max: string): string =>
  `minmax(${min.trim()}, ${max.trim()})`

export const buildInitialMinmaxTrackFromBasis = (basis: string): string => {
  const b = basis.trim()
  if (!b) {
    return buildMinmaxTrack("0px", "1fr")
  }
  if (/^minmax\s*\(/i.test(b)) {
    return b
  }
  if (/^(\d+(?:\.\d+)?)\s*fr$/i.test(b)) {
    return buildMinmaxTrack("0px", b)
  }
  if (/^[\d.]+\s*px$/i.test(b)) {
    return buildMinmaxTrack(b, b)
  }
  return buildMinmaxTrack(b, "1fr")
}

export const defaultTrackToken = (axis: "column" | "row"): string =>
  axis === "column" ? "1fr" : "auto"

export const parseTracksOrFallback = (
  raw: unknown,
  axis: "column" | "row",
  countFallback: number,
): string[] => {
  const expanded = parseGridTemplateTracksExpanded(raw)
  if (expanded?.length) {
    return expanded
  }
  const d = defaultTrackToken(axis)
  return Array.from({ length: Math.max(1, countFallback) }, () => d)
}
