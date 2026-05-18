import type { CraftFragmentScopePrefix } from "./fragmentScope"
import { prefixFragmentSlug } from "./fragmentScope"
import type { StyleClassesRegistry } from "./types"

export const styleClassSlug = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "class"

export const scopedStyleClassSlug = (
  name: string,
  scopePrefix: CraftFragmentScopePrefix,
): string => prefixFragmentSlug(styleClassSlug(name), scopePrefix)

export const buildComboSelector = (
  memberIds: readonly string[],
  registry: StyleClassesRegistry,
  scopePrefix: CraftFragmentScopePrefix,
): string =>
  memberIds
    .map((id) => {
      const name = registry[id]?.name ?? id
      return `.${scopedStyleClassSlug(name, scopePrefix)}`
    })
    .join("")

export const styleClassSlugsFromIds = (
  styleClassIds: readonly string[],
  registry: StyleClassesRegistry,
  scopePrefix: CraftFragmentScopePrefix,
): string[] =>
  styleClassIds
    .filter((id): id is string => typeof id === "string" && id.length > 0)
    .map((id) => scopedStyleClassSlug(registry[id]?.name ?? id, scopePrefix))

export const classNameFromStyleClassIds = (
  styleClassIds: readonly string[],
  registry: StyleClassesRegistry,
  scopePrefix: CraftFragmentScopePrefix,
): string | undefined => {
  const slugs = styleClassSlugsFromIds(styleClassIds, registry, scopePrefix)
  return slugs.length > 0 ? slugs.join(" ") : undefined
}
