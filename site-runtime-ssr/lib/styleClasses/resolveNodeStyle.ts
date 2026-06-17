import type { ResponsiveStyle } from "../responsiveCss"
import { normalizeStyleClassIds } from "./styleClassIds"
import { resolveStackedNodeStyle } from "./resolveStackedNodeStyle"
import type { StyleClassesRegistry } from "./types"

const hasStyleBranches = (style: ResponsiveStyle): boolean =>
  Object.values(style).some(
    (branch) =>
      branch &&
      typeof branch === "object" &&
      Object.keys(branch as Record<string, unknown>).length > 0,
  )

export const resolveSerializedNodeStyle = (
  rawProps: Record<string, unknown>,
  _componentType: string,
  _nodeDisplayName: string | undefined,
  styleClasses: StyleClassesRegistry,
): ResponsiveStyle | undefined => {
  const styleClassIds = normalizeStyleClassIds(rawProps.styleClassIds)
  const nodeStyle = resolveStackedNodeStyle(
    styleClassIds,
    rawProps.style && typeof rawProps.style === "object"
      ? (rawProps.style as ResponsiveStyle)
      : undefined,
    styleClasses,
  )

  return nodeStyle && hasStyleBranches(nodeStyle) ? nodeStyle : undefined
}


/** Builder-only node props; must not leak to published runtime DOM. */
const BACKGROUND_LAYER_BUILDER_KEYS = [
  "backgroundImageLayers",
  "backgroundImageLayerVisible",
  "backgroundImageLayerIds",
  "backgroundImageLayerSizes",
  "backgroundImageLayerPositions",
  "backgroundImageLayerRepeats",
  "backgroundImageLayerAttachments",
] as const

/** SSR: styles come from registry CSS and orphan attribute selectors, not inline props. */
export const propsForRuntimeSsr = (
  rawProps: Record<string, unknown>,
  _componentType: string,
  _nodeDisplayName: string | undefined,
  _styleClasses: StyleClassesRegistry,
): Record<string, unknown> => {
  const props = { ...rawProps }
  delete props.styleClassIds
  delete props.style
  delete props.conditionalVisibility
  BACKGROUND_LAYER_BUILDER_KEYS.forEach((key) => {
    delete props[key]
  })
  return props
}
