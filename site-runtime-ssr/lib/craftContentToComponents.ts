import type { ComponentNode } from "./interface"
import { parsePageCraftContent } from "./pageCraftContent"
import { decodeStyleProps } from "./stylePropsCodec"
import type { OrphanStyleNode } from "./styleClasses/buildOrphanNodeCss"
import { buildComboClassId } from "./styleClasses/comboClassId"
import {
  type CraftFragmentScopePrefix,
  prefixCraftNodeId,
} from "./styleClasses/fragmentScope"
import { classNameFromStyleClassIds } from "./styleClasses/styleClassSlug"
import { normalizeStyleClassIds } from "./styleClasses/styleClassIds"
import {
  propsForRuntimeSsr,
  resolveSerializedNodeStyle,
} from "./styleClasses/resolveNodeStyle"
import type { StyleClassesRegistry } from "./styleClasses/types"

export type CraftContentParseResult = {
  fragmentScope: CraftFragmentScopePrefix
  components: ComponentNode[]
  styleClasses: StyleClassesRegistry
  orphanStyleNodes: OrphanStyleNode[]
  /** Unique `styleClassIds` stacks (length >= 2) for compound CSS selectors. */
  stackedStyleClassIds: string[][]
}

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

const recordStackedStyleClassIds = (
  styleClassIds: readonly string[],
  collector: Map<string, string[]>,
): void => {
  if (styleClassIds.length < 2) return
  const key = buildComboClassId(styleClassIds)
  if (!collector.has(key)) {
    collector.set(key, [...styleClassIds])
  }
}

/** Next.js GSSP rejects `undefined` in serialized props — omit empty className. */
const classNameProp = (
  styleClassIds: readonly string[],
  registry: StyleClassesRegistry,
  fragmentScope: CraftFragmentScopePrefix,
): Pick<ComponentNode, "className"> | Record<string, never> => {
  const className = classNameFromStyleClassIds(
    styleClassIds,
    registry,
    fragmentScope,
  )
  return className ? { className } : {}
}

const scopedNodeId = (
  nodeId: string,
  fragmentScope: CraftFragmentScopePrefix,
): string => prefixCraftNodeId(nodeId, fragmentScope)

const collectOrphanStyle = (
  nodeId: string,
  rawProps: Record<string, unknown>,
  styleClasses: StyleClassesRegistry,
  orphanStyleNodes: OrphanStyleNode[],
  fragmentScope: CraftFragmentScopePrefix,
): void => {
  const styleClassIds = normalizeStyleClassIds(rawProps.styleClassIds)
  if (styleClassIds.length > 0) return

  const style = resolveSerializedNodeStyle(
    rawProps,
    "",
    undefined,
    styleClasses,
  )
  if (style) {
    orphanStyleNodes.push({ nodeId: scopedNodeId(nodeId, fragmentScope), style })
  }
}

const buildNodeTree = (
  nodes: SerializedNodes,
  id: string,
  styleClasses: StyleClassesRegistry,
  orphanStyleNodes: OrphanStyleNode[],
  stackedCollector: Map<string, string[]>,
  fragmentScope: CraftFragmentScopePrefix,
): ComponentNode | null => {
  const node = nodes[id]
  if (!node) return null

  if (typeof node.type !== "string" && typeof node.type !== "object" && typeof node.type !== "undefined") {
    console.warn(`[craftContentToComponents] Unexpected type for node ${id}:`, typeof node.type, node.type)
  }

  const componentType = resolveTypeName(node.type, id)
  const rawNodeProps = (node.props ?? {}) as Record<string, unknown>
  recordStackedStyleClassIds(
    normalizeStyleClassIds(rawNodeProps.styleClassIds),
    stackedCollector,
  )

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
    collectOrphanStyle(
      id,
      rawNodeProps,
      styleClasses,
      orphanStyleNodes,
      fragmentScope,
    )

    if (!actualFirstCellId) {
      return {
        nodeId: scopedNodeId(id, fragmentScope),
        ...classNameProp(
          normalizeStyleClassIds(rawNodeProps.styleClassIds),
          styleClasses,
          fragmentScope,
        ),
        type: "ContentList",
        props: propsForRuntimeSsr(
          rawNodeProps,
          "ContentList",
          node.displayName,
          styleClasses,
        ),
      }
    }
    const cellNode = nodes[actualFirstCellId]

    if (!cellNode) {
      return {
        nodeId: scopedNodeId(id, fragmentScope),
        ...classNameProp(
          normalizeStyleClassIds(rawNodeProps.styleClassIds),
          styleClasses,
          fragmentScope,
        ),
        type: "ContentList",
        props: propsForRuntimeSsr(
          rawNodeProps,
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
        const child = buildNodeTree(
          nodes,
          actualId,
          styleClasses,
          orphanStyleNodes,
          stackedCollector,
          fragmentScope,
        )
        if (child) {
          templateChildren.push(child)
        } else {
          collectTemplateFromNode(actualId)
        }
      }
    }

    for (const templateChildId of templateChildIds) {
      const actualChildId = cellLinkedNodes[templateChildId] || templateChildId
      const child = buildNodeTree(
        nodes,
        actualChildId,
        styleClasses,
        orphanStyleNodes,
        stackedCollector,
        fragmentScope,
      )
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

    const normalizedCell = decodeStyleProps(
      (cellNode.props ?? {}) as Record<string, unknown>,
    )
    collectOrphanStyle(
      actualFirstCellId,
      normalizedCell,
      styleClasses,
      orphanStyleNodes,
      fragmentScope,
    )
    recordStackedStyleClassIds(
      normalizeStyleClassIds(normalizedCell.styleClassIds),
      stackedCollector,
    )

    const cellClassName = classNameFromStyleClassIds(
      normalizeStyleClassIds(normalizedCell.styleClassIds),
      styleClasses,
      fragmentScope,
    )

    const contentListProps = {
      ...propsForRuntimeSsr(
        rawNodeProps,
        "ContentList",
        node.displayName,
        styleClasses,
      ),
      ...(cellClassName ? { cellClassName } : {}),
      cellNodeId: scopedNodeId(actualFirstCellId, fragmentScope),
    }

    return {
      nodeId: scopedNodeId(id, fragmentScope),
      ...classNameProp(
        normalizeStyleClassIds(rawNodeProps.styleClassIds),
        styleClasses,
        fragmentScope,
      ),
      type: "ContentList",
      props: contentListProps,
      ...(safeChildren.length > 0 ? { children: safeChildren } : {}),
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
    const child = buildNodeTree(
      nodes,
      actualChildId,
      styleClasses,
      orphanStyleNodes,
      stackedCollector,
      fragmentScope,
    )
    if (child) {
      children.push(child)
    }
  }

  collectOrphanStyle(
    id,
    rawNodeProps,
    styleClasses,
    orphanStyleNodes,
    fragmentScope,
  )

  const component: ComponentNode = {
    nodeId: scopedNodeId(id, fragmentScope),
    ...classNameProp(
      normalizeStyleClassIds(rawNodeProps.styleClassIds),
      styleClasses,
      fragmentScope,
    ),
    type: String(componentType),
    props: propsForRuntimeSsr(
      rawNodeProps,
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
  fragmentScope: CraftFragmentScopePrefix,
): CraftContentParseResult => {
  const orphanStyleNodes: OrphanStyleNode[] = []
  const stackedCollector = new Map<string, string[]>()

  if (!content) {
    return {
      fragmentScope,
      components: [],
      styleClasses: {},
      orphanStyleNodes,
      stackedStyleClassIds: [],
    }
  }

  const { nodes, styleClasses } = parsePageCraftContent(content)

  const root = nodes.ROOT as SerializedNodes[string] | undefined
  if (!root || !Array.isArray(root.nodes)) {
    console.error("Некорректный Craft content: нет ROOT.nodes")
    return {
      fragmentScope,
      components: [],
      styleClasses,
      orphanStyleNodes,
      stackedStyleClassIds: [],
    }
  }

  const serializedNodes = nodes as SerializedNodes
  const result: ComponentNode[] = []
  const rootLinkedNodes = root.linkedNodes ?? {}

  for (const childKey of root.nodes) {
    const actualChildId = rootLinkedNodes[childKey] || childKey
    const child = buildNodeTree(
      serializedNodes,
      actualChildId,
      styleClasses,
      orphanStyleNodes,
      stackedCollector,
      fragmentScope,
    )
    if (child) {
      result.push(child)
    }
  }

  const rootTypeName = resolveTypeName(root.type, "ROOT")
  const rootIsBody =
    rootTypeName === "Body" || rootTypeName === "CraftBody"

  const stackedStyleClassIds = Array.from(stackedCollector.values())

  if (rootIsBody) {
    if (result.length === 0) {
      return {
        fragmentScope,
        components: [],
        styleClasses,
        orphanStyleNodes,
        stackedStyleClassIds,
      }
    }

    const rootProps = (root.props ?? {}) as Record<string, unknown>
    collectOrphanStyle(
      "ROOT",
      rootProps,
      styleClasses,
      orphanStyleNodes,
      fragmentScope,
    )
    recordStackedStyleClassIds(
      normalizeStyleClassIds(rootProps.styleClassIds),
      stackedCollector,
    )

    return {
      fragmentScope,
      components: [
        {
          nodeId: scopedNodeId("ROOT", fragmentScope),
          ...classNameProp(
            normalizeStyleClassIds(rootProps.styleClassIds),
            styleClasses,
            fragmentScope,
          ),
          type: "Body",
          props: propsForRuntimeSsr(
            rootProps,
            "Body",
            root.displayName,
            styleClasses,
          ),
          children: result,
        },
      ],
      styleClasses,
      orphanStyleNodes,
      stackedStyleClassIds: Array.from(stackedCollector.values()),
    }
  }

  return {
    fragmentScope,
    components: result,
    styleClasses,
    orphanStyleNodes,
    stackedStyleClassIds,
  }
}
