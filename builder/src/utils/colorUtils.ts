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

export const withOpacity = (color: string, opacity: number): string => {
  const rgb = hexToRgb(color)
  if (!rgb) return color
  const clamped = Math.min(1, Math.max(0, opacity))
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamped})`
}
