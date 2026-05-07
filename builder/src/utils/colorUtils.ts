export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  let normalized = hex.trim().toLowerCase()
  if (normalized.startsWith("#")) {
    normalized = normalized.slice(1)
  }
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16)
    const g = parseInt(normalized[1] + normalized[1], 16)
    const b = parseInt(normalized[2] + normalized[2], 16)
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null
    return { r, g, b }
  }
  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16)
    const g = parseInt(normalized.slice(2, 4), 16)
    const b = parseInt(normalized.slice(4, 6), 16)
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null
    return { r, g, b }
  }
  return null
}

const clamp255 = (n: number) => Math.min(255, Math.max(0, Math.round(Number.isFinite(n) ? n : 0)))

const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0))

const toHexPair = (n: number) => clamp255(n).toString(16).padStart(2, "0")

/** Разбор цвета границы для UI: hex для color-input и альфа 0…1 */
export const parseBorderColorForUi = (raw: string | undefined): { hex: string; alpha: number } => {
  const fallback = { hex: "#000000", alpha: 1 }
  if (!raw || typeof raw !== "string") return fallback
  const s = raw.trim()

  const rgba =
    /^\s*rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+%?)\s*)?\)\s*$/i.exec(s)
  if (rgba) {
    const r = clamp255(Number(rgba[1]))
    const g = clamp255(Number(rgba[2]))
    const b = clamp255(Number(rgba[3]))
    let a = 1
    if (rgba[4] !== undefined) {
      const t = rgba[4].trim()
      a = t.endsWith("%") ? clamp01(Number(t.slice(0, -1)) / 100) : clamp01(Number(t))
    }
    return { hex: `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`, alpha: a }
  }

  const rgbOnly = /^\s*rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/i.exec(s)
  if (rgbOnly) {
    const r = clamp255(Number(rgbOnly[1]))
    const g = clamp255(Number(rgbOnly[2]))
    const b = clamp255(Number(rgbOnly[3]))
    return { hex: `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`, alpha: 1 }
  }

  let h = s.startsWith("#") ? s.slice(1) : s
  if (h.length === 8) {
    const head = hexToRgb(`#${h.slice(0, 6)}`)
    if (head) {
      const aByte = parseInt(h.slice(6, 8), 16)
      const a = Number.isNaN(aByte) ? 1 : clamp01(aByte / 255)
      return { hex: `#${toHexPair(head.r)}${toHexPair(head.g)}${toHexPair(head.b)}`, alpha: a }
    }
  }

  const fromHex = hexToRgb(s)
  if (fromHex) {
    return {
      hex: `#${toHexPair(fromHex.r)}${toHexPair(fromHex.g)}${toHexPair(fromHex.b)}`,
      alpha: 1,
    }
  }
  return fallback
}

/** Сохранение в проп: при полной непрозрачности — #rrggbb, иначе rgba(r,g,b,a) */
export const formatBorderColorWithAlpha = (hexInput: string, alpha01: number): string | null => {
  const rgb = hexToRgb(hexInput)
  if (!rgb) return null
  const a = clamp01(alpha01)
  if (a >= 1) {
    return `#${toHexPair(rgb.r)}${toHexPair(rgb.g)}${toHexPair(rgb.b)}`
  }
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`
}
