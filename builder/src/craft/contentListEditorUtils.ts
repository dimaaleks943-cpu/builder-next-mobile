/** Клонирует дерево узлов с новыми id, чтобы не было дубликатов ключей при добавлении в несколько ячеек. */
export const cloneNodeTree = (tree: any, idPrefix: string): any => {
  const idMap: Record<string, string> = {}
  for (const oldId of Object.keys(tree.nodes as Record<string, any>)) {
    idMap[oldId] = `${idPrefix}_${oldId}`
  }
  const newNodes: Record<string, any> = {}
  for (const [oldId, node] of Object.entries(tree.nodes as Record<string, any>)) {
    const newId = idMap[oldId]
    const data: any = { ...(node as any).data }
    data.parent = data.parent && idMap[data.parent as string] ? idMap[data.parent as string] : null
    data.nodes = ((data.nodes as string[]) ?? []).map((n) => idMap[n] ?? n)
    if (data.linkedNodes && typeof data.linkedNodes === "object") {
      const linked = data.linkedNodes as Record<string, string>
      data.linkedNodes = Object.fromEntries(
        Object.entries(linked).map(([k, v]) => [k, idMap[v] ?? v]),
      )
    }
    if (data._childCanvas && typeof data._childCanvas === "object") {
      const childCanvas = data._childCanvas as Record<string, string>
      data._childCanvas = Object.fromEntries(
        Object.entries(childCanvas).map(([k, v]) => [k, idMap[v] ?? v]),
      )
    }
    newNodes[newId] = { ...(node as any), id: newId, data }
  }
  return {
    rootNodeId: idMap[tree.rootNodeId],
    nodes: newNodes,
  }
}

type CraftQueryLike = {
  node: (id: string) => {
    get: () => { data: { nodes?: string[]; type: unknown; props: Record<string, unknown> } }
    descendants: (deep: boolean) => string[]
  }
}

/** Собирает id, type и props узлов поддерева в порядке depth-first (узел, затем дети) */
export const getDescendantsWithProps = (
  query: CraftQueryLike,
  nodeId: string,
): { id: string; type: unknown; props: Record<string, unknown> }[] => {
  const result: { id: string; type: unknown; props: Record<string, unknown> }[] = []
  try {
    const node = query.node(nodeId).get()
    const type = node.data.type
    const props = { ...(node.data.props || {}) }
    result.push({ id: nodeId, type, props })
    const childIds: string[] = (node.data.nodes ?? []) as string[]
    for (const cid of childIds) {
      result.push(...getDescendantsWithProps(query, cid))
    }
  } catch {
    // skip invalid node
  }
  return result
}

/** Проверяет совпадение типов узлов для «мягкой» синхронизации (в т.ч. resolvedName у Craft). */
export const typesMatch = (a: unknown, b: unknown): boolean => {
  if (a === b) return true
  if (typeof a === "object" && a && typeof b === "object" && b) {
    const ar = (a as { resolvedName?: string }).resolvedName
    const br = (b as { resolvedName?: string }).resolvedName
    if (ar !== undefined && br !== undefined) return ar === br
  }
  return false
}

type EditorStateLike = {
  nodes: Record<string, { data?: { type?: unknown; props?: Record<string, unknown> } } | undefined>
}

/**
 * Fingerprint поддерева по type+props всех узлов (корень, затем потомки в порядке descendants(true)).
 * Совпадает по смыслу с цепочкой JSON.stringify({ type, props }) из getSerializedNodes(), без сериализации всего стора.
 */
export const buildSubtreeTypePropsFingerprint = (
  state: EditorStateLike,
  query: CraftQueryLike,
  rootId: string,
): string => {
  if (!rootId || !state.nodes[rootId]) return ""
  try {
    const descendantIds = query.node(rootId).descendants(true) as string[]
    const allIds = [rootId, ...descendantIds]
    return allIds
      .map((id) => {
        const n = state.nodes[id]?.data
        if (!n) return ""
        return JSON.stringify({ type: n.type, props: n.props ?? {} })
      })
      .join(";")
  } catch {
    return ""
  }
}

export const CELL_IDS_PENDING_SIGNATURE = "__pending__" as const

export type CollectCellIdsResult =
  | { status: "ready"; cellIds: string[] }
  | { status: "pending" }
  | { status: "empty"; cellIds: [] }

/**
 * Разрешает фактические id ячеек ContentList по linkedNodes / data.nodes и ключам `${contentListId}-cell-${i}`.
 */
export const collectContentListCellIds = (
  state: EditorStateLike,
  contentListId: string,
  cellCount: number,
): CollectCellIdsResult => {
  if (!contentListId || !state.nodes[contentListId] || cellCount === 0) {
    return { status: "empty", cellIds: [] }
  }
  const contentListNode = state.nodes[contentListId] as {
    data?: { linkedNodes?: Record<string, string>; nodes?: string[] }
  }
  const linkedNodes = (contentListNode?.data?.linkedNodes ?? {}) as Record<string, string>
  const dataNodes = (contentListNode?.data?.nodes ?? []) as string[]

  const cellIds: string[] = []
  for (let i = 0; i < cellCount; i++) {
    const linkKey = `${contentListId}-cell-${i}`
    const actualId = linkedNodes[linkKey] ?? dataNodes[i]
    if (actualId && state.nodes[actualId]) cellIds.push(actualId)
  }
  if (cellIds.length < cellCount) return { status: "pending" }
  return { status: "ready", cellIds }
}

/**
 * Собирает подпись всех ячеек для sync: `part0||part1||...`, где каждая часть — fingerprint поддерева ячейки.
 */
export const buildAllCellsSignature = (
  state: EditorStateLike,
  query: CraftQueryLike,
  cellIds: string[],
): string => {
  const parts: string[] = []
  for (const cellId of cellIds) {
    try {
      if (!state.nodes[cellId]) {
        parts.push("")
        continue
      }
      parts.push(buildSubtreeTypePropsFingerprint(state, query, cellId))
    } catch {
      parts.push("")
    }
  }
  return parts.join("||")
}
