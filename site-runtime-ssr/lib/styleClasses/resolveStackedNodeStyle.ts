import type { ResponsiveStyle } from "../responsiveCss"
import { buildComboClassId } from "./comboClassId"
import type { StyleClassesRegistry } from "./types"

const mergeResponsiveStyles = (
  ...layers: (ResponsiveStyle | undefined)[]
): ResponsiveStyle => {
  const result: ResponsiveStyle = {}

  for (const layer of layers) {
    if (!layer) continue
    for (const [branch, branchStyle] of Object.entries(layer)) {
      if (!branchStyle || typeof branchStyle !== "object") continue
      result[branch as keyof ResponsiveStyle] = {
        ...(result[branch as keyof ResponsiveStyle] ?? {}),
        ...branchStyle,
      }
    }
  }

  return result
}


export const resolveStackedNodeStyle = (
  styleClassIds: readonly string[],
  localStyle: ResponsiveStyle | undefined,
  classes: StyleClassesRegistry,
): ResponsiveStyle | undefined => {
  if (styleClassIds.length === 0) {
    return localStyle
  }

  const memberLayers = [...styleClassIds]
    .reverse()
    .map((id) => classes[id]?.style)

  let merged = mergeResponsiveStyles(...memberLayers)

  if (styleClassIds.length >= 2) {
    const comboId = buildComboClassId(styleClassIds)
    merged = mergeResponsiveStyles(merged, classes[comboId]?.style)
  }

  return merged
}
