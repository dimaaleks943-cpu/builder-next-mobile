export type RnFlexDirection = "row" | "row-reverse" | "column" | "column-reverse"
export type RnFlexWrap = "wrap" | "nowrap" | "wrap-reverse"

export const flexFlowToRn = (
  raw: string | undefined,
): { flexDirection: RnFlexDirection; flexWrap: RnFlexWrap } => {
  const s = (raw ?? "row").trim() || "row"
  const parts = s.split(/\s+/).filter(Boolean)
  const dirSet = new Set(["row", "row-reverse", "column", "column-reverse"])
  let flexDirection: RnFlexDirection = "row"
  let flexWrap: RnFlexWrap = "nowrap"
  for (const p of parts) {
    if (dirSet.has(p)) {
      flexDirection = p as RnFlexDirection
    } else if (p === "wrap" || p === "nowrap" || p === "wrap-reverse") {
      flexWrap = p as RnFlexWrap
    }
  }
  return { flexDirection, flexWrap }
}
