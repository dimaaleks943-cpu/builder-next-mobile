import type { ComponentNode } from "./interface";
import { decodeSerializedNodesStyleProps } from "./stylePropsCodec";


/** сериализованый формат дерева craft.js, который мы сохраняем в поле content  */
type SerializedNodes = Record<
  string,
  {
    type: any;
    isCanvas: boolean;
    props: Record<string, any>;
    displayName?: string;
    hidden?: boolean;
    nodes?: string[];
    linkedNodes?: Record<string, string>;
    parent?: string;
    custom?: Record<string, any>;
  }
>;

/**
 * Преобразуем тип Craft-узла в строковое имя компонента (Body, Block, Text, LinkText)
 * в JSON тип всегда представлен как строка или как объект с resolvedName/displayName
 * */
const resolveTypeName = (type: any, nodeId?: string): string => {
  if (!type) {
    return "div";
  }

  if (typeof type === "string") {
    return type;
  }

  if (typeof type === "object") {
    const t = type as { resolvedName?: string; displayName?: string };
    if (typeof t.resolvedName === "string") {
      return t.resolvedName;
    }
    if (typeof t.displayName === "string") {
      return t.displayName;
    }
  }

  return "div";
};

/** рекурсивно строим дерево ComponentNode из сериализованных узлов Craft, начиная с указанного id  */
const buildNodeTree = (
  nodes: SerializedNodes,
  id: string,
): ComponentNode | null => {
  const node = nodes[id];
  if (!node) return null;

  const componentType = resolveTypeName(node.type, id);

  /**
   * Для ContentList берём только первую ячейку (шаблон) из всех ячеек.
   * В сериализованном дереве Craft.js дети ContentList — это ячейки (ContentListCell),
   * каждая из которых содержит своих детей-шаблонов.
   * */
  if (componentType === "ContentList") {
    const linkedNodes = node.linkedNodes ?? {};
    /** дети ContentList это ячейки; могут быть в node.nodes или только в linkedNodes  */
    const pickTemplateCellId = (): string | null => {
      const dataNodes = node.nodes ?? [];
      if (dataNodes.length > 0) return dataNodes[0];

      const keys = Object.keys(linkedNodes);
      if (keys.length === 0) return null;

      const preferredKey = `${id}-cell-0`;
      if (linkedNodes[preferredKey]) return linkedNodes[preferredKey];
      if (keys.includes(preferredKey)) return linkedNodes[preferredKey] || preferredKey;

      const cellKeys = keys.filter((k) => k.includes("cell"));
      const candidateKey = (cellKeys.length > 0 ? cellKeys : keys)[0];
      return linkedNodes[candidateKey] || candidateKey;
    };

    const actualFirstCellId = pickTemplateCellId();
    if (!actualFirstCellId) {
      return { type: "ContentList", props: node.props ?? {} };
    }
    const cellNode = nodes[actualFirstCellId];

    if (!cellNode) {
      return { type: "ContentList", props: node.props ?? {} };
    }

    const templateChildren: ComponentNode[] = [];
    const cellLinkedNodes = cellNode.linkedNodes ?? {};
    let templateChildIds = cellNode.nodes ?? [];
    if (!templateChildIds.length && Object.keys(cellLinkedNodes).length > 0) {
      templateChildIds = Object.keys(cellLinkedNodes);
    }

    const collectTemplateFromNode = (nodeId: string): void => {
      const n = nodes[nodeId];
      if (!n) return;
      const childIds = n.nodes ?? [];
      const ln = n.linkedNodes ?? {};
      const ids = childIds.length ? childIds : Object.keys(ln);
      for (const key of ids) {
        const actualId = ln[key] || key;
        const child = buildNodeTree(nodes, actualId);
        if (child) {
          templateChildren.push(child);
        } else {
          /** узел не рендерится (например ContentListCell) — разворачиваем его детей  */
          collectTemplateFromNode(actualId);
        }
      }
    };

    for (const templateChildId of templateChildIds) {
      const actualChildId = cellLinkedNodes[templateChildId] || templateChildId;

      const child = buildNodeTree(nodes, actualChildId);
      if (child) {
        templateChildren.push(child);
      } else {
        collectTemplateFromNode(actualChildId);
      }
    }

    /** гарантируем, что все children имеют строковый type  */
    const safeChildren = templateChildren.map((child) => ({
      ...child,
      type: String(child.type),
    }));

    /** пропсы первой ячейки (layout, flex, placeItems) для рендера ячеек; grid не поддерживается в RN, приходит как flex.  */
    const cellProps = cellNode.props ?? {};
    const contentListProps = {
      ...(node.props ?? {}),
      cellLayout: cellProps.layout ?? "block",
      cellGap: cellProps.gap ?? null,
      cellFlexFlow: cellProps.flexFlow ?? null,
      cellFlexJustifyContent: cellProps.flexJustifyContent ?? null,
      cellFlexAlignItems: cellProps.flexAlignItems ?? null,
      cellPlaceItemsY: cellProps.placeItemsY ?? null,
      cellPlaceItemsX: cellProps.placeItemsX ?? null,
    };

    return {
      type: "ContentList",
      props: contentListProps,
      children: safeChildren.length > 0 ? safeChildren : undefined,
    };
  }

  /** ContentListCell — обёртка в конструкторе для редактирования; здесь не рендерим, дети обрабатываются в ContentList */
  if (componentType === "ContentListCell") return null;

  /** для остальных компонентов строим дерево как обычно */
  const childrenIds = node.nodes ?? [];
  const children: ComponentNode[] = [];

  for (const childId of childrenIds) {
    /** проверяем linkedNodes для правильного разрешения id */
    const linkedNodes = node.linkedNodes ?? {};
    const actualChildId = linkedNodes[childId] || childId;
    const child = buildNodeTree(nodes, actualChildId);
    if (child) {
      children.push(child);
    }
  }

  const component: ComponentNode = {
    type: String(componentType),
    props: node.props ?? {},
  };

  if (children.length > 0) {
    component.children = children;
  }

  return component;
};

/**
 * Преобразует строку content (JSON из конструктора, формат Craft.js) в массив ComponentNode
 * для рендера страницы нативными компонентами.
 */
export const craftContentToComponents = (content: string): ComponentNode[] => {
  if (!content) return [];

  let nodes: SerializedNodes;
  try {
    nodes = JSON.parse(content) as SerializedNodes;
  } catch (error) {
    console.error("Не удалось распарсить Craft content как JSON:", error);
    return [];
  }
  nodes = decodeSerializedNodesStyleProps(nodes);

  const root = nodes.ROOT;
  if (!root || !Array.isArray(root.nodes)) {
    console.error("Некорректный Craft content: нет ROOT.nodes");
    return [];
  }

  const result: ComponentNode[] = [];
  const rootLinkedNodes = root.linkedNodes ?? {};

  /** берём детей ROOT и строим из них верхний уровень страницы (разрешаем linkedNodes) */
  for (const childKey of root.nodes) {
    const actualChildId = rootLinkedNodes[childKey] || childKey;
    const child = buildNodeTree(nodes, actualChildId);
    if (child) {
      result.push(child);
    }
  }

  return result;
};
