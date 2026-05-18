import { createStyleClassId } from "./styleClassNames.ts"
import type { StyleClassDefinition, StyleClassesRegistry } from "./types.ts"

export const duplicateStyleClass = (
  source: StyleClassDefinition,
  _registry: StyleClassesRegistry,
): StyleClassDefinition => ({
  id: createStyleClassId(),
  name: `${source.name} Copy`,
  resolvedName: source.resolvedName,
  kind: "base",
  style: structuredClone(source.style),
})
