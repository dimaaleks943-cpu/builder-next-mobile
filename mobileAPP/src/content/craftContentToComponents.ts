import type { ComponentNode } from "./interface";
import { parsePageCraftContent } from "../lib/pageCraftContent";
import { decodeStyleProps } from "./stylePropsCodec";
import type { StyleClassesRegistry } from "../lib/styleClasses/types";
import { propsForRuntime } from "../lib/styleClasses/resolveNodeStyle";

type SerializedNodes = Record<
  string,
  {
    type: unknown;
    isCanvas: boolean;
    props: Record<string, unknown>;
    displayName?: string;
    hidden?: boolean;
    nodes?: string[];
    linkedNodes?: Record<string, string>;
    parent?: string;
    custom?: Record<string, unknown>;
  }
>;

const resolveTypeName = (type: unknown, nodeId?: string): string => {
  if (!type) {
    if (nodeId) {
      console.warn(
        `[craftContentToComponents] resolveTypeName: type is null for node ${nodeId}`,
      );
    }
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

const buildNodeTree = (
  nodes: SerializedNodes,
  id: string,
  styleClasses: StyleClassesRegistry,
): ComponentNode | null => {
  const node = nodes[id];
  if (!node) return null;

  const componentType = resolveTypeName(node.type, id);
  const rawNodeProps = (node.props ?? {}) as Record<string, unknown>;

  if (componentType === "ContentList") {
    const linkedNodes = node.linkedNodes ?? {};
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
      return {
        nodeId: id,
        type: "ContentList",
        props: propsForRuntime(
          rawNodeProps,
          "ContentList",
          node.displayName,
          styleClasses,
        ),
      };
    }
    const cellNode = nodes[actualFirstCellId];

    if (!cellNode) {
      return {
        nodeId: id,
        type: "ContentList",
        props: propsForRuntime(
          rawNodeProps,
          "ContentList",
          node.displayName,
          styleClasses,
        ),
      };
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
        const child = buildNodeTree(nodes, actualId, styleClasses);
        if (child) {
          templateChildren.push(child);
        } else {
          collectTemplateFromNode(actualId);
        }
      }
    };

    for (const templateChildId of templateChildIds) {
      const actualChildId = cellLinkedNodes[templateChildId] || templateChildId;
      const child = buildNodeTree(nodes, actualChildId, styleClasses);
      if (child) {
        templateChildren.push(child);
      } else {
        collectTemplateFromNode(actualChildId);
      }
    }

    const safeChildren = templateChildren.map((child) => ({
      ...child,
      type: String(child.type),
    }));

    const normalizedCell = decodeStyleProps(
      (cellNode.props ?? {}) as Record<string, unknown>,
    );
    const cellRuntimeProps = propsForRuntime(
      normalizedCell,
      "ContentListCell",
      cellNode.displayName,
      styleClasses,
    );
    const contentListProps = {
      ...propsForRuntime(
        rawNodeProps,
        "ContentList",
        node.displayName,
        styleClasses,
      ),
      cellTemplateStyle: cellRuntimeProps.style,
      cellNodeId: actualFirstCellId,
    };

    return {
      nodeId: id,
      type: "ContentList",
      props: contentListProps,
      children: safeChildren.length > 0 ? safeChildren : undefined,
    };
  }

  if (componentType === "ContentListCell") return null;

  const childrenIds = node.nodes ?? [];
  const children: ComponentNode[] = [];

  for (const childId of childrenIds) {
    const linkedNodes = node.linkedNodes ?? {};
    const actualChildId = linkedNodes[childId] || childId;
    const child = buildNodeTree(nodes, actualChildId, styleClasses);
    if (child) {
      children.push(child);
    }
  }

  const component: ComponentNode = {
    nodeId: id,
    type: String(componentType),
    props: propsForRuntime(
      rawNodeProps,
      componentType,
      node.displayName,
      styleClasses,
    ),
  };

  if (children.length > 0) {
    component.children = children;
  }

  return component;
};

const cloneComponentNode = (node: ComponentNode): ComponentNode => ({
  ...node,
  props: { ...node.props },
  ...(node.children
    ? { children: node.children.map(cloneComponentNode) }
    : {}),
});

const findNavbarChild = (
  children: ComponentNode[] | undefined,
  type: string,
): ComponentNode | undefined => children?.find((child) => child.type === type);

const processNavbarNode = (node: ComponentNode): ComponentNode => {
  if (node.type !== "Navbar") {
    return {
      ...node,
      ...(node.children
        ? {
            children: node.children.map((child) => processNavbarNode(child)),
          }
        : {}),
    };
  }

  const linksChild = findNavbarChild(node.children, "NavbarLinks");
  const menuChild = findNavbarChild(node.children, "NavbarMenu");

  if (linksChild && menuChild) {
    const linkTextChildren = (linksChild.children ?? [])
      .filter((child) => child.type === "LinkText")
      .map(cloneComponentNode);

    const updatedMenu: ComponentNode = {
      ...menuChild,
      children: linkTextChildren,
    };

    return {
      ...node,
      children: (node.children ?? []).map((child) => {
        if (child.nodeId === menuChild.nodeId) {
          return updatedMenu;
        }
        return processNavbarNode(child);
      }),
    };
  }

  return {
    ...node,
    ...(node.children
      ? {
          children: node.children.map((child) => processNavbarNode(child)),
        }
      : {}),
  };
};

const postProcessNavbarComponents = (
  components: ComponentNode[],
): ComponentNode[] => components.map((node) => processNavbarNode(node));

/**
 * Преобразует строку content (JSON из конструктора, `{ nodes, styleClasses }`) в ComponentNode[].
 */
export const craftContentToComponents = (content: string): ComponentNode[] => {
  if (!content) return [];

  const { nodes, styleClasses } = parsePageCraftContent(content);

  const root = nodes.ROOT as SerializedNodes[string] | undefined;
  if (!root || !Array.isArray(root.nodes)) {
    console.error("Некорректный Craft content: нет ROOT.nodes");
    return [];
  }

  const serializedNodes = nodes as SerializedNodes;
  const result: ComponentNode[] = [];
  const rootLinkedNodes = root.linkedNodes ?? {};
  const rootProps = (root.props ?? {}) as Record<string, unknown>;

  for (const childKey of root.nodes) {
    const actualChildId = rootLinkedNodes[childKey] || childKey;
    const child = buildNodeTree(serializedNodes, actualChildId, styleClasses);
    if (child) {
      result.push(child);
    }
  }

  const rootTypeName = resolveTypeName(root.type, "ROOT");
  const rootIsBody =
    rootTypeName === "Body" || rootTypeName === "CraftBody";

  if (rootIsBody) {
    if (result.length === 0) {
      return [];
    }
    return postProcessNavbarComponents([
      {
        nodeId: "ROOT",
        type: "Body",
        props: propsForRuntime(
          rootProps,
          "Body",
          root.displayName,
          styleClasses,
        ),
        children: result,
      },
    ]);
  }

  return postProcessNavbarComponents(result);
};
