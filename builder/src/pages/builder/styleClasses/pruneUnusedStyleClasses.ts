import type { SerializedNodes } from "@craftjs/core"
import type { StyleClassesRegistry } from "./types.ts"

export const collectUsedStyleClassIds = (nodes: SerializedNodes): Set<string> => {
  const used = new Set<string>()
  for (const [nodeId, node] of Object.entries(nodes)) {
    if (nodeId === "ROOT") continue
    const classId = (node.props as Record<string, unknown> | undefined)?.styleClassId
    if (typeof classId === "string" && classId.length > 0) {
      used.add(classId)
    }
  }
  return used
}

/** Keeps only style classes referenced by at least one craft node. */
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
