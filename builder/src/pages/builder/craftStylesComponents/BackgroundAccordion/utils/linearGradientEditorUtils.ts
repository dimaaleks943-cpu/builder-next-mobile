import { COLORS } from "../../../../../theme/colors.ts"
import { splitTopLevelCssCommas } from "./backgroundImageLayersUtils.ts"

export type ParsedLinearGradient = {
  repeating: boolean
  anglePrefix: string | null
  stops: { color: string; position: number | null }[]
}

export const DEFAULT_TWO_STOP_LINEAR: ParsedLinearGradient = {
  repeating: false,
  anglePrefix: null,
  stops: [
    { color: "black", position: null },
    { color: "white", position: null },
  ],
}

export type LinearGradientUiStop = {
  id: string
  color: string
  position: number
}

export const newGradientStopId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `gstop-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const sortStopsByPosition = (stops: LinearGradientUiStop[]): LinearGradientUiStop[] =>
  [...stops].sort((a, b) =>
    a.position !== b.position ? a.position - b.position : a.id.localeCompare(b.id),
  )

const isAngleOrSideToken = (raw: string): boolean => {
  const t = raw.trim()
  if (/^-?\d+(?:\.\d+)?(deg|grad|turn|rad)$/i.test(t)) return true
  if (/^to\s+/i.test(t)) return true
  return false
}

/** Разбор одной color-stop с учётом скобок в rgb()/hsl(). */
export const parseColorStopSegment = (raw: string): { color: string; percent: number | null } => {
  const t = raw.trim()
  let depth = 0
  for (let i = t.length - 1; i >= 0; i--) {
    const c = t[i]
    if (c === ")") depth++
    else if (c === "(") depth--
    else if (depth === 0 && c === "%") {
      let j = i - 1
      while (j >= 0 && /\s/.test(t[j] ?? "")) j--
      let k = j
      while (k >= 0 && /[\d.]/.test(t[k] ?? "")) k--
      const numStr = t.slice(k + 1, j + 1).trim()
      if (/^\d+(?:\.\d+)?$/.test(numStr)) {
        const colorPart = t.slice(0, k + 1).trim()
        if (colorPart.length > 0) {
          return { color: colorPart, percent: parseFloat(numStr) }
        }
      }
    }
  }
  return { color: t, percent: null }
}

export const normalizeStopsForUi = (
  stops: { color: string; position: number | null }[],
): LinearGradientUiStop[] =>
  stops.map((s, i, arr) => ({
    id: newGradientStopId(),
    color: s.color.trim(),
    position:
      s.position ??
      (i === 0 ? 0 : i === arr.length - 1 ? 100 : (100 * i) / (arr.length - 1)),
  }))

export const parseLinearGradientValue = (raw: string | undefined): ParsedLinearGradient | null => {
  if (typeof raw !== "string") return null
  const t = raw.trim()
  const repeating = /^repeating-linear-gradient\s*\(/i.test(t)
  const isLinear = /^linear-gradient\s*\(/i.test(t) || repeating
  if (!isLinear) return null
  const openParen = t.indexOf("(")
  const closeParen = t.lastIndexOf(")")
  if (openParen < 0 || closeParen <= openParen) return null
  const inner = t.slice(openParen + 1, closeParen).trim()
  const parts = splitTopLevelCssCommas(inner).map((x) => x.trim()).filter(Boolean)
  if (parts.length < 2) return null

  let anglePrefix: string | null = null
  let startIdx = 0
  if (isAngleOrSideToken(parts[0] ?? "")) {
    anglePrefix = parts[0]!.trim()
    startIdx = 1
  }

  const stopParts = parts.slice(startIdx)
  if (stopParts.length < 2) return null

  const stops = stopParts.map((p) => {
    const { color, percent } = parseColorStopSegment(p)
    return { color, position: percent }
  })

  return { repeating, anglePrefix, stops }
}

export const gradientStopToCssSegment = (
  stop: LinearGradientUiStop,
  index: number,
  total: number,
): string => {
  const isFirst = index === 0
  const isLast = index === total - 1
  const { color, position: pos } = stop
  const c = color.trim()
  const needsPercent =
    (!isFirst && !isLast) || (isFirst && pos !== 0) || (isLast && pos !== 100)
  return needsPercent ? `${c} ${pos}%` : c
}

export const buildLinearGradientCss = (model: {
  repeating: boolean
  anglePrefix: string | null
  stops: LinearGradientUiStop[]
}): string => {
  const fn = model.repeating ? "repeating-linear-gradient" : "linear-gradient"
  const pieces: string[] = []
  if (model.anglePrefix?.trim()) {
    pieces.push(model.anglePrefix.trim())
  }
  const ordered = sortStopsByPosition(model.stops)
  const n = ordered.length
  ordered.forEach((s, i) => {
    pieces.push(gradientStopToCssSegment(s, i, n))
  })
  return `${fn}(${pieces.join(", ")})`
}

/** Превью полосы редактора: у каждого стопа явный процент; направление задаётся angleCss (например 75deg). */
export const buildHorizontalLinearGradientTrackPreviewCss = (model: {
  repeating: boolean
  stops: LinearGradientUiStop[]
  angleCss: string
}): string => {
  const fn = model.repeating ? "repeating-linear-gradient" : "linear-gradient"
  const ordered = sortStopsByPosition(model.stops)
  const segments = ordered.map((s) => `${s.color.trim()} ${s.position}%`)
  const angle = model.angleCss.trim()
  return `${fn}(${angle}, ${segments.join(", ")})`
}

export const clampPercent = (v: number): number => Math.min(100, Math.max(0, v))

const SAMPLE_CANVAS_WIDTH = 1001

/** Цвет линейного градиента (to right) в точке percent для вставки нового стопа. */
export const sampleLinearGradientColorAtPercent = (
  stops: LinearGradientUiStop[],
  percent: number,
): string => {
  if (typeof document === "undefined") return COLORS.black
  const ordered = sortStopsByPosition(stops)
  if (ordered.length === 0) return COLORS.black
  const canvas = document.createElement("canvas")
  canvas.width = SAMPLE_CANVAS_WIDTH
  canvas.height = 1
  const ctx = canvas.getContext("2d")
  if (!ctx) return COLORS.black
  const grd = ctx.createLinearGradient(0, 0, SAMPLE_CANVAS_WIDTH, 0)
  ordered.forEach((s) => {
    const t = clampPercent(s.position) / 100
    grd.addColorStop(t, s.color.trim() || COLORS.black)
  })
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, SAMPLE_CANVAS_WIDTH, 1)
  const x = Math.round((clampPercent(percent) / 100) * (SAMPLE_CANVAS_WIDTH - 1))
  const { data } = ctx.getImageData(x, 0, 1, 1)
  return `rgb(${data[0]}, ${data[1]}, ${data[2]})`
}
