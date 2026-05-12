export type ParsedFlexFlow = {
  dir: "row" | "row-reverse" | "column" | "column-reverse"
  wrap: "nowrap" | "wrap" | "wrap-reverse"
}

const parseFlexFlowTokens = (raw: string | undefined): ParsedFlexFlow => {
  const s = (raw ?? "row").trim()
  const parts = s.split(/\s+/).filter(Boolean)
  const dirSet = new Set([
    "row",
    "row-reverse",
    "column",
    "column-reverse",
  ])
  let dir: ParsedFlexFlow["dir"] = "row"
  let wrap: ParsedFlexFlow["wrap"] = "nowrap"
  for (const p of parts) {
    if (dirSet.has(p)) {
      dir = p as ParsedFlexFlow["dir"]
    } else if (p === "wrap" || p === "nowrap" || p === "wrap-reverse") {
      wrap = p as ParsedFlexFlow["wrap"]
    }
  }
  return { dir, wrap }
}

export const isFlexFlowRowLike = (flexFlow: string) => {
  const { dir } = parseFlexFlowTokens(flexFlow)
  return dir === "row" || dir === "row-reverse"
}

/** Значение для CSS `flex-flow` (camelCase в inline style). */
export const flexFlowToCssValue = (value: string): string => String(value).trim()

export const isPrimaryRowActive = (flexFlow: string) => {
  const { dir, wrap } = parseFlexFlowTokens(flexFlow)
  return dir === "row" && wrap === "nowrap"
}

export const isPrimaryColumnActive = (flexFlow: string) => {
  const { dir, wrap } = parseFlexFlowTokens(flexFlow)
  return dir === "column" && wrap === "nowrap"
}

export const isThirdSegmentActive = (flexFlow: string) =>
  !isPrimaryRowActive(flexFlow) && !isPrimaryColumnActive(flexFlow)
