import type { PreviewViewport } from "../../builder.enum.ts"
import {
  getResponsiveStyleProp,
} from "../../responsiveStyle.ts"
import {
  type CraftSizeMenuToken,
  parseSizeProp,
} from "../../../../utils/craftCssSizeProp.ts"

export const BOX_SHADOW_LENGTH_UNITS: readonly CraftSizeMenuToken[] = [
  "px",
  "em",
  "rem",
  "ch",
  "vw",
  "vh",
  "svw",
  "svh",
]

export interface BoxShadowParts {
  inset: boolean
  offsetX: string
  offsetY: string
  blur: string
  spread: string
  color: string
}

export const DEFAULT_BOX_SHADOW: BoxShadowParts = {
  inset: false,
  offsetX: "0px",
  offsetY: "2px",
  blur: "5px",
  spread: "0px",
  color: "rgba(0, 0, 0, 0.2)",
}

const COLOR_TAIL_RE =
  /^(.*)\s+(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|transparent)\s*$/i

const splitShadowLayers = (s: string): string[] => {
  const layers: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === "(") depth++
    else if (c === ")" && depth > 0) depth--
    else if (c === "," && depth === 0) {
      const chunk = s.slice(start, i).trim()
      if (chunk) layers.push(chunk)
      start = i + 1
    }
  }
  const last = s.slice(start).trim()
  if (last) layers.push(last)
  return layers
}

const extractTrailingColor = (
  layer: string,
): { rest: string; color: string } | null => {
  const m = layer.trim().match(COLOR_TAIL_RE)
  if (!m) return null
  return { rest: m[1].trim(), color: m[2].trim() }
}

const normalizeShadowLengthToken = (token: string | undefined): string => {
  if (token == null || token === "") return "0px"
  const p = parseSizeProp(token)
  if (p.kind === "length") return `${p.n}${p.unit}`
  if (p.kind === "auto") return "0px"
  if (/^-?\d+(\.\d+)?$/.test(token.trim())) return `${token.trim()}px`
  return token.trim()
}

export const parseBoxShadowFromProp = (raw: unknown): BoxShadowParts => {
  const fallback = (): BoxShadowParts => ({ ...DEFAULT_BOX_SHADOW })
  if (raw == null || typeof raw !== "string") return fallback()
  const trimmed = raw.trim()
  if (trimmed === "") return fallback()

  const layer = splitShadowLayers(trimmed)[0] ?? trimmed
  let inset = false
  let color = DEFAULT_BOX_SHADOW.color
  let body = layer.trim()

  const extracted = extractTrailingColor(body)
  if (extracted) {
    body = extracted.rest
    color = extracted.color
  }

  if (/^inset\s+/i.test(body)) {
    inset = true
    body = body.replace(/^inset\s+/i, "").trim()
  }

  const tokens = body.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) {
    return { ...DEFAULT_BOX_SHADOW, inset, color }
  }

  const offsetX = normalizeShadowLengthToken(tokens[0])
  const offsetY = normalizeShadowLengthToken(tokens[1] ?? "0")
  const blur = normalizeShadowLengthToken(tokens[2] ?? "0")
  const spread = normalizeShadowLengthToken(tokens[3] ?? "0")

  return { inset, offsetX, offsetY, blur, spread, color }
}

export const buildBoxShadow = (p: BoxShadowParts): string => {
  const core = `${p.offsetX} ${p.offsetY} ${p.blur} ${p.spread} ${p.color}`.trim()
  return p.inset ? `inset ${core}` : core
}

export const commitLength = (next: string | number | undefined): string => {
  if (next == null || next === "") return "0px"
  return typeof next === "string" ? next : `${next}px`
}

/** Черновик на корне props: тень скрыта с канваса, но строка сохранена для UI и «показать». */
export const BOX_SHADOW_DRAFT_KEY = "boxShadowDraft"

export const getEffectiveBoxShadowRaw = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
): string => {
  const fromStyle = getResponsiveStyleProp(props, "boxShadow", viewport)
  if (typeof fromStyle === "string" && fromStyle.trim().length > 0) {
    return fromStyle.trim()
  }
  const draft = props[BOX_SHADOW_DRAFT_KEY]
  if (typeof draft === "string" && draft.trim().length > 0) return draft.trim()
  return ""
}

export const isBoxShadowOnCanvas = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
): boolean => {
  const fromStyle = getResponsiveStyleProp(props, "boxShadow", viewport)
  return typeof fromStyle === "string" && fromStyle.trim().length > 0
}

export const formatBoxShadowSummary = (parts: BoxShadowParts): string => {
  const kind = parts.inset ? "Inner shadow" : "Shadow"
  return `${kind}: ${parts.offsetX} ${parts.offsetY} ${parts.blur} ${parts.spread}`
}
