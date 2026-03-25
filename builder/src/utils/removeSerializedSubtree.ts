import type { SerializedNodes } from "@craftjs/core"
import {
  collectSubtreeIds,
  type AnySerializedNode,
} from "./craftSerializedGraph.ts"

/**
 * Удаляет узел и всё поддерево из Craft SerializedNodes и чистит ссылки в оставшихся узлах.
 * Нужен для случаев, когда {@link actions.delete} не вызывается (например linked canvas / ContentListCell).
 */
export const removeSerializedSubtree = (serialized: SerializedNodes, rootId: string): SerializedNodes => {
  if (!serialized[rootId]) return serialized
  const subtree = collectSubtreeIds(serialized, rootId)
  const next = { ...(serialized as Record<string, unknown>) }
  for (const id of subtree) {
    delete next[id]
  }
  for (const nid of Object.keys(next)) {
    const raw = next[nid] as AnySerializedNode | undefined
    if (!raw || typeof raw !== "object") continue
    if (Array.isArray(raw.nodes)) {
      raw.nodes = raw.nodes.filter((x) => typeof x === "string" && !subtree.has(x))
    }
    if (raw.linkedNodes && typeof raw.linkedNodes === "object") {
      for (const k of Object.keys(raw.linkedNodes)) {
        if (subtree.has(raw.linkedNodes[k])) {
          delete raw.linkedNodes[k]
        }
      }
    }
    if (raw._childCanvas && typeof raw._childCanvas === "object") {
      for (const k of Object.keys(raw._childCanvas)) {
        if (subtree.has(raw._childCanvas[k])) {
          delete raw._childCanvas[k]
        }
      }
    }
  }
  return next as SerializedNodes
}
