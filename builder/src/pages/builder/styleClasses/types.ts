import type { ResponsiveStyle } from "../responsiveStyle.ts"

export const STYLE_CLASSES_ROOT_CUSTOM_KEY = "styleClasses" as const

export type StyleClassDefinition = {
  id: string
  name: string
  /** `resolveNodeDisplayName` value, e.g. CraftBlock */
  resolvedName: string
  style: ResponsiveStyle
}

export type StyleClassesRegistry = Record<string, StyleClassDefinition>

export type StyleClassesRootCustom = {
  [STYLE_CLASSES_ROOT_CUSTOM_KEY]?: StyleClassesRegistry
}
