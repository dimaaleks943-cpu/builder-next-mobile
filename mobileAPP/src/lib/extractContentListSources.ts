/**
 * Обход сериализованного Craft JSON: уникальные `selectedSource` (content_type_id) у узлов ContentList.
 */

type SerializedNode = {
  type: unknown;
  props?: Record<string, unknown>;
  hidden?: boolean;
};

type SerializedNodes = Record<string, SerializedNode>;

const resolveTypeName = (type: unknown): string => {
  if (!type) return "div";
  if (typeof type === "string") return type;
  if (typeof type === "object") {
    const t = type as { resolvedName?: string; displayName?: string };
    if (typeof t.resolvedName === "string") return t.resolvedName;
    if (typeof t.displayName === "string") return t.displayName;
  }
  return "div";
};

export type ContentListPrefetchPair = {
  selectedSource: string;
  filterScope?: string;
};

export const extractContentListPrefetchPairsFromCraftContent = (
  content: string,
): ContentListPrefetchPair[] => {
  if (!content.trim()) return [];

  let nodes: SerializedNodes;
  try {
    nodes = JSON.parse(content) as SerializedNodes;
  } catch {
    return [];
  }

  const byDedupeKey = new Map<string, ContentListPrefetchPair>();
  for (const nodeId of Object.keys(nodes)) {
    const node = nodes[nodeId];
    if (!node || node.hidden) continue;
    if (resolveTypeName(node.type) !== "ContentList") continue;
    const rawSource = node.props?.selectedSource;
    if (typeof rawSource !== "string" || !rawSource.trim()) continue;
    const selectedSource = rawSource.trim();
    const rawScope = node.props?.filterScope;
    const scope =
      typeof rawScope === "string" && rawScope.trim()
        ? rawScope.trim()
        : undefined;
    const dedupeKey = scope ? `${scope}::${selectedSource}` : selectedSource;
    byDedupeKey.set(dedupeKey, {
      selectedSource,
      filterScope: scope,
    });
  }

  return Array.from(byDedupeKey.values());
};
