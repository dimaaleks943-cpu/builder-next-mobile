/** SSR namespace for independently authored layout fragments. */
export type CraftFragmentScopePrefix = "hdr" | "main" | "ftr"

export const CRAFT_FRAGMENT_SCOPE = {
  header: "hdr",
  main: "main",
  footer: "ftr",
} as const satisfies Record<string, CraftFragmentScopePrefix>

export const prefixFragmentSlug = (
  slug: string,
  scopePrefix: CraftFragmentScopePrefix,
): string => `${scopePrefix}-${slug}`

export const prefixCraftNodeId = (
  nodeId: string,
  scopePrefix: CraftFragmentScopePrefix,
): string => `${scopePrefix}-${nodeId}`
