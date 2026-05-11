import { ASPECT_RATIO_CUSTOM_FALLBACK, ASPECT_RATIO_PRESET_ORDER } from "./sizeAccordion.const.ts";

export const normalizeAspectRatioKey = (raw: string): string => {
  const t = raw.trim().replace(/\s+/g, " ")
  if (!t) return ""
  const parts = t.split("/").map((p) => p.trim()).filter(Boolean)
  if (parts.length === 2) return `${parts[0]} / ${parts[1]}`
  return t
}

export const getAspectRatioSelectId = (aspectStr: string): string => {
  const trimmed = aspectStr.trim()
  if (!trimmed) return "auto"
  const key = normalizeAspectRatioKey(trimmed)
  if (key === "auto") return "auto"
  for (const preset of ASPECT_RATIO_PRESET_ORDER) {
    if (preset === "auto") continue
    if (normalizeAspectRatioKey(preset) === key) return preset
  }
  return "__custom__"
}

export const parseAspectRatioParts = (
  aspectStr: string,
): { w: string; h: string } => {
  const key = normalizeAspectRatioKey(aspectStr.trim())
  const parts = key.split("/").map((p) => p.trim()).filter(Boolean)
  if (parts.length === 2) return { w: parts[0], h: parts[1] }
  return { w: "", h: "" }
}

export const aspectRatioKeyMatchesPreset = (key: string): boolean => {
  const k = normalizeAspectRatioKey(key)
  if (!k || k === "auto") return false
  for (const preset of ASPECT_RATIO_PRESET_ORDER) {
    if (preset === "auto") continue
    if (normalizeAspectRatioKey(preset) === k) return true
  }
  return false
}

export const bumpAspectRatioOffPresets = (aspectStr: string): string => {
  let s = normalizeAspectRatioKey(aspectStr.trim())
  let guard = 0
  while (aspectRatioKeyMatchesPreset(s) && guard++ < 24) {
    const { w, h } = parseAspectRatioParts(s)
    const nw = Number(w)
    const nh = Number(h)
    if (Number.isFinite(nw) && Number.isFinite(nh) && nh !== 0) {
      s = `${nw * 2} / ${nh * 2}`
    } else {
      return ASPECT_RATIO_CUSTOM_FALLBACK
    }
  }
  return s
}

const normalizeObjectPosition = (raw: string | undefined): string =>
  raw?.trim().replace(/\s+/g, " ") ?? ""

export const splitObjectPositionDimensions = (
  raw: string | undefined,
): { x: string; y: string } => {
  const n = normalizeObjectPosition(raw)
  if (!n) return { x: "50%", y: "50%" }
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return { x: parts[0], y: "50%" }
  return { x: parts[0], y: parts[1] }
}

const axisToCssObjectPosition = (v: string | number | undefined): string => {
  if (v === undefined || v === null) return "50%"
  const s = String(v).trim()
  return s === "" ? "50%" : s
}

export const joinObjectPositionDimensions = (
  x: string | number | undefined,
  y: string | number | undefined,
): string => `${axisToCssObjectPosition(x)} ${axisToCssObjectPosition(y)}`
