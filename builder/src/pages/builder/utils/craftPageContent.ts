import type { SerializedNodes } from "@craftjs/core"
import {
  decodeSerializedNodesStyleProps,
  encodeSerializedNodesStyleProps,
} from "../../../utils/stylePropsCodec.ts"
import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts"
import { BODY_CRAFT_DEFAULT_PROPS } from "../../../craft/defaultDefaultCraftStyles.ts"
import type { StyleClassesRegistry } from "../styleClasses/types.ts"
import { pruneUnusedStyleClasses } from "../styleClasses/pruneUnusedStyleClasses.ts"

const bodyCraftProps = structuredClone(BODY_CRAFT_DEFAULT_PROPS)

/** Пустое дерево Craft (только ROOT + Body без детей). */
export const EMPTY_SERIALIZED_NODES: SerializedNodes = {
  ROOT: {
    type: { resolvedName: "Body" },
    isCanvas: true,
    props: bodyCraftProps,
    displayName: CRAFT_DISPLAY_NAME.Body,
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
    parent: null,
  },
}

export type PageCraftContent = {
  nodes: SerializedNodes
  styleClasses: StyleClassesRegistry
}

const isSerializedNodes = (value: unknown): value is SerializedNodes =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  "ROOT" in (value as Record<string, unknown>)

export const parsePageCraftContent = (raw: string): PageCraftContent => {
  if (!raw?.trim()) {
    return { nodes: EMPTY_SERIALIZED_NODES, styleClasses: {} }
  }
  try {
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      "nodes" in parsed &&
      isSerializedNodes((parsed as PageCraftContent).nodes)
    ) {
      const content = parsed as PageCraftContent
      const nodes = decodeSerializedNodesStyleProps(content.nodes)
      return {
        nodes,
        styleClasses: pruneUnusedStyleClasses(
          { ...(content.styleClasses ?? {}) },
          nodes,
        ),
      }
    }
    if (isSerializedNodes(parsed)) {
      return {
        nodes: decodeSerializedNodesStyleProps(parsed),
        styleClasses: {},
      }
    }
  } catch {
    /* fall through */
  }
  return { nodes: EMPTY_SERIALIZED_NODES, styleClasses: {} }
}

export const stringifyPageCraftContent = (content: PageCraftContent): string => {
  const nodes = encodeSerializedNodesStyleProps(content.nodes)
  return JSON.stringify({
    nodes,
    styleClasses: pruneUnusedStyleClasses(content.styleClasses, nodes),
  })
}
