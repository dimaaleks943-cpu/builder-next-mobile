import type { ResponsiveStyle } from "../responsiveStyle.ts"
import { normalizeStyleClassIds } from "./styleClassIds.ts"
import type { StyleClassesRegistry } from "./types.ts"
import { buildComboClassId } from "./comboClassId.ts";

/** Deep-merge responsive branches; later layers win per viewport key. */
const mergeResponsiveStyles = (...layers: (ResponsiveStyle | undefined)[]): ResponsiveStyle => {
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


/**
 * Cascade: members in styleClassIds order (index 0 = highest priority among bases),
 * then combo overrides when length >= 2. Empty stack → local props.style.
 */
const resolveStackedNodeStyle = (
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

export const pickNodeResponsiveStyle = (
  styleClassIds: string[] | null | undefined,
  localStyle: ResponsiveStyle | undefined,
  classes: StyleClassesRegistry,
): ResponsiveStyle | undefined => resolveStackedNodeStyle(normalizeStyleClassIds(styleClassIds), localStyle, classes)
