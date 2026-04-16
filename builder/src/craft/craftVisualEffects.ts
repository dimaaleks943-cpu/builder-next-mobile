import type { CSSProperties } from "react"

/** Допустимые значения CSS `mix-blend-mode` для селекта «Blending». */
export type CraftMixBlendMode =
  | "normal"
  | "darken"
  | "multiply"
  | "color-burn"
  | "lighten"
  | "screen"
  | "color-dodge"
  | "overlay"
  | "soft-light"
  | "hard-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity"

export type CraftOutlineStyleMode = "none" | "solid" | "dashed"

export type CraftVisualEffectsProps = {
  mixBlendMode?: CraftMixBlendMode
  /** 0–100, в CSS: деление на 100 */
  opacityPercent?: number
  outlineStyleMode?: CraftOutlineStyleMode
  outlineWidth?: number
  outlineOffset?: number
  outlineColor?: string
}

export const CRAFT_MIX_BLEND_MODE_OPTIONS: { id: CraftMixBlendMode; value: string }[] = [
  { id: "normal", value: "Normal" },
  { id: "darken", value: "Darken" },
  { id: "multiply", value: "Multiply" },
  { id: "color-burn", value: "Color burn" },
  { id: "lighten", value: "Lighten" },
  { id: "screen", value: "Screen" },
  { id: "color-dodge", value: "Color dodge" },
  { id: "overlay", value: "Overlay" },
  { id: "soft-light", value: "Soft light" },
  { id: "hard-light", value: "Hard light" },
  { id: "difference", value: "Difference" },
  { id: "exclusion", value: "Exclusion" },
  { id: "hue", value: "Hue" },
  { id: "saturation", value: "Saturation" },
  { id: "color", value: "Color" },
  { id: "luminosity", value: "Luminosity" },
]

export const DEFAULT_MIX_BLEND_MODE: CraftMixBlendMode = "normal"
export const DEFAULT_OPACITY_PERCENT = 100
export const DEFAULT_OUTLINE_STYLE_MODE: CraftOutlineStyleMode = "none"
export const DEFAULT_OUTLINE_WIDTH = 0
export const DEFAULT_OUTLINE_OFFSET = 0
export const DEFAULT_OUTLINE_COLOR = "#000000"

/** Значения по умолчанию для `craft.props` и деструктуризации в крафтах. */
export const DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS = {
  mixBlendMode: DEFAULT_MIX_BLEND_MODE,
  opacityPercent: DEFAULT_OPACITY_PERCENT,
  outlineStyleMode: DEFAULT_OUTLINE_STYLE_MODE,
  outlineWidth: DEFAULT_OUTLINE_WIDTH,
  outlineOffset: DEFAULT_OUTLINE_OFFSET,
  outlineColor: DEFAULT_OUTLINE_COLOR,
} as const satisfies CraftVisualEffectsProps

/**
 * Inline-стили визуальных эффектов (смешивание, непрозрачность, контур).
 * При `outlineStyleMode === "none"` задаётся `outline: "none"`, чтобы сбросить пользовательский контур.
 */
export function resolveCraftVisualEffectsStyle(
  input: CraftVisualEffectsProps,
): CSSProperties {
  const mixBlendMode = input.mixBlendMode ?? DEFAULT_MIX_BLEND_MODE
  const opacity = (input.opacityPercent ?? DEFAULT_OPACITY_PERCENT) / 100
  const mode = input.outlineStyleMode ?? DEFAULT_OUTLINE_STYLE_MODE

  const base: CSSProperties = {
    mixBlendMode,
    opacity,
  }

  if (mode === "none") {
    return { ...base, outline: "none" }
  }

  const w = input.outlineWidth ?? DEFAULT_OUTLINE_WIDTH
  const o = input.outlineOffset ?? DEFAULT_OUTLINE_OFFSET
  const color = input.outlineColor ?? DEFAULT_OUTLINE_COLOR

  return {
    ...base,
    outlineStyle: mode,
    outlineWidth: `${w}px`,
    outlineOffset: `${o}px`,
    outlineColor: color,
  }
}
