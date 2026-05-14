/** Splits a CSS grid template track list respecting parentheses. */
export const sliceGridTemplateTrackList = (input: string): string[] => {
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

const splitTopLevelComma = (inner: string): [string, string] | undefined => {
  let depth = 0
  for (let j = 0; j < inner.length; j++) {
    const c = inner[j]!
    if (c === "(") {
      depth++
    } else if (c === ")") {
      depth--
    } else if (c === "," && depth === 0) {
      return [inner.slice(0, j).trim(), inner.slice(j + 1).trim()]
    }
  }
  return undefined
}

/**
 * Expands only `repeat(<positive integer>, <track>)`. Leaves `repeat(auto-fit, …)` and invalid repeats as one track.
 */
export const expandGridRepeatTracks = (parts: string[]): string[] => {
  const out: string[] = []
  for (const part of parts) {
    const t = part.trim()
    const m = /^repeat\s*\(\s*(.+)\)\s*$/i.exec(t)
    if (!m) {
      out.push(t)
      continue
    }
    const innerAll = m[1]!.trim()
    const pair = splitTopLevelComma(innerAll)
    if (!pair) {
      out.push(t)
      continue
    }
    const [countStr, trackTpl] = pair
    const n = Number(countStr)
    if (!Number.isFinite(n) || n < 1 || !trackTpl) {
      out.push(t)
      continue
    }
    for (let k = 0; k < n; k++) {
      out.push(trackTpl)
    }
  }
  return out
}

export const parseGridTemplateTracksExpanded = (raw: unknown): string[] | undefined => {
  if (typeof raw !== "string") {
    return undefined
  }
  const s = raw.trim()
  if (!s) {
    return undefined
  }
  const parts = sliceGridTemplateTrackList(s)
  if (parts.length === 0) {
    return undefined
  }
  return expandGridRepeatTracks(parts)
}

export const parseGridTemplateColumnsCount = (raw: unknown): number | undefined =>
  parseGridTemplateTracksExpanded(raw)?.length

export const parseGridTemplateRowsCount = (raw: unknown): number | undefined =>
  parseGridTemplateTracksExpanded(raw)?.length

/** @deprecated Prefer {@link parseGridTemplateTracksExpanded} in new code. */
export const parseGridTemplateColumnTracksForManualOverlay = (
  raw: unknown,
): ("1fr" | "auto")[] | undefined => {
  const expanded = parseGridTemplateTracksExpanded(raw)
  if (!expanded?.length) {
    return undefined
  }
  const mapped = expanded.map((p) => {
    const t = p.trim()
    if (/^1fr$/i.test(t)) {
      return "1fr" as const
    }
    if (/^auto$/i.test(t)) {
      return "auto" as const
    }
    if (/^minmax\(\s*75px\s*,\s*1fr\s*\)$/i.test(t)) {
      return "1fr" as const
    }
    if (/^minmax\(\s*0\s*(?:px)?\s*,\s*1fr\s*\)$/i.test(t)) {
      return "1fr" as const
    }
    return undefined
  })
  if (mapped.some((x) => x == null)) {
    return undefined
  }
  return mapped as ("1fr" | "auto")[]
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
