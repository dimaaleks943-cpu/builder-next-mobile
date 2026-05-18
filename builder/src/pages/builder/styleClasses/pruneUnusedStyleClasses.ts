import type { SerializedNodes } from "@craftjs/core"
import { buildComboClassId } from "./comboClassId.ts"
import { normalizeStyleClassIds } from "./styleClassIds.ts"
import type { StyleClassesRegistry } from "./types.ts"

export const collectUsedStyleClassIds = (nodes: SerializedNodes): Set<string> => {
  const used = new Set<string>()
  for (const [nodeId, node] of Object.entries(nodes)) {
    if (nodeId === "ROOT") continue
    const props = node.props as Record<string, unknown> | undefined
    const ids = normalizeStyleClassIds(props?.styleClassIds)
    for (const id of ids) {
      used.add(id)
    }
    if (ids.length >= 2) {
      used.add(buildComboClassId(ids))
    }
  }
  return used
}

/** Keeps only style classes referenced by at least one craft node (including derived combos). */
export const pruneUnusedStyleClasses = (
  registry: StyleClassesRegistry,
  nodes: SerializedNodes,
): StyleClassesRegistry => {
  const used = collectUsedStyleClassIds(nodes)
  if (used.size === 0) {
    return {}
  }
  const next: StyleClassesRegistry = {}
  for (const id of used) {
    const definition = registry[id]
    if (definition) {
      next[id] = definition
    }
  }
  return next
}
