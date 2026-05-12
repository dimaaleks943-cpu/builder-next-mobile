export const isFlexDisplay = (display: string | undefined): boolean => {
  const d = display ?? "block"
  return d === "flex" || d === "inline-flex"
}

export const isGridDisplay = (display: string | undefined): boolean => {
  const d = display ?? "block"
  return d === "grid" || d === "inline-grid"
}
