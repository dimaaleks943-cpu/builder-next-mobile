/**
 * Width/height size props for craft blocks.
 *
 * **Web:** pixel lengths are stored as CSS strings (`"120px"`), same shape as
 * `%`, `em`, etc. Bare `number` in JSON is treated as px when reading (legacy).
 *
 * **RN:** pixel lengths use numeric dip values (`120`); `%` and `auto` stay strings.
 */

export const CSS_SIZE_UNITS_WEB = [
  "px",
  "%",
  "em",
  "rem",
  "ch",
  "vw",
  "vh",
  "svw",
  "svh",
] as const

export type CssSizeUnit = (typeof CSS_SIZE_UNITS_WEB)[number]

/** RN: only units StyleSheet can rely on; no vw/vh emulation. */
export const CSS_SIZE_UNITS_RN = ["px", "%", "auto"] as const

export type CraftSizeMenuToken = CssSizeUnit | "auto"

export const CRAFT_SIZE_MENU_UNITS_WEB: readonly CraftSizeMenuToken[] = [
  ...CSS_SIZE_UNITS_WEB,
  "auto",
]

const LENGTH_RE =
  /^(-?(?:\d+\.?\d*|\.\d+))(px|%|em|rem|ch|vw|vh|svw|svh)$/i

const NUM_ONLY_RE = /^-?(?:\d+\.?\d*|\.\d+)$/

export type ParsedCraftSize =
  | { kind: "empty" }
  | { kind: "auto" }
  | { kind: "length"; n: string; unit: CssSizeUnit }
  | { kind: "raw"; text: string }

export const parseSizeProp = (value: unknown): ParsedCraftSize => {
  if (value === undefined || value === null) {
    return { kind: "empty" }
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return { kind: "empty" }
    return { kind: "length", n: trimNumericString(String(value)), unit: "px" }
  }

  if (typeof value !== "string") {
    return { kind: "empty" }
  }

  const t = value.trim()
  if (t === "") return { kind: "empty" }
  if (/^auto$/i.test(t)) return { kind: "auto" }

  const m = t.match(LENGTH_RE)
  if (m) {
    const unit = m[2].toLowerCase() as CssSizeUnit
    return { kind: "length", n: trimNumericString(m[1]), unit }
  }

  if (NUM_ONLY_RE.test(t)) {
    return { kind: "length", n: trimNumericString(t), unit: "px" }
  }

  return { kind: "raw", text: value }
}

function trimNumericString(s: string): string {
  if (/^\./.test(s)) return `0${s}`
  if (/\.$/.test(s)) return s.slice(0, -1)
  return s
}

export type FormatSizePropMode = "web" | "rn"

/** Serializes a parsed size for `node.data.props` (undefined clears the key). */
export const formatSizeProp = (
  parsed: ParsedCraftSize,
  mode: FormatSizePropMode = "web",
): string | number | undefined => {
  if (parsed.kind === "empty") return undefined
  if (parsed.kind === "auto") return "auto"
  if (parsed.kind === "raw") {
    const s = parsed.text.trim()
    return s === "" ? undefined : s
  }

  const { n, unit } = parsed
  if (n === "" || !NUM_ONLY_RE.test(n)) return undefined

  if (unit === "px" && mode === "rn") {
    const num = Number(n)
    return Number.isFinite(num) ? num : undefined
  }

  if (unit === "px") {
    return `${n}px`
  }

  if (unit === "%") {
    return `${n}%`
  }

  return `${n}${unit}`
}

export type CraftSizeMenuSelection = CraftSizeMenuToken | "custom"

/** Merges numeric input with the unit chip into a value to commit. */
export const parseInputWithUnit = (
  inputText: string,
  menuSelection: CraftSizeMenuSelection,
): ParsedCraftSize => {
  if (menuSelection === "auto") {
    return { kind: "auto" }
  }

  const t = inputText.trim()
  if (t === "") return { kind: "empty" }
  if (/^auto$/i.test(t)) return { kind: "auto" }

  const lengthMatch = t.match(LENGTH_RE)
  if (lengthMatch) {
    const unit = lengthMatch[2].toLowerCase() as CssSizeUnit
    return {
      kind: "length",
      n: trimNumericString(lengthMatch[1]),
      unit,
    }
  }

  if (menuSelection === "custom") {
    return { kind: "raw", text: inputText }
  }

  if (!NUM_ONLY_RE.test(t)) {
    return { kind: "raw", text: inputText }
  }

  return {
    kind: "length",
    n: trimNumericString(t),
    unit: menuSelection as CssSizeUnit,
  }
}

export const unitTokenLabel = (token: CraftSizeMenuToken): string => {
  switch (token) {
    case "px":
      return "PX"
    case "%":
      return "%"
    case "em":
      return "EM"
    case "rem":
      return "REM"
    case "ch":
      return "CH"
    case "vw":
      return "VW"
    case "vh":
      return "VH"
    case "svw":
      return "SVW"
    case "svh":
      return "SVH"
    case "auto":
      return "AUTO"
    default:
      return String(token).toUpperCase()
  }
}
