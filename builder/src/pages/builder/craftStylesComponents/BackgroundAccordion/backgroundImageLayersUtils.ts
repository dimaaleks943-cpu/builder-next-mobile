import { arrayMove } from "@dnd-kit/sortable"
import type { PreviewViewport } from "../../builder.enum.ts"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../../responsiveStyle.ts"

export const BACKGROUND_IMAGE_LAYERS_KEY = "backgroundImageLayers"
export const BACKGROUND_IMAGE_LAYER_VISIBLE_KEY = "backgroundImageLayerVisible"
export const BACKGROUND_IMAGE_LAYER_IDS_KEY = "backgroundImageLayerIds"

/** Полный список значений по слоям (редактор); responsive background-* — только для видимых слоёв. */
export const BACKGROUND_IMAGE_LAYER_SIZES_KEY = "backgroundImageLayerSizes"
export const BACKGROUND_IMAGE_LAYER_POSITIONS_KEY = "backgroundImageLayerPositions"
export const BACKGROUND_IMAGE_LAYER_REPEATS_KEY = "backgroundImageLayerRepeats"
export const BACKGROUND_IMAGE_LAYER_ATTACHMENTS_KEY = "backgroundImageLayerAttachments"

export type BackgroundFillKind = "url" | "linear-gradient" | "radial-gradient" | "overlay"

export type BackgroundLayersModel = {
  layers: string[]
  visible: boolean[]
  layerIds: string[]
}

export type BackgroundCommaPropKey =
  | "backgroundSize"
  | "backgroundPosition"
  | "backgroundRepeat"
  | "backgroundAttachment"

const LAYER_STYLE_SLOT_KEYS: Record<BackgroundCommaPropKey, string> = {
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

export const ensureCanonicalStyleSlots = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
  layerCount: number,
) => {
  if (layerCount <= 0) return
  ;(
    Object.entries(LAYER_STYLE_SLOT_KEYS) as [
      BackgroundCommaPropKey,
      string,
    ][]
  ).forEach(([propKey, slotKey]) => {
    const cur = props[slotKey]
    if (Array.isArray(cur) && cur.length === layerCount) return
    const filler = COMMA_PROP_FILLERS[propKey]
    const raw = getResponsiveStyleProp(props, propKey, viewport)
    const split = splitTopLevelCssCommas(typeof raw === "string" ? raw : "")
    props[slotKey] = padCommaPartsToLength(split, layerCount, filler)
  })
}

export const deleteCanonicalStyleSlots = (props: Record<string, unknown>) => {
  delete props[BACKGROUND_IMAGE_LAYER_SIZES_KEY]
  delete props[BACKGROUND_IMAGE_LAYER_POSITIONS_KEY]
  delete props[BACKGROUND_IMAGE_LAYER_REPEATS_KEY]
  delete props[BACKGROUND_IMAGE_LAYER_ATTACHMENTS_KEY]
}

export const getCommaPropParts = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
  key: BackgroundCommaPropKey,
  layerCount: number,
  filler: string,
): string[] => {
  const slotKey = LAYER_STYLE_SLOT_KEYS[key]
  const slots = props[slotKey]
  if (Array.isArray(slots) && slots.length === layerCount) {
    return slots.map((x) => {
      const s = String(x).trim()
      return s || filler
    })
  }
  const raw = getResponsiveStyleProp(props, key, viewport)
  const split = splitTopLevelCssCommas(typeof raw === "string" ? raw : "")
  return padCommaPartsToLength(split, layerCount, filler)
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

export const syncPaintedBackgroundStack = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
  model: BackgroundLayersModel,
) => {
  const n = model.layers.length
  if (n === 0) {
    setResponsiveStyleProp(props, "backgroundImage", undefined, viewport)
    setResponsiveStyleProp(props, "backgroundSize", undefined, viewport)
    setResponsiveStyleProp(props, "backgroundPosition", undefined, viewport)
    setResponsiveStyleProp(props, "backgroundRepeat", undefined, viewport)
    setResponsiveStyleProp(props, "backgroundAttachment", undefined, viewport)
    return
  }

  ensureCanonicalStyleSlots(props, viewport, n)

  const visibleIndices = model.layers.map((_, i) => i).filter((i) => model.visible[i])

  if (visibleIndices.length === 0) {
    setResponsiveStyleProp(props, "backgroundImage", undefined, viewport)
    setResponsiveStyleProp(props, "backgroundSize", undefined, viewport)
    setResponsiveStyleProp(props, "backgroundPosition", undefined, viewport)
    setResponsiveStyleProp(props, "backgroundRepeat", undefined, viewport)
    setResponsiveStyleProp(props, "backgroundAttachment", undefined, viewport)
    return
  }

  const paintedImages = visibleIndices.map((i) => model.layers[i]!)
  setResponsiveStyleProp(
    props,
    "backgroundImage",
    joinCssCommaParts(paintedImages),
    viewport,
  )

  ;(
    Object.entries(LAYER_STYLE_SLOT_KEYS) as [
      BackgroundCommaPropKey,
      string,
    ][]
  ).forEach(([propKey, slotKey]) => {
    const filler = COMMA_PROP_FILLERS[propKey]
    const slots = props[slotKey] as string[]
    const full = Array.isArray(slots) && slots.length === n
      ? slots.map((x) => String(x).trim() || filler)
      : padCommaPartsToLength([], n, filler)
    const painted = visibleIndices.map((i) => full[i] ?? filler)
    setResponsiveStyleProp(
      props,
      propKey,
      joinCssCommaParts(painted),
      viewport,
    )
  })
}

export const persistBackgroundLayersModel = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
  model: BackgroundLayersModel,
) => {
  props[BACKGROUND_IMAGE_LAYERS_KEY] = model.layers
  props[BACKGROUND_IMAGE_LAYER_VISIBLE_KEY] = model.visible
  props[BACKGROUND_IMAGE_LAYER_IDS_KEY] = model.layerIds
  const n = model.layers.length
  if (n === 0) {
    deleteCanonicalStyleSlots(props)
    syncPaintedBackgroundStack(props, viewport, model)
    return
  }
  ensureCanonicalStyleSlots(props, viewport, n)
  syncPaintedBackgroundStack(props, viewport, model)
}

export const clearAllBackgroundLayers = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
) => {
  delete props[BACKGROUND_IMAGE_LAYERS_KEY]
  delete props[BACKGROUND_IMAGE_LAYER_VISIBLE_KEY]
  delete props[BACKGROUND_IMAGE_LAYER_IDS_KEY]
  deleteCanonicalStyleSlots(props)
  setResponsiveStyleProp(props, "backgroundImage", undefined, viewport)
  setResponsiveStyleProp(props, "backgroundSize", undefined, viewport)
  setResponsiveStyleProp(props, "backgroundPosition", undefined, viewport)
  setResponsiveStyleProp(props, "backgroundRepeat", undefined, viewport)
  setResponsiveStyleProp(props, "backgroundAttachment", undefined, viewport)
}

export const replaceCommaPropLayer = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
  key: BackgroundCommaPropKey,
  layerCount: number,
  layerIndex: number,
  next: string | undefined,
  filler: string,
) => {
  ensureCanonicalStyleSlots(props, viewport, layerCount)
  const slotKey = LAYER_STYLE_SLOT_KEYS[key]
  const parts = [...(props[slotKey] as string[])]
  const safe = layerIndex >= 0 && layerIndex < parts.length ? layerIndex : 0
  parts[safe] =
    next !== undefined && String(next).trim() !== ""
      ? String(next).trim()
      : filler
  props[slotKey] = parts
  const model = getBackgroundLayersModel(props, viewport)
  syncPaintedBackgroundStack(props, viewport, model)
}

export const prependSlotToCommaProp = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
  key: BackgroundCommaPropKey,
  previousLayerCount: number,
  newSlotValue: string,
) => {
  const slotKey = LAYER_STYLE_SLOT_KEYS[key]
  ensureCanonicalStyleSlots(props, viewport, previousLayerCount)
  const prev = [...(props[slotKey] as string[])]
  props[slotKey] = [newSlotValue, ...prev]
}

export const removeCommaPropLayerAt = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
  key: BackgroundCommaPropKey,
  layerCount: number,
  removeIndex: number,
) => {
  const slotKey = LAYER_STYLE_SLOT_KEYS[key]
  ensureCanonicalStyleSlots(props, viewport, layerCount)
  const parts = [...(props[slotKey] as string[])]
  if (removeIndex < 0 || removeIndex >= parts.length) return
  parts.splice(removeIndex, 1)
  props[slotKey] = parts
}

export const reorderCommaPropLayers = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
  key: BackgroundCommaPropKey,
  layerCount: number,
  fromIndex: number,
  toIndex: number,
) => {
  const slotKey = LAYER_STYLE_SLOT_KEYS[key]
  ensureCanonicalStyleSlots(props, viewport, layerCount)
  const parts = [...(props[slotKey] as string[])]
  const moved = arrayMove(parts, fromIndex, toIndex)
  props[slotKey] = moved
}

export const parseCssUrl = (raw: string | undefined): string | null => {
  if (!raw) return null
  const t = raw.trim()
  const quoted = t.match(/^url\s*\(\s*(["'])(.*?)\1\s*\)$/i)
  if (quoted) return quoted[2]
  const unquoted = t.match(/^url\s*\(\s*([^)\s]+)\s*\)$/i)
  return unquoted ? unquoted[1].trim() : null
}

export const inferBackgroundFillKind = (raw: string | undefined): BackgroundFillKind => {
  if (typeof raw !== "string" || !raw.trim()) return "url"
  const t = raw.trim()
  if (/^url\s*\(/i.test(t)) return "url"
  if (/radial-gradient\s*\(/i.test(t)) return "radial-gradient"
  if (/linear-gradient\s*\(/i.test(t)) {
    if (/rgba\s*\(\s*27\s*,\s*29\s*,\s*33/i.test(t)) return "overlay"
    return "linear-gradient"
  }
  return "url"
}
