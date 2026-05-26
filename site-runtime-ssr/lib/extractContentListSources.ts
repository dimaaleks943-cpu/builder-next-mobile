import { parsePageCraftContent } from "./pageCraftContent"

/**
 * Обход сериализованного Craft JSON: уникальные `selectedSource` (content_type_id) у узлов ContentList.
 */

interface SerializedNode {
  type: unknown
  props?: Record<string, unknown>
  hidden?: boolean
  nodes?: string[]
  linkedNodes?: Record<string, string>
}

interface SerializedNodes {
  [nodeId: string]: SerializedNode
}

const resolveTypeName = (type: unknown): string => {
  if (!type) return "div"
  if (typeof type === "string") return type
  if (typeof type === "object") {
    const t = type as { resolvedName?: string; displayName?: string }
    if (typeof t.resolvedName === "string") return t.resolvedName
    if (typeof t.displayName === "string") return t.displayName
  }
  return "div"
}

export interface ContentListPrefetchPair {
  selectedSource: string
  /** Если задан, префетч кладётся в ключ `getCollectionItemsCacheKey(filterScope, selectedSource)`. */
  filterScope?: string
}

const collectContentListPair = (
  node: SerializedNode,
  byDedupeKey: Map<string, ContentListPrefetchPair>,
): void => {
  const rawSource = node.props?.selectedSource
  if (typeof rawSource !== "string" || !rawSource.trim()) return

  const selectedSource = rawSource.trim()
  const rawScope = node.props?.filterScope
  const scope =
    typeof rawScope === "string" && rawScope.trim() ? rawScope.trim() : undefined
  // Совпадает с getCollectionItemsCacheKey: одна запись на пару (scope, type), без дублей в префетче.
  const dedupeKey = scope ? `${scope}::${selectedSource}` : selectedSource
  byDedupeKey.set(dedupeKey, {
    selectedSource,
    filterScope: scope,
  })
}

const getLinkedNodeId = (node: SerializedNode, childId: string): string =>
  node.linkedNodes?.[childId] || childId

const pickContentListTemplateCellId = (
  nodeId: string,
  node: SerializedNode,
): string | null => {
  const dataNodes = node.nodes ?? []
  if (dataNodes.length > 0) return dataNodes[0] ?? null

  const linkedNodes = node.linkedNodes ?? {}
  const keys = Object.keys(linkedNodes)
  if (keys.length === 0) return null

  const preferredKey = `${nodeId}-cell-0`
  if (linkedNodes[preferredKey]) return linkedNodes[preferredKey]
  if (keys.includes(preferredKey)) return linkedNodes[preferredKey] || preferredKey

  const cellKeys = keys.filter((key) => key.includes("cell"))
  const candidateKey = (cellKeys.length > 0 ? cellKeys : keys)[0]
  return candidateKey ? linkedNodes[candidateKey] || candidateKey : null
}

const getContentListTemplateChildIds = (
  cellNode: SerializedNode,
): string[] => {
  const childIds = cellNode.nodes ?? []
  if (childIds.length > 0) {
    return childIds.map((childId) => getLinkedNodeId(cellNode, childId))
  }

  return Object.keys(cellNode.linkedNodes ?? {}).map((childId) =>
    getLinkedNodeId(cellNode, childId),
  )
}

const traverseNode = (
  nodes: SerializedNodes,
  nodeId: string,
  byDedupeKey: Map<string, ContentListPrefetchPair>,
  visited: Set<string>,
): void => {
  if (visited.has(nodeId)) return
  visited.add(nodeId)

  const node = nodes[nodeId]
  if (!node || node.hidden) return

  const typeName = resolveTypeName(node.type)
  if (typeName === "ContentList") {
    collectContentListPair(node, byDedupeKey)

    const cellId = pickContentListTemplateCellId(nodeId, node)
    const cellNode = cellId ? nodes[cellId] : undefined
    if (!cellNode || cellNode.hidden) return

    for (const childId of getContentListTemplateChildIds(cellNode)) {
      traverseNode(nodes, childId, byDedupeKey, visited)
    }
    return
  }

  if (typeName === "ContentListCell") return

  for (const childId of node.nodes ?? []) {
    traverseNode(nodes, getLinkedNodeId(node, childId), byDedupeKey, visited)
  }
}

/**
 * Уникальные пары (filterScope?, selectedSource) для префетча items на SSR.
 * Каждая пара даёт один запрос `fetchContentItems` без категории — начальное состояние «Все» в кэше по `cacheKey`.
 */
export const extractContentListPrefetchPairsFromCraftContent = (
  content: string,
): ContentListPrefetchPair[] => {
  if (!content.trim()) return []

  const { nodes: parsedNodes } = parsePageCraftContent(content)
  const nodes = parsedNodes as SerializedNodes

  const byDedupeKey = new Map<string, ContentListPrefetchPair>()
  const root = nodes.ROOT
  if (!root || root.hidden) {
    return []
  }

  const visited = new Set<string>()
  for (const childId of root.nodes ?? []) {
    traverseNode(
      nodes,
      getLinkedNodeId(root, childId),
      byDedupeKey,
      visited,
    )
  }

  return Array.from(byDedupeKey.values())
}
