import type { StyleClassesRegistry } from "./types"

export const styleClassSlug = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "class"

export const buildComboSelector = (
  memberIds: readonly string[],
  registry: StyleClassesRegistry,
): string =>
  memberIds
    .map((id) => {
      const name = registry[id]?.name ?? id
      return `.${styleClassSlug(name)}`
    })
    .join("")

export const styleClassSlugsFromIds = (
  styleClassIds: readonly string[],
  registry: StyleClassesRegistry,
): string[] =>
  styleClassIds
    .filter((id): id is string => typeof id === "string" && id.length > 0)
    .map((id) => styleClassSlug(registry[id]?.name ?? id))

export const classNameFromStyleClassIds = (
  styleClassIds: readonly string[],
  registry: StyleClassesRegistry,
): string | undefined => {
  const slugs = styleClassSlugsFromIds(styleClassIds, registry)
  return slugs.length > 0 ? slugs.join(" ") : undefined
}
