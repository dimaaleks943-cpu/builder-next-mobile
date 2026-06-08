import { arrayMove } from "@dnd-kit/sortable"
import backgroundImagePlaceholderUrl from "../../../../../assets/background-image.svg"
import type { PreviewViewport } from "../../../builder.enum.ts"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../../../responsiveStyle.ts"

export const BACKGROUND_IMAGE_LAYERS_KEY = "backgroundImageLayers"
export const BACKGROUND_IMAGE_LAYER_VISIBLE_KEY = "backgroundImageLayerVisible"
export const BACKGROUND_IMAGE_LAYER_IDS_KEY = "backgroundImageLayerIds"

/** Полный список значений по слоям (редактор); responsive background-* — только для видимых слоёв. */
export const BACKGROUND_IMAGE_LAYER_SIZES_KEY = "backgroundImageLayerSizes"
export const BACKGROUND_IMAGE_LAYER_POSITIONS_KEY = "backgroundImageLayerPositions"
export const BACKGROUND_IMAGE_LAYER_REPEATS_KEY = "backgroundImageLayerRepeats"
export const BACKGROUND_IMAGE_LAYER_ATTACHMENTS_KEY = "backgroundImageLayerAttachments"

/** Builder-only node props; must not leak to runtime SSR DOM. */
export const BACKGROUND_LAYER_BUILDER_KEYS = [
  BACKGROUND_IMAGE_LAYERS_KEY,
  BACKGROUND_IMAGE_LAYER_VISIBLE_KEY,
  BACKGROUND_IMAGE_LAYER_IDS_KEY,
  BACKGROUND_IMAGE_LAYER_SIZES_KEY,
  BACKGROUND_IMAGE_LAYER_POSITIONS_KEY,
  BACKGROUND_IMAGE_LAYER_REPEATS_KEY,
  BACKGROUND_IMAGE_LAYER_ATTACHMENTS_KEY,
] as const

export type BackgroundFillKind = "url" | "linear-gradient" | "radial-gradient" | "overlay"

export interface BackgroundLayersModel {
  layers: string[]
  visible: boolean[]
  layerIds: string[]
}

export interface BackgroundLayerSlots {
  sizes: string[]
  positions: string[]
  repeats: string[]
  attachments: string[]
}

export type BackgroundCommaPropKey =
  | "backgroundSize"
  | "backgroundPosition"
  | "backgroundRepeat"
  | "backgroundAttachment"

const SLOT_FIELD_BY_PROP: Record<BackgroundCommaPropKey, keyof BackgroundLayerSlots> = {
  backgroundSize: "sizes",
  backgroundPosition: "positions",
  backgroundRepeat: "repeats",
  backgroundAttachment: "attachments",
}

const SLOT_KEY_BY_PROP: Record<BackgroundCommaPropKey, string> = {
  backgroundSize: BACKGROUND_IMAGE_LAYER_SIZES_KEY,
  backgroundPosition: BACKGROUND_IMAGE_LAYER_POSITIONS_KEY,
  backgroundRepeat: BACKGROUND_IMAGE_LAYER_REPEATS_KEY,
  backgroundAttachment: BACKGROUND_IMAGE_LAYER_ATTACHMENTS_KEY,
}

const COMMA_PROP_FILLERS: Record<BackgroundCommaPropKey, string> = {
  backgroundSize: "auto",
  backgroundPosition: "0px 0px",
  backgroundRepeat: "repeat",
  backgroundAttachment: "scroll",
}

export const splitTopLevelCssCommas = (raw: string | undefined): string[] => {
  if (raw == null) return []
  const t = String(raw).trim()
  if (!t) return []
  const out: string[] = []
  let depth = 0
  let start = 0
  let inString: '"' | "'" | null = null
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    const prev = i > 0 ? t[i - 1] : ""
    if (inString) {
      if (c === inString && prev !== "\\") inString = null
      continue
    }
    if (c === '"' || c === "'") {
      inString = c
      continue
    }
    if (c === "(") depth++
    else if (c === ")") depth = Math.max(0, depth - 1)
    else if (c === "," && depth === 0) {
      const piece = t.slice(start, i).trim()
      if (piece) out.push(piece)
      start = i + 1
    }
  }
  const last = t.slice(start).trim()
  if (last) out.push(last)
  return out
}

export const joinCssCommaParts = (parts: string[]): string | undefined => {
  if (parts.length === 0) return undefined
  return parts.join(", ")
}

export const newBackgroundLayerId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `bg-layer-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const padCommaPartsToLength = (
  parts: string[],
  len: number,
  filler: string,
): string[] => {
  const out = [...parts]
  while (out.length < len) {
    out.push(out.length > 0 ? out[out.length - 1]! : filler)
  }
  return out.slice(0, len)
}

const emptyBackgroundLayerSlots = (): BackgroundLayerSlots => ({
  sizes: [],
  positions: [],
  repeats: [],
  attachments: [],
})

const readSlotArrayFromNode = (
  nodeProps: Record<string, unknown>,
  key: BackgroundCommaPropKey,
  layerCount: number,
  filler: string,
): string[] | null => {
  const slotKey = SLOT_KEY_BY_PROP[key]
  const slots = nodeProps[slotKey]
  if (!Array.isArray(slots) || slots.length !== layerCount) return null
  return slots.map((x) => {
    const s = String(x).trim()
    return s || filler
  })
}

const readCommaPropPartsFromPainted = (
  stylePropsForRead: Record<string, unknown> | undefined,
  viewport: PreviewViewport,
  key: BackgroundCommaPropKey,
  layerCount: number,
  filler: string,
): string[] => {
  const raw = stylePropsForRead
    ? getResponsiveStyleProp(stylePropsForRead, key, viewport)
    : undefined
  const split = splitTopLevelCssCommas(typeof raw === "string" ? raw : "")
  return padCommaPartsToLength(split, layerCount, filler)
}

export const ensureCanonicalSlots = (
  slots: BackgroundLayerSlots,
  stylePropsForRead: Record<string, unknown> | undefined,
  viewport: PreviewViewport,
  layerCount: number,
): BackgroundLayerSlots => {
  if (layerCount <= 0) return emptyBackgroundLayerSlots()
  return (
    Object.entries(SLOT_FIELD_BY_PROP) as [BackgroundCommaPropKey, keyof BackgroundLayerSlots][]
  ).reduce<BackgroundLayerSlots>(
    (acc, [propKey, field]) => {
      const filler = COMMA_PROP_FILLERS[propKey]
      const cur = acc[field]
      if (cur.length === layerCount) return acc
      const painted = readCommaPropPartsFromPainted(
        stylePropsForRead,
        viewport,
        propKey,
        layerCount,
        filler,
      )
      return {
        ...acc,
        [field]: cur.length > 0 ? padCommaPartsToLength(cur, layerCount, filler) : painted,
      }
    },
    { ...slots },
  )
}

export const getBackgroundLayerSlots = (
  nodeProps: Record<string, unknown>,
  stylePropsForRead: Record<string, unknown> | undefined,
  viewport: PreviewViewport,
  layerCount: number,
): BackgroundLayerSlots => {
  if (layerCount <= 0) return emptyBackgroundLayerSlots()
  const slots: BackgroundLayerSlots = {
    sizes:
      readSlotArrayFromNode(nodeProps, "backgroundSize", layerCount, "auto") ??
      readCommaPropPartsFromPainted(stylePropsForRead, viewport, "backgroundSize", layerCount, "auto"),
    positions:
      readSlotArrayFromNode(nodeProps, "backgroundPosition", layerCount, "0px 0px") ??
      readCommaPropPartsFromPainted(
        stylePropsForRead,
        viewport,
        "backgroundPosition",
        layerCount,
        "0px 0px",
      ),
    repeats:
      readSlotArrayFromNode(nodeProps, "backgroundRepeat", layerCount, "repeat") ??
      readCommaPropPartsFromPainted(stylePropsForRead, viewport, "backgroundRepeat", layerCount, "repeat"),
    attachments:
      readSlotArrayFromNode(nodeProps, "backgroundAttachment", layerCount, "scroll") ??
      readCommaPropPartsFromPainted(
        stylePropsForRead,
        viewport,
        "backgroundAttachment",
        layerCount,
        "scroll",
      ),
  }
  return ensureCanonicalSlots(slots, stylePropsForRead, viewport, layerCount)
}

export const getCommaPropParts = (
  nodeProps: Record<string, unknown>,
  stylePropsForRead: Record<string, unknown> | undefined,
  viewport: PreviewViewport,
  key: BackgroundCommaPropKey,
  layerCount: number,
  filler: string,
): string[] => {
  const fromNode = readSlotArrayFromNode(nodeProps, key, layerCount, filler)
  if (fromNode) return fromNode
  return readCommaPropPartsFromPainted(stylePropsForRead, viewport, key, layerCount, filler)
}

export const getBackgroundLayersModel = (
  props: Record<string, unknown>,
  _viewport: PreviewViewport,
): BackgroundLayersModel => {
  const storedLayers = props[BACKGROUND_IMAGE_LAYERS_KEY]
  if (!Array.isArray(storedLayers) || storedLayers.length === 0) {
    return { layers: [], visible: [], layerIds: [] }
  }

  const layers = storedLayers.map((x) => String(x).trim()).filter(Boolean)
  if (layers.length === 0) {
    return { layers: [], visible: [], layerIds: [] }
  }

  const storedVisible = props[BACKGROUND_IMAGE_LAYER_VISIBLE_KEY]
  const visible =
    Array.isArray(storedVisible) && storedVisible.length === layers.length
      ? storedVisible.map(Boolean)
      : layers.map(() => true)

  const storedIds = props[BACKGROUND_IMAGE_LAYER_IDS_KEY]
  const layerIds =
    Array.isArray(storedIds) && storedIds.length === layers.length
      ? storedIds.map((x) => String(x))
      : layers.map((_, i) => `__repair__${i}`)

  return { layers, visible, layerIds }
}

export const clearBackgroundLayerNodeMetadata = (nodeProps: Record<string, unknown>) => {
  BACKGROUND_LAYER_BUILDER_KEYS.forEach((key) => {
    delete nodeProps[key]
  })
}

export const writeBackgroundLayerNodeMetadata = (
  nodeProps: Record<string, unknown>,
  model: BackgroundLayersModel,
  slots: BackgroundLayerSlots,
) => {
  const n = model.layers.length
  if (n === 0) {
    clearBackgroundLayerNodeMetadata(nodeProps)
    return
  }
  nodeProps[BACKGROUND_IMAGE_LAYERS_KEY] = model.layers
  nodeProps[BACKGROUND_IMAGE_LAYER_VISIBLE_KEY] = model.visible
  nodeProps[BACKGROUND_IMAGE_LAYER_IDS_KEY] = model.layerIds
  nodeProps[BACKGROUND_IMAGE_LAYER_SIZES_KEY] = slots.sizes
  nodeProps[BACKGROUND_IMAGE_LAYER_POSITIONS_KEY] = slots.positions
  nodeProps[BACKGROUND_IMAGE_LAYER_REPEATS_KEY] = slots.repeats
  nodeProps[BACKGROUND_IMAGE_LAYER_ATTACHMENTS_KEY] = slots.attachments
}

export const syncPaintedBackgroundStack = (
  styleDraft: Record<string, unknown>,
  viewport: PreviewViewport,
  model: BackgroundLayersModel,
  slots: BackgroundLayerSlots,
) => {
  const n = model.layers.length
  if (n === 0) {
    setResponsiveStyleProp(styleDraft, "backgroundImage", undefined, viewport)
    setResponsiveStyleProp(styleDraft, "backgroundSize", undefined, viewport)
    setResponsiveStyleProp(styleDraft, "backgroundPosition", undefined, viewport)
    setResponsiveStyleProp(styleDraft, "backgroundRepeat", undefined, viewport)
    setResponsiveStyleProp(styleDraft, "backgroundAttachment", undefined, viewport)
    return
  }

  const visibleIndices = model.layers.map((_, i) => i).filter((i) => model.visible[i])

  if (visibleIndices.length === 0) {
    setResponsiveStyleProp(styleDraft, "backgroundImage", undefined, viewport)
    setResponsiveStyleProp(styleDraft, "backgroundSize", undefined, viewport)
    setResponsiveStyleProp(styleDraft, "backgroundPosition", undefined, viewport)
    setResponsiveStyleProp(styleDraft, "backgroundRepeat", undefined, viewport)
    setResponsiveStyleProp(styleDraft, "backgroundAttachment", undefined, viewport)
    return
  }

  const paintedImages = visibleIndices.map((i) => model.layers[i]!)
  setResponsiveStyleProp(
    styleDraft,
    "backgroundImage",
    joinCssCommaParts(paintedImages),
    viewport,
  )

  ;(
    Object.entries(SLOT_FIELD_BY_PROP) as [BackgroundCommaPropKey, keyof BackgroundLayerSlots][]
  ).forEach(([propKey, field]) => {
    const filler = COMMA_PROP_FILLERS[propKey]
    const full = slots[field].length === n
      ? slots[field].map((x) => String(x).trim() || filler)
      : padCommaPartsToLength([], n, filler)
    const painted = visibleIndices.map((i) => full[i] ?? filler)
    setResponsiveStyleProp(
      styleDraft,
      propKey,
      joinCssCommaParts(painted),
      viewport,
    )
  })
}

export const replaceSlotInLayer = (
  slots: BackgroundLayerSlots,
  key: BackgroundCommaPropKey,
  layerCount: number,
  layerIndex: number,
  next: string | undefined,
  filler: string,
) => {
  const field = SLOT_FIELD_BY_PROP[key]
  const parts = [...slots[field]]
  while (parts.length < layerCount) {
    parts.push(filler)
  }
  const safe = layerIndex >= 0 && layerIndex < parts.length ? layerIndex : 0
  parts[safe] =
    next !== undefined && String(next).trim() !== ""
      ? String(next).trim()
      : filler
  slots[field] = parts.slice(0, layerCount)
}

export const applyUrlFillLayerSlots = (
  slots: BackgroundLayerSlots,
  layerIndex: number,
  layerCount: number,
  mode: "apply" | "clear" | undefined,
) => {
  if (mode !== "apply" && mode !== "clear") return
  replaceSlotInLayer(slots, "backgroundSize", layerCount, layerIndex, "auto", "auto")
  replaceSlotInLayer(slots, "backgroundPosition", layerCount, layerIndex, "0px 0px", "0px 0px")
  replaceSlotInLayer(slots, "backgroundRepeat", layerCount, layerIndex, "repeat", "repeat")
  replaceSlotInLayer(slots, "backgroundAttachment", layerCount, layerIndex, "scroll", "scroll")
}

export const prependSlotsForNewLayer = (
  slots: BackgroundLayerSlots,
): BackgroundLayerSlots => ({
  sizes: ["auto", ...slots.sizes],
  positions: ["0px 0px", ...slots.positions],
  repeats: ["repeat", ...slots.repeats],
  attachments: ["scroll", ...slots.attachments],
})

export const removeSlotsAtLayer = (
  slots: BackgroundLayerSlots,
  removeIndex: number,
): BackgroundLayerSlots => ({
  sizes: slots.sizes.filter((_, i) => i !== removeIndex),
  positions: slots.positions.filter((_, i) => i !== removeIndex),
  repeats: slots.repeats.filter((_, i) => i !== removeIndex),
  attachments: slots.attachments.filter((_, i) => i !== removeIndex),
})

export const reorderSlotsAllLayers = (
  slots: BackgroundLayerSlots,
  fromIndex: number,
  toIndex: number,
): BackgroundLayerSlots => ({
  sizes: arrayMove(slots.sizes, fromIndex, toIndex),
  positions: arrayMove(slots.positions, fromIndex, toIndex),
  repeats: arrayMove(slots.repeats, fromIndex, toIndex),
  attachments: arrayMove(slots.attachments, fromIndex, toIndex),
})

export const bootstrapBackgroundLayersFromPaintedCss = (
  nodeProps: Record<string, unknown>,
  stylePropsForRead: Record<string, unknown>,
  viewport: PreviewViewport,
): { model: BackgroundLayersModel; slots: BackgroundLayerSlots } | null => {
  const storedLayers = nodeProps[BACKGROUND_IMAGE_LAYERS_KEY]
  if (Array.isArray(storedLayers) && storedLayers.length > 0) return null

  const rawImage = getResponsiveStyleProp(stylePropsForRead, "backgroundImage", viewport)
  if (typeof rawImage !== "string" || !rawImage.trim()) return null

  const layers = splitTopLevelCssCommas(rawImage).filter(Boolean)
  if (layers.length === 0) return null

  const n = layers.length
  return {
    model: {
      layers,
      visible: layers.map(() => true),
      layerIds: layers.map(() => newBackgroundLayerId()),
    },
    slots: {
      sizes: readCommaPropPartsFromPainted(stylePropsForRead, viewport, "backgroundSize", n, "auto"),
      positions: readCommaPropPartsFromPainted(
        stylePropsForRead,
        viewport,
        "backgroundPosition",
        n,
        "0px 0px",
      ),
      repeats: readCommaPropPartsFromPainted(
        stylePropsForRead,
        viewport,
        "backgroundRepeat",
        n,
        "repeat",
      ),
      attachments: readCommaPropPartsFromPainted(
        stylePropsForRead,
        viewport,
        "backgroundAttachment",
        n,
        "scroll",
      ),
    },
  }
}

export const parseCssUrl = (raw: string | undefined): string | null => {
  if (!raw) return null
  const t = raw.trim()
  const quoted = t.match(/^url\s*\(\s*(["'])(.*?)\1\s*\)$/i)
  if (quoted) return quoted[2]
  const unquoted = t.match(/^url\s*\(\s*([^)\s]+)\s*\)$/i)
  return unquoted ? unquoted[1].trim() : null
}

/** Дефолтная картинка при первом добавлении фона (как в legacy Craft UI). */
export const DEFAULT_PLACEHOLDER_BACKGROUND_IMAGE_URL = backgroundImagePlaceholderUrl

export const toCssBackgroundUrlValue = (href: string) => `url(${JSON.stringify(href)})`

/** Дефолтный сплошной оверлей при выборе типа overlay в редакторе фона. */
export const DEFAULT_OVERLAY_BACKGROUND_IMAGE =
  "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))"

const LEGACY_OVERLAY_RGBA_MARKER = /rgba\s*\(\s*27\s*,\s*29\s*,\s*33/i

export const extractLinearGradientBody = (raw: string): string | null => {
  const t = raw.trim()
  const exec = /^linear-gradient\s*\(/i.exec(t)
  if (!exec) return null
  const openIdx = exec.index + exec[0].length - 1
  let depth = 0
  for (let i = openIdx; i < t.length; i++) {
    const c = t[i]
    if (c === "(") depth++
    else if (c === ")") {
      depth--
      if (depth === 0) return t.slice(openIdx + 1, i).trim()
    }
  }
  return null
}

const stripTrailingGradientStopHints = (stop: string): string => {
  let s = stop.trim()
  s = s.replace(/\s+\d+(\.\d+)?%\s*$/i, "").trim()
  return s
}

const gradientStopsEqualForOverlay = (a: string, b: string): boolean =>
  stripTrailingGradientStopHints(a) === stripTrailingGradientStopHints(b)

export const isUniformOverlayLinearGradient = (raw: string): boolean => {
  const body = extractLinearGradientBody(raw)
  if (!body) return false
  const parts = splitTopLevelCssCommas(body)
  if (parts.length !== 2) return false
  return gradientStopsEqualForOverlay(parts[0]!, parts[1]!)
}

const clampUnitAlpha = (a: number): number =>
  Number.isFinite(a) ? Math.min(1, Math.max(0, a)) : 0.5

export const hexRgbToCssHex = (r: number, g: number, b: number): string => {
  const toByte = (x: number) =>
    Math.min(255, Math.max(0, Math.round(Number.isFinite(x) ? x : 0)))
    .toString(16)
    .padStart(2, "0")
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`
}

export const parseCssHexRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const h = hex.trim().replace(/^#/, "")
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(h)) return null
  const full =
    h.length === 3 ? h.split("").map((c) => `${c}${c}`).join("") : h
  const n = parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

const parseRgbFromCssColorStop = (
  stop: string,
): { r: number; g: number; b: number; a: number } | null => {
  const s = stripTrailingGradientStopHints(stop)
  let m = s.match(
    /^rgba\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i,
  )
  if (m) {
    return {
      r: Number(m[1]),
      g: Number(m[2]),
      b: Number(m[3]),
      a: clampUnitAlpha(Number(m[4])),
    }
  }
  m = s.match(/^rgb\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i)
  if (m) {
    return {
      r: Number(m[1]),
      g: Number(m[2]),
      b: Number(m[3]),
      a: 1,
    }
  }
  const hex = parseCssHexRgb(s)
  if (hex) return { ...hex, a: 1 }
  return null
}

export const parseOverlayGradientUiState = (
  raw: string | undefined,
): { hex: string; alpha: number } | null => {
  if (typeof raw !== "string" || !raw.trim()) return null
  const t = raw.trim()
  if (!/^linear-gradient\s*\(/i.test(t)) return null

  const body = extractLinearGradientBody(t)
  if (!body) return null

  if (isUniformOverlayLinearGradient(t)) {
    const parts = splitTopLevelCssCommas(body)
    const parsed = parseRgbFromCssColorStop(parts[0]!)
    if (!parsed) return null
    return {
      hex: hexRgbToCssHex(parsed.r, parsed.g, parsed.b),
      alpha: parsed.a,
    }
  }

  if (!LEGACY_OVERLAY_RGBA_MARKER.test(t)) return null

  const rgbaMatch = body.match(
    /rgba\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/i,
  )
  if (!rgbaMatch) return null
  return {
    hex: hexRgbToCssHex(
      Number(rgbaMatch[1]),
      Number(rgbaMatch[2]),
      Number(rgbaMatch[3]),
    ),
    alpha: clampUnitAlpha(Number(rgbaMatch[4])),
  }
}

export const buildUniformOverlayBackgroundImage = (
  hex: string,
  alpha: number,
): string | undefined => {
  const rgb = parseCssHexRgb(hex)
  if (!rgb) return undefined
  const a = clampUnitAlpha(alpha)
  const { r, g, b } = rgb
  return `linear-gradient(rgba(${r}, ${g}, ${b}, ${a}), rgba(${r}, ${g}, ${b}, ${a}))`
}

export const inferBackgroundFillKind = (raw: string | undefined): BackgroundFillKind => {
  if (typeof raw !== "string" || !raw.trim()) return "url"
  const t = raw.trim()
  if (/^url\s*\(/i.test(t)) return "url"
  if (/repeating-radial-gradient\s*\(/i.test(t)) return "radial-gradient"
  if (/radial-gradient\s*\(/i.test(t)) return "radial-gradient"
  if (/linear-gradient\s*\(/i.test(t)) {
    if (LEGACY_OVERLAY_RGBA_MARKER.test(t)) return "overlay"
    if (isUniformOverlayLinearGradient(t)) return "overlay"
    return "linear-gradient"
  }
  return "url"
}
