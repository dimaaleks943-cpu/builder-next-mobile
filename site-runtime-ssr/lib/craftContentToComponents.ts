import type { ComponentNode } from "./interface"
import { parsePageCraftContent } from "./pageCraftContent"
import {
  decodeStyleProps,
} from "./stylePropsCodec"
import type { StyleClassesRegistry } from "./styleClasses/types"
import { propsForRuntime } from "./styleClasses/resolveNodeStyle"

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value)

type SerializedNodes = Record<
  string,
  {
    type: unknown
    isCanvas: boolean
    props: Record<string, unknown>
    displayName?: string
    hidden?: boolean
    nodes?: string[]
    linkedNodes?: Record<string, string>
    parent?: string
    custom?: Record<string, unknown>
  }
>

const resolveTypeName = (type: unknown, nodeId?: string): string => {
  if (!type) {
    if (nodeId) {
      console.warn(
        `[craftContentToComponents] resolveTypeName: type is null/undefined for node ${nodeId}`,
      )
    }
    return "div"
  }

  if (typeof type === "string") {
    return type
  }

  if (typeof type === "object") {
    const t = type as { resolvedName?: string; displayName?: string }
    if (typeof t.resolvedName === "string") {
      return t.resolvedName
    }
    if (typeof t.displayName === "string") {
      return t.displayName
    }
  }

  return "div"
}

const toStableNodeClassName = (nodeId: string): string => {
  const normalized = nodeId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")

  return normalized ? `cn-${normalized}` : "cn-node"
}

const buildNodeTree = (
  nodes: SerializedNodes,
  id: string,
  styleClasses: StyleClassesRegistry,
): ComponentNode | null => {
  const node = nodes[id]
  if (!node) return null

  if (typeof node.type !== "string" && typeof node.type !== "object" && typeof node.type !== "undefined") {
    console.warn(`[craftContentToComponents] Unexpected type for node ${id}:`, typeof node.type, node.type)
  }

  const componentType = resolveTypeName(node.type, id)

  if (componentType === "ContentList") {
    const linkedNodes = node.linkedNodes ?? {}
    const pickTemplateCellId = (): string | null => {
      const dataNodes = node.nodes ?? []
      if (dataNodes.length > 0) return dataNodes[0]

      const keys = Object.keys(linkedNodes)
      if (keys.length === 0) return null

      const preferredKey = `${id}-cell-0`
      if (linkedNodes[preferredKey]) return linkedNodes[preferredKey]
      if (keys.includes(preferredKey)) return linkedNodes[preferredKey] || preferredKey

      const cellKeys = keys.filter((k) => k.includes("cell"))
      const candidateKey = (cellKeys.length > 0 ? cellKeys : keys)[0]
      return linkedNodes[candidateKey] || candidateKey
    }

    const actualFirstCellId = pickTemplateCellId()
    if (!actualFirstCellId) {
      return {
        nodeId: id,
        className: toStableNodeClassName(id),
        type: "ContentList",
        props: propsForRuntime(
          (node.props ?? {}) as Record<string, unknown>,
          "ContentList",
          node.displayName,
          styleClasses,
        ),
      }
    }
    const cellNode = nodes[actualFirstCellId]

    if (!cellNode) {
      return {
        nodeId: id,
        className: toStableNodeClassName(id),
        type: "ContentList",
        props: propsForRuntime(
          (node.props ?? {}) as Record<string, unknown>,
          "ContentList",
          node.displayName,
          styleClasses,
        ),
      }
    }

    const templateChildren: ComponentNode[] = []
    const cellLinkedNodes = cellNode.linkedNodes ?? {}
    let templateChildIds = cellNode.nodes ?? []
    if (!templateChildIds.length && Object.keys(cellLinkedNodes).length > 0) {
      templateChildIds = Object.keys(cellLinkedNodes)
    }

    const collectTemplateFromNode = (nodeId: string): void => {
      const n = nodes[nodeId]
      if (!n) return
      const childIds = n.nodes ?? []
      const ln = n.linkedNodes ?? {}
      const ids = childIds.length ? childIds : Object.keys(ln)
      for (const key of ids) {
        const actualId = ln[key] || key
        const child = buildNodeTree(nodes, actualId, styleClasses)
        if (child) {
          templateChildren.push(child)
        } else {
          collectTemplateFromNode(actualId)
        }
      }
    }

    for (const templateChildId of templateChildIds) {
      const actualChildId = cellLinkedNodes[templateChildId] || templateChildId
      const child = buildNodeTree(nodes, actualChildId, styleClasses)
      if (child) {
        templateChildren.push(child)
      } else {
        collectTemplateFromNode(actualChildId)
      }
    }

    const safeChildren = templateChildren.map((child) => ({
      ...child,
      type: String(child.type),
    }))

    const normalizedCell = decodeStyleProps((cellNode.props ?? {}) as Record<string, unknown>)
    const cellRuntimeProps = propsForRuntime(
      normalizedCell,
      "ContentListCell",
      cellNode.displayName,
      styleClasses,
    )
    const cellStyle = isRecord(cellRuntimeProps.style) ? cellRuntimeProps.style : {}
    const contentListProps = {
      ...propsForRuntime(
        (node.props ?? {}) as Record<string, unknown>,
        "ContentList",
        node.displayName,
        styleClasses,
      ),
      cellClassName: toStableNodeClassName(actualFirstCellId),
      cellStyle,
    }

    return {
      nodeId: id,
      className: toStableNodeClassName(id),
      type: "ContentList",
      props: contentListProps,
      children: safeChildren.length > 0 ? safeChildren : undefined,
    }
  }

  if (componentType === "ContentListCell") {
    return null
  }

  const childrenIds = node.nodes ?? []
  const children: ComponentNode[] = []

  for (const childId of childrenIds) {
    const linkedNodes = node.linkedNodes ?? {}
    const actualChildId = linkedNodes[childId] || childId
    const child = buildNodeTree(nodes, actualChildId, styleClasses)
    if (child) {
      children.push(child)
    }
  }

  const component: ComponentNode = {
    nodeId: id,
    className: toStableNodeClassName(id),
    type: String(componentType),
    props: propsForRuntime(
      (node.props ?? {}) as Record<string, unknown>,
      componentType,
      node.displayName,
      styleClasses,
    ),
  }

  if (children.length > 0) {
    component.children = children
  }

  return component
}

export const craftContentToComponents = (
  content: string,
): ComponentNode[] => {
  if (!content) return []

  const { nodes, styleClasses } = parsePageCraftContent(content)

  const root = nodes.ROOT as SerializedNodes[string] | undefined
  if (!root || !Array.isArray(root.nodes)) {
    console.error("Некорректный Craft content: нет ROOT.nodes")
    return []
  }

  const serializedNodes = nodes as SerializedNodes
  const result: ComponentNode[] = []
  const rootLinkedNodes = root.linkedNodes ?? {}

  for (const childKey of root.nodes) {
    const actualChildId = rootLinkedNodes[childKey] || childKey
    const child = buildNodeTree(serializedNodes, actualChildId, styleClasses)
    if (child) {
      result.push(child)
    }
  }

  const rootTypeName = resolveTypeName(root.type, "ROOT")
  const rootIsBody =
    rootTypeName === "Body" || rootTypeName === "CraftBody"

  if (rootIsBody) {
    if (result.length === 0) {
      return []
    }
    return [
      {
        nodeId: "ROOT",
        className: toStableNodeClassName("ROOT"),
        type: "Body",
        props: propsForRuntime(
          (root.props ?? {}) as Record<string, unknown>,
          "Body",
          root.displayName,
          styleClasses,
        ),
        children: result,
      },
    ]
  }

  return result
}
