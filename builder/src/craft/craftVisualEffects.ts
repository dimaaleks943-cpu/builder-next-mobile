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
