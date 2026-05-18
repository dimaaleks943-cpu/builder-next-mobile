import type { StyleClassesRegistry } from "./types.ts"

export const buildComboClassLabel = (
  memberIds: readonly string[],
  registry: StyleClassesRegistry,
): string => memberIds.map((id) => registry[id]?.name ?? id).join(" · ")
