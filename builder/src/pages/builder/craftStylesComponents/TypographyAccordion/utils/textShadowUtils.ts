import type { PreviewViewport } from "../../../builder.enum.ts"
import { getResponsiveStyleProp } from "../../../responsiveStyle.ts"
import {
  normalizeShadowLengthToken,
} from "../../EffectsAccordion/boxShadowUtils.ts"

export interface TextShadowParts {
  offsetX: string
  offsetY: string
  blur: string
  color: string
}

export const DEFAULT_TEXT_SHADOW: TextShadowParts = {
  offsetX: "0px",
  offsetY: "2px",
  blur: "4px",
  color: "rgba(0, 0, 0, 0.25)",
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

export const parseTextShadowFromProp = (raw: unknown): TextShadowParts => {
  const fallback = (): TextShadowParts => ({ ...DEFAULT_TEXT_SHADOW })
  if (raw == null || typeof raw !== "string") return fallback()
  const trimmed = raw.trim()
  if (trimmed === "") return fallback()

  const layer = splitShadowLayers(trimmed)[0] ?? trimmed
  let color = DEFAULT_TEXT_SHADOW.color
  let body = layer.trim()

  const extracted = extractTrailingColor(body)
  if (extracted) {
    body = extracted.rest
    color = extracted.color
  }

  const tokens = body.split(/\s+/).filter(Boolean)
  const offsetX = normalizeShadowLengthToken(tokens[0])
  const offsetY = normalizeShadowLengthToken(tokens[1] ?? "0")
  const blur = normalizeShadowLengthToken(tokens[2] ?? "0")

  return { offsetX, offsetY, blur, color }
}

export const buildTextShadow = (p: TextShadowParts): string =>
  `${p.offsetX} ${p.offsetY} ${p.blur} ${p.color}`.trim()

export const TEXT_SHADOW_DRAFT_KEY = "textShadowDraft"

export const getEffectiveTextShadowRaw = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
): string => {
  const fromStyle = getResponsiveStyleProp(props, "textShadow", viewport)
  if (typeof fromStyle === "string" && fromStyle.trim().length > 0) {
    return fromStyle.trim()
  }
  const draft = props[TEXT_SHADOW_DRAFT_KEY]
  if (typeof draft === "string" && draft.trim().length > 0) return draft.trim()
  return ""
}

export const isTextShadowOnCanvas = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
): boolean => {
  const fromStyle = getResponsiveStyleProp(props, "textShadow", viewport)
  return typeof fromStyle === "string" && fromStyle.trim().length > 0
}

export const formatTextShadowSummary = (parts: TextShadowParts): string =>
  `${parts.offsetX} ${parts.offsetY} ${parts.blur}`

export const textShadowFieldDiffersFromDefault = (
  key: keyof TextShadowParts,
  parts: TextShadowParts,
): boolean => {
  if (key === "color") {
    return parts.color.trim() !== DEFAULT_TEXT_SHADOW.color.trim()
  }
  return (
    normalizeShadowLengthToken(parts[key]) !==
    normalizeShadowLengthToken(DEFAULT_TEXT_SHADOW[key])
  )
}
