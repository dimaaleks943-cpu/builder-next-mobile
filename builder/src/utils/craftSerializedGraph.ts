import type { SerializedNodes } from "@craftjs/core"

export type AnySerializedNode = {
  type?: unknown
  nodes?: string[]
  linkedNodes?: Record<string, string>
  _childCanvas?: Record<string, string>
}

const getAllChildRefs = (node: AnySerializedNode | undefined): string[] => {
  if (!node) return []
  const out: string[] = []
  if (Array.isArray(node.nodes)) out.push(...node.nodes.filter((x): x is string => typeof x === "string"))
  if (node.linkedNodes && typeof node.linkedNodes === "object") {
    out.push(
      ...Object.values(node.linkedNodes).filter((x): x is string => typeof x === "string"),
    )
  }
  if (node._childCanvas && typeof node._childCanvas === "object") {
    out.push(
      ...Object.values(node._childCanvas).filter((x): x is string => typeof x === "string"),
    )
  }
  return out
}

export const collectSubtreeIds = (nodes: SerializedNodes, rootId: string): Set<string> => {
  const toVisit: string[] = [rootId]
  const visited = new Set<string>()
  while (toVisit.length) {
    const id = toVisit.pop()!
    if (visited.has(id)) continue
    visited.add(id)
    const n = nodes[id] as unknown as AnySerializedNode | undefined
    if (!n) continue
    for (const childId of getAllChildRefs(n)) {
      if (!visited.has(childId)) toVisit.push(childId)
    }
  }
  return visited
}
