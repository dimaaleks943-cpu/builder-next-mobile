import {
  FULL_TO_SHORT,
  SHORT_TO_FULL,
  type FullStylePropKey,
  type ShortStylePropKey,
} from "./stylePropsShortMapV1";

type StylePropsInput = Record<string, unknown> | null | undefined;

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

export const encodeStyleProps = (
  fullProps: StylePropsInput,
): Record<string, unknown> => {
  if (!fullProps) return {};

  const encoded: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fullProps)) {
    const shortKey = FULL_TO_SHORT[key as FullStylePropKey] ?? key;
    encoded[shortKey] = value;
  }

  return encoded;
};

export const decodeStyleProps = (
  shortProps: StylePropsInput,
): Record<string, unknown> => {
  if (!shortProps) return {};

  const decoded: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(shortProps)) {
    const fullKey = SHORT_TO_FULL[key as ShortStylePropKey] ?? key;
    decoded[fullKey] = value;
  }

  return decoded;
};

export const decodeSerializedNodesStyleProps = (
  nodes: SerializedNodes,
): SerializedNodes => {
  const decodedEntries = Object.entries(nodes).map(([nodeId, node]) => [
    nodeId,
    {
      ...node,
      props: decodeStyleProps(node.props as Record<string, unknown> | undefined),
    },
  ]);

  return Object.fromEntries(decodedEntries) as SerializedNodes;
};
