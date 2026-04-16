import type { ComponentNode } from "./interface"
import { decodeSerializedNodesStyleProps } from "./stylePropsCodec"

// Сериализованный формат дерева Craft.js, который мы сохраняем в поле content
type SerializedNodes = Record<
  string,
  {
    type: any
    isCanvas: boolean
    props: Record<string, any>
    displayName?: string
    hidden?: boolean
    nodes?: string[]
    linkedNodes?: Record<string, string>
    parent?: string
    custom?: Record<string, any>
  }
>

// Преобразуем тип Craft-узла в строковое имя компонента рантайма (Body, Block, Text, LinkText)
// В сериализованном JSON тип всегда представлен как строка или как объект с resolvedName/displayName.
const resolveTypeName = (type: any, nodeId?: string): string => {
  if (!type) {
    if (nodeId) {
      // eslint-disable-next-line no-console
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

// Рекурсивно строим дерево ComponentNode из сериализованных узлов Craft, начиная с указанного id
const buildNodeTree = (
  nodes: SerializedNodes,
  id: string,
): ComponentNode | null => {
  const node = nodes[id]
  if (!node) return null

  // Логируем, если type не строка и не объект с resolvedName/displayName
  if (typeof node.type !== "string" && typeof node.type !== "object" && typeof node.type !== "undefined") {
    console.warn(`[craftContentToComponents] Unexpected type for node ${id}:`, typeof node.type, node.type)
  }

  const componentType = resolveTypeName(node.type, id)

  // Для ContentList берём только первую ячейку (шаблон) из всех ячеек.
  // В сериализованном дереве Craft.js дети ContentList — это ячейки (ContentListCell),
  // каждая из которых содержит своих детей-шаблонов.
  if (componentType === "ContentList") {
    const linkedNodes = node.linkedNodes ?? {}
    // Дети ContentList — ячейки; могут быть в node.nodes или только в linkedNodes.
    // В "сжатом" формате storage мы ожидаем ровно одну ячейку-шаблон: `${contentListId}-cell-0`.
    const pickTemplateCellId = (): string | null => {
      const dataNodes = node.nodes ?? []
      if (dataNodes.length > 0) return dataNodes[0]

      const keys = Object.keys(linkedNodes)
      if (keys.length === 0) return null

      const preferredKey = `${id}-cell-0`
      if (linkedNodes[preferredKey]) return linkedNodes[preferredKey]
      if (keys.includes(preferredKey)) return linkedNodes[preferredKey] || preferredKey

      // Фоллбэк: берём любую ячейку, но стараемся не спутать с не-cell ссылками.
      const cellKeys = keys.filter((k) => k.includes("cell"))
      const candidateKey = (cellKeys.length > 0 ? cellKeys : keys)[0]
      return linkedNodes[candidateKey] || candidateKey
    }

    const actualFirstCellId = pickTemplateCellId()
    if (!actualFirstCellId) {
      return { type: "ContentList", props: node.props ?? {} }
    }
    const cellNode = nodes[actualFirstCellId]

    if (!cellNode) {
      return { type: "ContentList", props: node.props ?? {} }
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
        const child = buildNodeTree(nodes, actualId)
        if (child) {
          templateChildren.push(child)
        } else {
          // Узел не рендерится (например ContentListCell) — разворачиваем его детей
          collectTemplateFromNode(actualId)
        }
      }
    }

    for (const templateChildId of templateChildIds) {
      const actualChildId = cellLinkedNodes[templateChildId] || templateChildId
      const childNode = nodes[actualChildId]

      console.log(`[craftContentToComponents] Processing template child:`, {
        templateChildId,
        actualChildId,
        nodeExists: !!childNode,
        nodeType: childNode?.type,
        nodeTypeString: typeof childNode?.type === "string" ? childNode.type :
                       typeof childNode?.type === "object" ? JSON.stringify(childNode.type) :
                       String(childNode?.type),
        nodeTypeResolved: childNode ? resolveTypeName(childNode.type) : null,
      })

      const child = buildNodeTree(nodes, actualChildId)
      if (child) {
        console.log(`[craftContentToComponents] Built child:`, {
          type: child.type,
          typeString: typeof child.type,
          props: Object.keys(child.props || {}),
          hasChildren: !!child.children,
        })
        templateChildren.push(child)
      } else {
        console.log(`[craftContentToComponents] Child is null, collecting from node`)
        collectTemplateFromNode(actualChildId)
      }
    }

    // Гарантируем, что все children имеют строковый type
    const safeChildren = templateChildren.map((child) => ({
      // На этом этапе buildNodeTree уже нормализовал type в строку,
      // просто явно приводим к string для TypeScript.
      ...child,
      type: String(child.type),
    }))

    // Пропсы первой ячейки (layout, gridColumns, gridRows, gridAutoFlow, gap) применяем к каждой ячейке в runtime.
    // undefined не допускается при сериализации getServerSideProps (JSON), поэтому подставляем null.
    const cellProps = cellNode.props ?? {}
    const contentListProps = {
      ...(node.props ?? {}),
      cellLayout: cellProps.layout ?? "block",
      cellGridColumns: cellProps.gridColumns ?? null,
      cellGridRows: cellProps.gridRows ?? null,
      cellGridAutoFlow: cellProps.gridAutoFlow ?? null,
      cellGap: cellProps.gap ?? null,
      cellFlexFlow: cellProps.flexFlow ?? null,
      cellFlexJustifyContent: cellProps.flexJustifyContent ?? null,
      cellFlexAlignItems: cellProps.flexAlignItems ?? null,
      cellPlaceItemsY: cellProps.placeItemsY ?? null,
      cellPlaceItemsX: cellProps.placeItemsX ?? null,
      cellBackgroundColor: cellProps.backgroundColor ?? null,
      cellMixBlendMode: cellProps.mixBlendMode ?? null,
      cellOpacityPercent: cellProps.opacityPercent ?? null,
      cellOutlineStyleMode: cellProps.outlineStyleMode ?? null,
      cellOutlineWidth: cellProps.outlineWidth ?? null,
      cellOutlineOffset: cellProps.outlineOffset ?? null,
      cellOutlineColor: cellProps.outlineColor ?? null,
    }

    return {
      type: "ContentList",
      props: contentListProps,
      children: safeChildren.length > 0 ? safeChildren : undefined,
    }
  }

  // ContentListCell - это просто обёртка в builder для редактирования, в runtime мы её не рендерим
  // Её дети обрабатываются напрямую в ContentList при построении шаблона
  if (componentType === "ContentListCell") {
    return null
  }

  // Для остальных компонентов строим дерево как обычно
  const childrenIds = node.nodes ?? []
  const children: ComponentNode[] = []

  for (const childId of childrenIds) {
    // Проверяем linkedNodes для правильного разрешения id
    const linkedNodes = node.linkedNodes ?? {}
    const actualChildId = linkedNodes[childId] || childId
    const child = buildNodeTree(nodes, actualChildId)
    if (child) {
      children.push(child)
    }
  }

  const component: ComponentNode = {
    // resolveTypeName всегда возвращает строку, поэтому здесь просто используем её
    type: String(componentType),
    props: node.props ?? {},
  }

  if (children.length > 0) {
    component.children = children
  }

  return component
}

// Главная функция: берём content из конструктора (строка JSON из Craft.js)
// и превращаем его в массив ComponentNode, который умеет рендерить site-runtime-ssr
export const craftContentToComponents = (
  content: string,
): ComponentNode[] => {
  if (!content) return []

  let nodes: SerializedNodes
  try {
    nodes = JSON.parse(content) as SerializedNodes
  } catch (error) {
    console.error("Не удалось распарсить Craft content как JSON:", error)
    return []
  }

  nodes = decodeSerializedNodesStyleProps(nodes)

  const root = nodes.ROOT
  if (!root || !Array.isArray(root.nodes)) {
    console.error("Некорректный Craft content: нет ROOT.nodes")
    return []
  }

  const result: ComponentNode[] = []
  const rootLinkedNodes = root.linkedNodes ?? {}

  // Берём детей ROOT и строим из них верхний уровень страницы (разрешаем linkedNodes)
  for (const childKey of root.nodes) {
    const actualChildId = rootLinkedNodes[childKey] || childKey
    const child = buildNodeTree(nodes, actualChildId)
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
        type: "Body",
        props: root.props ?? {},
        children: result,
      },
    ]
  }

  return result
}

