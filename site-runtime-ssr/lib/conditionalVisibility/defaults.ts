import type {
  ConditionalVisibilityCondition,
  ConditionalVisibilityConfig,
  ConditionalVisibilityGroup,
  ConditionalVisibilitySource,
} from "./types"

const createId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const DEFAULT_SOURCE: ConditionalVisibilitySource = {
  kind: "locale",
}

export const createDefaultConditionalVisibilityCondition =
  (): ConditionalVisibilityCondition => ({
    id: createId("condition"),
    source: DEFAULT_SOURCE,
    operator: "equals",
    value: "",
    values: [],
  })

export const createDefaultConditionalVisibilityGroup =
  (): ConditionalVisibilityGroup => ({
    id: createId("group"),
    priority: 0,
    matchType: "all",
    resultVisibility: "hidden",
    conditions: [createDefaultConditionalVisibilityCondition()],
  })

export const DEFAULT_CONDITIONAL_VISIBILITY_CONFIG: ConditionalVisibilityConfig = {
  enabled: false,
  elseVisibility: "visible",
  groups: [],
}
