import type { ResponsiveStyle } from "../responsiveStyle.ts"

export type StyleClassKind = "base" | "combo"

export type StyleClassDefinition = {
  id: string
  name: string
  /** `resolveNodeDisplayName` value, e.g. CraftBlock */
  resolvedName: string
  style: ResponsiveStyle
  kind?: StyleClassKind
  comboMemberIds?: string[]
}

export type StyleClassesRegistry = Record<string, StyleClassDefinition>
