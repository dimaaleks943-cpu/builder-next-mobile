import type { ResponsiveStyle } from "../responsiveCss"

export type StyleClassDefinition = {
  id: string
  name: string
  resolvedName: string
  style: ResponsiveStyle
}

export type StyleClassesRegistry = Record<string, StyleClassDefinition>

export type PageCraftContent = {
  nodes: Record<string, unknown>
  styleClasses: StyleClassesRegistry
}
