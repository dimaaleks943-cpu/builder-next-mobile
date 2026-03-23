/**
 * Обход сериализованного Craft JSON: уникальные `selectedSource` (content_type_id) у узлов ContentList.
 */

type SerializedNode = {
  type: unknown
  props?: Record<string, unknown>
  hidden?: boolean
}

type SerializedNodes = Record<string, SerializedNode>

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

export function extractContentListTypeIdsFromCraftContent(
  content: string,
): string[] {
  if (!content.trim()) return []

  let nodes: SerializedNodes
  try {
    nodes = JSON.parse(content) as SerializedNodes
  } catch {
    return []
  }

  const ids = new Set<string>()
  for (const nodeId of Object.keys(nodes)) {
    const node = nodes[nodeId]
    if (!node || node.hidden) continue
    if (resolveTypeName(node.type) !== "ContentList") continue
    const raw = node.props?.selectedSource
    if (typeof raw === "string" && raw.trim().length > 0) {
      ids.add(raw.trim())
    }
  }

  return Array.from(ids)
}
