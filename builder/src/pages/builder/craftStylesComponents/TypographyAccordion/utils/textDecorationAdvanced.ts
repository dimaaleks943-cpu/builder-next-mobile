export type TextDecorationLinePreset =
  | "none"
  | "strikethrough"
  | "underline"
  | "overline"
  | "underline_overline"
  | "underline_strikethrough"
  | "overline_strikethrough"
  | "all"

type TextDecorationStyleKeyword =
  | "solid"
  | "double"
  | "dotted"
  | "dashed"
  | "wavy"

export interface TextDecorationAdvancedParts {
  line: TextDecorationLinePreset;
  style: TextDecorationStyleKeyword | undefined;
  thicknessPx: string;
  color: string;
}

const STYLE_KEYWORDS: readonly TextDecorationStyleKeyword[] = [
  "wavy",
  "dashed",
  "dotted",
  "double",
  "solid",
] as const

const defaultTextDecorationAdvancedParts = (): TextDecorationAdvancedParts => ({
    line: "none",
    style: undefined,
    thicknessPx: "",
    color: "",
  })

const linePresetToCss = (preset: TextDecorationLinePreset): string => {
  switch (preset) {
    case "none":
      return ""
    case "strikethrough":
      return "line-through"
    case "underline":
      return "underline"
    case "overline":
      return "overline"
    case "underline_overline":
      return "underline overline"
    case "underline_strikethrough":
      return "underline line-through"
    case "overline_strikethrough":
      return "overline line-through"
    case "all":
      return "underline overline line-through"
  }
}

const detectLinePreset = (
  hasUnderline: boolean,
  hasOverline: boolean,
  hasLineThrough: boolean,
): TextDecorationLinePreset => {
  if (hasUnderline && hasOverline && hasLineThrough) return "all"
  if (hasUnderline && hasOverline) return "underline_overline"
  if (hasUnderline && hasLineThrough) return "underline_strikethrough"
  if (hasOverline && hasLineThrough) return "overline_strikethrough"
  if (hasUnderline) return "underline"
  if (hasOverline) return "overline"
  if (hasLineThrough) return "strikethrough"
  return "none"
}

export const parseTextDecorationAdvanced = (
  raw: string | undefined,
): TextDecorationAdvancedParts => {
  const empty = defaultTextDecorationAdvancedParts()
  if (!raw || typeof raw !== "string") return empty
  const t = raw.trim()
  if (t === "" || /^none$/i.test(t)) return empty

  let rest = t
  let color = ""

  const rgbaEnd = rest.match(
    /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+\s*)?\)\s*$/i,
  )
  if (rgbaEnd && rgbaEnd.index !== undefined) {
    color = rgbaEnd[0].trim()
    rest = rest.slice(0, rgbaEnd.index).trim()
  } else {
    const hslEnd = rest.match(/hsla?\([^)]*\)\s*$/i)
    if (hslEnd && hslEnd.index !== undefined) {
      color = hslEnd[0].trim()
      rest = rest.slice(0, hslEnd.index).trim()
    } else {
      const hexEnd = rest.match(/#[0-9a-fA-F]{3,8}\s*$/)
      if (hexEnd && hexEnd.index !== undefined) {
        color = hexEnd[0].trim()
        rest = rest.slice(0, hexEnd.index).trim()
      }
    }
  }

  let thicknessPx = ""
  const pxMatch = rest.match(/\b(\d+(?:\.\d+)?)px\b/i)
  if (pxMatch) {
    thicknessPx = pxMatch[1]
    rest = rest.replace(pxMatch[0], " ").replace(/\s+/g, " ").trim()
  }

  let style: TextDecorationStyleKeyword | undefined
  for (const st of STYLE_KEYWORDS) {
    const re = new RegExp(`\\b${st}\\b`, "i")
    if (re.test(rest)) {
      style = st
      rest = rest.replace(re, " ").replace(/\s+/g, " ").trim()
      break
    }
  }

  const hasUnderline = /\bunderline\b/i.test(rest)
  const hasOverline = /\boverline\b/i.test(rest)
  const hasLineThrough = /\bline-through\b/i.test(rest)

  return {
    line: detectLinePreset(hasUnderline, hasOverline, hasLineThrough),
    style,
    thicknessPx,
    color,
  }
}

export const buildTextDecorationAdvanced = (
  parts: TextDecorationAdvancedParts,
): string | undefined => {
  if (parts.line === "none") return undefined

  const chunks: string[] = [linePresetToCss(parts.line)]

  const thick = parts.thicknessPx.trim()
  if (thick !== "") {
    const n = Number(thick)
    if (Number.isFinite(n) && n >= 0) {
      chunks.push(`${n}px`)
    }
  }

  if (parts.style && parts.style !== "solid") {
    chunks.push(parts.style)
  }

  const col = parts.color.trim()
  if (col !== "") {
    chunks.push(col)
  }

  return chunks.join(" ")
}
