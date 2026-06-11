import { CRAFT_DISPLAY_NAME } from "../craftDisplayNames.ts"

type CraftNodeData = {
  displayName?: string
  type?: { resolvedName?: string } | string
}

type CraftNodeRef = { data: CraftNodeData }

const DISPLAY_NAME_TO_RESOLVED = Object.fromEntries(
  Object.entries(CRAFT_DISPLAY_NAME).map(([resolvedName, displayName]) => [
    displayName,
    resolvedName,
  ]),
) as Record<string, string>

/** Resolver key (`FormInput`) from a Craft node ref used in `canMoveIn` checks. */
export const resolveCraftNodeResolvedName = (node: CraftNodeRef): string => {
  const type = node.data?.type

  if (type && typeof type === "object" && typeof type.resolvedName === "string") {
    return type.resolvedName
  }

  if (typeof type === "string") {
    return type
  }

  const displayName = node.data?.displayName
  if (displayName && DISPLAY_NAME_TO_RESOLVED[displayName]) {
    return DISPLAY_NAME_TO_RESOLVED[displayName]
  }

  return ""
}

/** Allowed direct children of {@link CraftFormWrapper}. */
export const FORM_WRAPPER_CHILD_RESOLVED_NAMES = new Set([
  "FormForm",
  "FormSuccessMessage",
  "FormErrorMessage",
])

/** Allowed direct children of {@link CraftFormForm}. */
export const FORM_FORM_CHILD_RESOLVED_NAMES = new Set([
  "FormInput",
  "FormButton",
  "Block",
])

/** Allowed children of {@link CraftFormInput}. */
export const FORM_INPUT_CHILD_RESOLVED_NAMES = new Set([
  "FormBlockLabel",
  "FormTextInput",
  "FormTextarea",
])

export const everyNodeResolvedNameIn =
  (allowed: Set<string>) =>
  (nodes: CraftNodeRef[]): boolean =>
    nodes.every((node) => allowed.has(resolveCraftNodeResolvedName(node)))

export const canMoveIntoFormWrapper = everyNodeResolvedNameIn(
  FORM_WRAPPER_CHILD_RESOLVED_NAMES,
)

export const canMoveIntoFormForm = everyNodeResolvedNameIn(
  FORM_FORM_CHILD_RESOLVED_NAMES,
)

export const canMoveIntoFormInput = everyNodeResolvedNameIn(
  FORM_INPUT_CHILD_RESOLVED_NAMES,
)
