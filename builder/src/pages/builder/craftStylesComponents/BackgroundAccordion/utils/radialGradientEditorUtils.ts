import { splitTopLevelCssCommas } from "./backgroundImageLayersUtils.ts"
import {
  gradientStopToCssSegment,
  parseColorStopSegment,
  sortStopsByPosition,
  type LinearGradientUiStop,
} from "./linearGradientEditorUtils.ts"

/** Размер ending-shape в UI (все варианты с ключевым словом `circle`). */
export const RADIAL_ENDING_SIZE_IDS = [
  "closest-side",
  "closest-corner",
  "farthest-side",
  "circle",
] as const

export type RadialEndingSizeUi = (typeof RADIAL_ENDING_SIZE_IDS)[number]

export type ParsedRadialGradient = {
  repeating: boolean
  /** Первый аргумент до color-stops (`circle`, `circle at 50% 100%`, …) или null если заданы только стопы. */
  shapeHead: string | null
  stops: { color: string; position: number | null }[]
}

export const DEFAULT_TWO_STOP_RADIAL: ParsedRadialGradient = {
  repeating: false,
  shapeHead: "circle",
  stops: [
    { color: "black", position: null },
    { color: "white", position: null },
  ],
}

const isRadialShapeHeadSegment = (seg: string): boolean => {
  const s = seg.trim().toLowerCase()
  return s === "circle" || s === "ellipse" || s.startsWith("circle ") || s.startsWith("ellipse ")
}

export const parseRadialGradientValue = (raw: string | undefined): ParsedRadialGradient | null => {
  if (typeof raw !== "string") return null
  const t = raw.trim()
  const repeating = /^repeating-radial-gradient\s*\(/i.test(t)
  const isRadial = /^radial-gradient\s*\(/i.test(t) || repeating
  if (!isRadial) return null
  const openParen = t.indexOf("(")
  const closeParen = t.lastIndexOf(")")
  if (openParen < 0 || closeParen <= openParen) return null
  const inner = t.slice(openParen + 1, closeParen).trim()
  const parts = splitTopLevelCssCommas(inner).map((x) => x.trim()).filter(Boolean)
  if (parts.length < 2) return null

  let shapeHead: string | null = null
  let stopParts = parts
  if (isRadialShapeHeadSegment(parts[0] ?? "")) {
    shapeHead = parts[0]!.trim()
    stopParts = parts.slice(1)
  }
  if (stopParts.length < 2) return null

  const stops = stopParts.map((p) => {
    const { color, percent } = parseColorStopSegment(p)
    return { color, position: percent }
  })

  return { repeating, shapeHead, stops }
}

/** Размер из первого аргумента radial-gradient (поддержка только ключей из редактора). */
export const parseRadialEndingSizeFromShapeHead = (
  shapeHead: string | null,
): RadialEndingSizeUi => {
  if (!shapeHead?.trim()) return "circle"
  const s = shapeHead.trim().toLowerCase()
  if (/\bclosest-corner\b/.test(s)) return "closest-corner"
  if (/\bclosest-side\b/.test(s)) return "closest-side"
  if (/\bfarthest-side\b/.test(s)) return "farthest-side"
  return "circle"
}

/** Пара left/top для UI (CraftSettings / nine grid); при отсутствии `at` — центр холста. */
export const radialShapeHeadToPositionPair = (
  shapeHead: string | null,
): { x: string; y: string } => {
  if (!shapeHead?.trim()) return { x: "50%", y: "50%" }
  const m = shapeHead.trim().match(/\s+at\s+(.+)$/i)
  if (!m?.[1]) return { x: "50%", y: "50%" }
  const tokens = m[1].trim().split(/\s+/).filter(Boolean)
  if (tokens.length >= 2) return { x: tokens[0]!, y: tokens[1]! }
  return { x: "50%", y: "50%" }
}

const bothAxisCenterDefault = (x: string, y: string): boolean => {
  const xt = x.trim().toLowerCase()
  const yt = y.trim().toLowerCase()
  return (xt === "50%" || xt === "center") && (yt === "50%" || yt === "center")
}

const endingSizeToShapePrefix = (size: RadialEndingSizeUi): string => {
  switch (size) {
    case "closest-side":
      return "circle closest-side"
    case "closest-corner":
      return "circle closest-corner"
    case "farthest-side":
      return "circle farthest-side"
    case "circle":
      return "circle"
  }
}

/** Первый аргумент radial-gradient: размер ending-shape + при необходимости `at` позиция. */
export const buildRadialShapeHeadFromUi = (
  size: RadialEndingSizeUi,
  x: string,
  y: string,
): string => {
  const base = endingSizeToShapePrefix(size)
  if (bothAxisCenterDefault(x, y)) return base
  return `${base} at ${x.trim()} ${y.trim()}`
}

export const buildRadialGradientCss = (model: {
  repeating: boolean
  shapeHead: string | null
  stops: LinearGradientUiStop[]
}): string => {
  const fn = model.repeating ? "repeating-radial-gradient" : "radial-gradient"
  const shape =
    model.shapeHead?.trim() && model.shapeHead.trim().length > 0
      ? model.shapeHead.trim()
      : "circle"
  const ordered = sortStopsByPosition(model.stops)
  const n = ordered.length
  const pieces: string[] = [shape]
  ordered.forEach((s, i) => {
    pieces.push(gradientStopToCssSegment(s, i, n))
  })
  return `${fn}(${pieces.join(", ")})`
}
