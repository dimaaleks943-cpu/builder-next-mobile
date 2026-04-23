import { SHORT_TO_FULL, type ShortStylePropKey, } from "./stylePropsShortMapV1";
import { VIEWPORT_CASCADE } from "./responsiveStyle";

type StylePropsInput = Record<string, unknown> | null | undefined;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const decodeStyleBranch = (
  shortStyleBranch: Record<string, unknown>,
): Record<string, unknown> => {
  const decoded: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(shortStyleBranch)) {
    const fullKey = SHORT_TO_FULL[key as ShortStylePropKey] ?? key;
    decoded[fullKey] = value;
  }

  return decoded;
};

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

export const decodeStyleProps = (
  shortProps: StylePropsInput,
): Record<string, unknown> => {
  if (!shortProps) return {};

  const decoded = { ...shortProps };
  const style = shortProps.style;
  if (!isRecord(style)) {
    return decoded;
  }

  const decodedStyle: Record<string, unknown> = {};
  for (const branch of VIEWPORT_CASCADE) {
    const branchValue = style[branch];
    if (!isRecord(branchValue)) continue;
    decodedStyle[branch] = decodeStyleBranch(branchValue);
  }

  decoded.style = decodedStyle;
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
