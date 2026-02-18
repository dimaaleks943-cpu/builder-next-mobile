import type { ComponentNode } from "./interface"

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
const resolveTypeName = (type: any): string => {
  if (!type) return "div"

  if (typeof type === "string") return type
  if (typeof type.resolvedName === "string") return type.resolvedName
  if (typeof type.displayName === "string") return type.displayName

  return "div"
}

// Рекурсивно строим дерево ComponentNode из сериализованных узлов Craft, начиная с указанного id
const buildNodeTree = (
  nodes: SerializedNodes,
  id: string,
): ComponentNode | null => {
  const node = nodes[id]
  if (!node) return null

  const childrenIds = node.nodes ?? []
  const children: ComponentNode[] = []

  for (const childId of childrenIds) {
    const child = buildNodeTree(nodes, childId)
    if (child) {
      children.push(child)
    }
  }

  const component: ComponentNode = {
    type: resolveTypeName(node.type),
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

  const root = nodes.ROOT
  if (!root || !Array.isArray(root.nodes)) {
    console.error("Некорректный Craft content: нет ROOT.nodes")
    return []
  }

  const result: ComponentNode[] = []

  // Берём детей ROOT и строим из них верхний уровень страницы
  for (const childId of root.nodes) {
    const child = buildNodeTree(nodes, childId)
    if (child) {
      result.push(child)
    }
  }

  return result
}

