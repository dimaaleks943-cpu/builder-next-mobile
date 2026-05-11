export type GradientAngleUnit = "deg" | "grad" | "turn" | "rad"

/** Порядок в меню как в макете: DEG, RAD, TURN, GRAD. */
export const CRAFT_GRADIENT_ANGLE_UNIT_MENU: readonly GradientAngleUnit[] = [
  "deg",
  "rad",
  "turn",
  "grad",
]

export const formatAngleInputDisplay = (v: number, unit: GradientAngleUnit): string => {
  if (unit === "rad") return String(Math.round(v * 1e6) / 1e6)
  if (unit === "turn") return String(Math.round(v * 1000) / 1000)
  return String(Math.round(v * 1000) / 1000)
}

export const TWO_PI = Math.PI * 2

export const gradientAngleUnitStep = (unit: GradientAngleUnit): number => {
  switch (unit) {
    case "deg":
      return 45
    case "grad":
      return 50
    case "turn":
      return 0.125
    case "rad":
      return Math.PI / 4
  }
}

export const gradientAngleUnitMax = (unit: GradientAngleUnit): number => {
  switch (unit) {
    case "deg":
      return 360
    case "grad":
      return 400
    case "turn":
      return 1
    case "rad":
      return TWO_PI
  }
}

/** Угол направления в градусах (0–360), 0° = вверх (CSS 0deg). */
export const normalizeAngleDeg = (deg: number): number => {
  let d = deg % 360
  if (d < 0) d += 360
  return d
}

export const degreesToUnitValue = (angleDeg: number, unit: GradientAngleUnit): number => {
  const d = normalizeAngleDeg(angleDeg)
  switch (unit) {
    case "deg":
      return d
    case "grad":
      return (d / 360) * 400
    case "turn":
      return d / 360
    case "rad":
      return (d / 360) * TWO_PI
  }
}

export const unitValueToDegrees = (value: number, unit: GradientAngleUnit): number => {
  switch (unit) {
    case "deg":
      return normalizeAngleDeg(value)
    case "grad":
      return normalizeAngleDeg((value / 400) * 360)
    case "turn":
      return normalizeAngleDeg(value * 360)
    case "rad":
      return normalizeAngleDeg((value / TWO_PI) * 360)
  }
}

export const wrapUnitValue = (value: number, unit: GradientAngleUnit): number => {
  const max = gradientAngleUnitMax(unit)
  let v = value % max
  if (v < 0) v += max
  if (unit === "deg" || unit === "grad") return Math.round(v * 1000) / 1000
  return Math.round(v * 1e9) / 1e9
}

export const formatGradientAngleCss = (value: number, unit: GradientAngleUnit): string => {
  const v =
    unit === "rad"
      ? Math.round(value * 1e6) / 1e6
      : unit === "turn"
        ? Math.round(value * 1000) / 1000
        : Math.round(value * 100) / 100
  return `${v}${unit}`
}

/** dx, dy от центра круга; ось Y вниз (экран). */
export const pointerVectorToAngleDeg = (dx: number, dy: number): number => {
  const rad = Math.atan2(dx, -dy)
  let deg = (rad * 180) / Math.PI
  if (deg < 0) deg += 360
  return normalizeAngleDeg(deg)
}

const NUMERIC_ANGLE_RE = /^(-?\d+(?:\.\d+)?)(deg|grad|turn|rad)$/i

const normalizeSideKey = (raw: string): string =>
  raw.trim().toLowerCase().replace(/\s+/g, " ")

/** Длинные ключи первыми. */
const SIDE_KEYWORD_TO_DEG: ReadonlyArray<[string, number]> = [
  ["to top right", 45],
  ["to right top", 45],
  ["to bottom right", 135],
  ["to right bottom", 135],
  ["to bottom left", 225],
  ["to left bottom", 225],
  ["to top left", 315],
  ["to left top", 315],
  ["to top", 0],
  ["to right", 90],
  ["to bottom", 180],
  ["to left", 270],
]

export type ParsedGradientAnglePrefix =
  | { kind: "none" }
  | { kind: "numeric"; angleDeg: number; unit: GradientAngleUnit }
  | { kind: "side"; raw: string; angleDeg: number }
  | { kind: "passthrough"; raw: string }

const parseNumericAngleUnit = (u: string): GradientAngleUnit | null => {
  const x = u.toLowerCase()
  if (x === "deg" || x === "grad" || x === "turn" || x === "rad") return x
  return null
}

export const parseGradientAnglePrefix = (
  anglePrefix: string | null | undefined,
): ParsedGradientAnglePrefix => {
  if (!anglePrefix?.trim()) return { kind: "none" }
  const trimmed = anglePrefix.trim()
  const numMatch = trimmed.match(NUMERIC_ANGLE_RE)
  if (numMatch) {
    const num = parseFloat(numMatch[1]!)
    const unitParsed = parseNumericAngleUnit(numMatch[2]!)
    if (!unitParsed) return { kind: "passthrough", raw: trimmed }
    return {
      kind: "numeric",
      angleDeg: unitValueToDegrees(num, unitParsed),
      unit: unitParsed,
    }
  }
  const sideKey = normalizeSideKey(trimmed)
  if (sideKey.startsWith("to ")) {
    for (const [key, deg] of SIDE_KEYWORD_TO_DEG) {
      if (sideKey === key) return { kind: "side", raw: trimmed, angleDeg: deg }
    }
    return { kind: "passthrough", raw: trimmed }
  }
  return { kind: "passthrough", raw: trimmed }
}

export type AngleCommitState = {
  anglePassthrough: string | null
  angleExplicit: boolean
  originalSideKeyword: string | null
  angleDeg: number
  angleUnit: GradientAngleUnit
}

export const buildCommittedAnglePrefix = (s: AngleCommitState): string | null => {
  if (s.anglePassthrough) return s.anglePassthrough
  if (!s.angleExplicit && s.originalSideKeyword) return s.originalSideKeyword
  if (!s.angleExplicit) return null
  const v = degreesToUnitValue(s.angleDeg, s.angleUnit)
  const wrapped = wrapUnitValue(v, s.angleUnit)
  return formatGradientAngleCss(wrapped, s.angleUnit)
}
