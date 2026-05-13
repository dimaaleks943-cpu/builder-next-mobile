const sliceGridTemplateColumnTrackList = (input: string): string[] => {
  const tracks: string[] = []
  let i = 0
  const s = input.trim()
  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i]!)) {
      i++
    }
    if (i >= s.length) {
      break
    }
    let depth = 0
    const start = i
    while (i < s.length) {
      const c = s[i]!
      if (c === "(") {
        depth++
      } else if (c === ")") {
        depth--
      }
      if (/\s/.test(c) && depth === 0) {
        break
      }
      i++
    }
    tracks.push(s.slice(start, i).trim())
  }
  return tracks
}

const parseColumnTrackTokenForManualOverlay = (
  token: string,
): "1fr" | "auto" | undefined => {
  const t = token.trim()
  if (/^1fr$/i.test(t)) {
    return "1fr"
  }
  if (/^auto$/i.test(t)) {
    return "auto"
  }
  if (/^minmax\(\s*75px\s*,\s*1fr\s*\)$/i.test(t)) {
    return "1fr"
  }
  if (/^minmax\(\s*0\s*(?:px)?\s*,\s*1fr\s*\)$/i.test(t)) {
    return "1fr"
  }
  return undefined
}

const tryParseRepeatColumnTracks = (s: string): ("1fr" | "auto")[] | undefined => {
  const t = s.trim()
  if (!/^repeat\s*\(/i.test(t) || !t.endsWith(")")) {
    return undefined
  }
  const innerAll = t.slice(t.indexOf("(") + 1, -1).trim()
  let depth = 0
  let commaIdx = -1
  for (let j = 0; j < innerAll.length; j++) {
    const c = innerAll[j]!
    if (c === "(") {
      depth++
    } else if (c === ")") {
      depth--
    } else if (c === "," && depth === 0) {
      commaIdx = j
      break
    }
  }
  if (commaIdx < 0) {
    return undefined
  }
  const n = Number(innerAll.slice(0, commaIdx).trim())
  const inner = innerAll.slice(commaIdx + 1).trim()
  const innerTrack = parseColumnTrackTokenForManualOverlay(inner)
  if (!Number.isFinite(n) || n < 1 || innerTrack == null) {
    return undefined
  }
  return Array.from({ length: n }, () => innerTrack)
}

/** Треки колонок для оверлея ручной настройки: `auto` → визуальный min 75px только в оверлее, не в стилях узла. */
export const parseGridTemplateColumnTracksForManualOverlay = (
  raw: unknown,
): ("1fr" | "auto")[] | undefined => {
  if (typeof raw !== "string") {
    return undefined
  }
  const s = raw.trim()
  if (!s) {
    return undefined
  }

  const fromRepeat = tryParseRepeatColumnTracks(s)
  if (fromRepeat) {
    return fromRepeat
  }

  const parts = sliceGridTemplateColumnTrackList(s)
  if (parts.length === 0) {
    return undefined
  }
  const mapped = parts.map((p) => parseColumnTrackTokenForManualOverlay(p))
  if (mapped.some((m) => m == null)) {
    return undefined
  }
  return mapped as ("1fr" | "auto")[]
}

export const parseGridTemplateColumnsCount = (raw: unknown): number | undefined =>
  parseGridTemplateColumnTracksForManualOverlay(raw)?.length

export const parseGridTemplateRowsCount = (raw: unknown): number | undefined => {
  if (typeof raw !== "string") {
    return undefined
  }
  const s = raw.trim()
  if (!s) {
    return undefined
  }

  const parts = s.split(/\s+/).filter(Boolean)
  if (parts.length === 0 || !parts.every((p) => p === "auto")) {
    return undefined
  }
  return parts.length
}

/** В стили узла не попадает min 75px — только равные доли; минимум для `auto` рисуется в `OverlayGridManualEditor`. */
export const buildGridTemplateColumns = (n: number): string | undefined => {
  if (!Number.isFinite(n) || n < 1) {
    return undefined
  }
  return Array.from({ length: n }, () => "1fr").join(" ")
}

export const buildGridTemplateRows = (n: number): string | undefined => {
  if (!Number.isFinite(n) || n < 1) {
    return undefined
  }
  return Array.from({ length: n }, () => "auto").join(" ")
}
