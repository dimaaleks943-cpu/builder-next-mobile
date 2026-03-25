import type { SerializedNodes } from "@craftjs/core"
import { collectSubtreeIds, type AnySerializedNode } from "./craftSerializedGraph.ts"

const getResolvedName = (type: unknown): string | undefined => {
  if (!type) return undefined
  if (typeof type === "object") {
    return (type as { resolvedName?: string }).resolvedName
  }
  return undefined
}

const collectReachableFromRoot = (nodes: SerializedNodes, rootId: string): Set<string> => {
  if (!nodes[rootId]) return new Set(Object.keys(nodes))
  return collectSubtreeIds(nodes, rootId)
}

/**
 * Compacts Craft.js serialized nodes by keeping only `cell-0` subtree for every ContentList.
 * All other ContentList cells (`cell-1..N`) and their descendants are removed from the JSON,
 * and then all unreachable (orphaned) nodes are dropped.
 */
export const compactContentListCells = (serialized: SerializedNodes): SerializedNodes => {
  const nodes: SerializedNodes = { ...(serialized as any) }

  const contentListIds: string[] = []
  for (const [id, node] of Object.entries(nodes)) {
    const resolvedName = getResolvedName((node as any)?.type)
    if (resolvedName === "ContentList") contentListIds.push(id)
  }

  const idsToDelete = new Set<string>()

  for (const contentListId of contentListIds) {
    const clNode = nodes[contentListId] as unknown as AnySerializedNode | undefined
    if (!clNode) continue

    const linkedNodes = (clNode.linkedNodes ?? {}) as Record<string, string>
    const dataNodes = (clNode.nodes ?? []) as string[]

    const templateKey = `${contentListId}-cell-0`
    const templateIdCandidate = linkedNodes[templateKey] ?? dataNodes[0] ?? templateKey
    const templateId =
      templateIdCandidate && nodes[templateIdCandidate] ? templateIdCandidate : undefined

    if (!templateId) {
      // If we cannot reliably find the template cell in this JSON, skip compaction for safety.
      continue
    }

    // Collect all cell ids referenced by this ContentList (both linkedNodes and nodes array).
    const cellIdSet = new Set<string>()
    for (const [k, v] of Object.entries(linkedNodes)) {
      if (k.startsWith(`${contentListId}-cell-`) && typeof v === "string") cellIdSet.add(v)
    }
    for (const v of dataNodes) {
      if (typeof v === "string" && v.startsWith(`${contentListId}-cell-`)) cellIdSet.add(v)
    }
    // Ensure the template itself is in the set so we can filter properly.
    cellIdSet.add(templateId)

    for (const cellId of cellIdSet) {
      if (cellId === templateId) continue
      if (!nodes[cellId]) continue
      const subtree = collectSubtreeIds(nodes, cellId)
      for (const id of subtree) idsToDelete.add(id)
    }

    // Rewrite ContentList references to keep only the template cell.
    if (Array.isArray(clNode.nodes)) {
      clNode.nodes = [templateId]
    }
    if (clNode.linkedNodes && typeof clNode.linkedNodes === "object") {
      const nextLinked: Record<string, string> = {}
      for (const [k, v] of Object.entries(clNode.linkedNodes)) {
        if (!k.startsWith(`${contentListId}-cell-`)) nextLinked[k] = v
      }
      nextLinked[templateKey] = templateId
      clNode.linkedNodes = nextLinked
    } else {
      clNode.linkedNodes = { [templateKey]: templateId }
    }

    ;(nodes as any)[contentListId] = clNode as any
  }

  // Delete the collected subtrees.
  for (const id of idsToDelete) {
    delete (nodes as any)[id]
  }

  // Finally, drop unreachable nodes.
  const reachable = collectReachableFromRoot(nodes, "ROOT")
  const compactedEntries = Object.entries(nodes).filter(([id]) => reachable.has(id))
  return Object.fromEntries(compactedEntries) as SerializedNodes
}

