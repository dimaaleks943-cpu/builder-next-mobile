/** Full track list: 1fr, or 1fr + minmax(75px, 1fr) repeated (spaces inside minmax allowed). */
const EXPLICIT_COLUMNS_TRACK_LIST =
  /^1fr(?:\s+minmax\(\s*75px\s*,\s*1fr\s*\))*$/i

const MINMAX_75_1FR = /minmax\(\s*75px\s*,\s*1fr\s*\)/gi

export const parseGridTemplateColumnsCount = (
  raw: unknown,
): number | undefined => {
  if (typeof raw !== "string") return undefined
  const s = raw.trim()
  if (!s) return undefined

  if (!EXPLICIT_COLUMNS_TRACK_LIST.test(s)) return undefined
  const minmaxTracks = s.match(MINMAX_75_1FR)
  return 1 + (minmaxTracks?.length ?? 0)
}

export const parseGridTemplateRowsCount = (raw: unknown): number | undefined => {
  if (typeof raw !== "string") return undefined
  const s = raw.trim()
  if (!s) return undefined

  const parts = s.split(/\s+/).filter(Boolean)
  if (parts.length === 0 || !parts.every((p) => p === "auto")) return undefined
  return parts.length
}

export const buildGridTemplateColumns = (n: number): string | undefined => {
  if (!Number.isFinite(n) || n < 1) return undefined
  if (n === 1) return "1fr"
  const tail = Array.from({ length: n - 1 }, () => "minmax(75px, 1fr)")
  return ["1fr", ...tail].join(" ")
}

export const buildGridTemplateRows = (n: number): string | undefined => {
  if (!Number.isFinite(n) || n < 1) return undefined
  return Array.from({ length: n }, () => "auto").join(" ")
}
