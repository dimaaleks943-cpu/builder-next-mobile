import { decodeSerializedNodesStyleProps } from "../content/stylePropsCodec";
import type { PageCraftContent, StyleClassesRegistry } from "./styleClasses/types";

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

const EMPTY_ROOT: SerializedNodes = {
  ROOT: {
    type: { resolvedName: "Body" },
    isCanvas: true,
    props: {},
    displayName: "CraftBody",
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
    parent: undefined,
  },
};

const isSerializedNodes = (value: unknown): value is SerializedNodes =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  "ROOT" in (value as Record<string, unknown>);

/**
 * Parses builder mobile content: `{ nodes, styleClasses }` only.
 */
export const parsePageCraftContent = (raw: string): PageCraftContent => {
  if (!raw?.trim()) {
    return { nodes: EMPTY_ROOT, styleClasses: {} };
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      "nodes" in parsed &&
      isSerializedNodes((parsed as PageCraftContent).nodes as SerializedNodes)
    ) {
      const content = parsed as PageCraftContent;
      return {
        nodes: decodeSerializedNodesStyleProps(content.nodes as SerializedNodes),
        styleClasses: {
          ...(content.styleClasses ?? {}),
        } as StyleClassesRegistry,
      };
    }
  } catch (error) {
    console.error("[parsePageCraftContent] Failed to parse craft content:", error);
  }
  return { nodes: EMPTY_ROOT, styleClasses: {} };
};
