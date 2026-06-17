import {
  DEFAULT_CONDITIONAL_VISIBILITY_CONFIG,
  createDefaultConditionalVisibilityCondition,
} from "./defaults.ts"
import type {
  ConditionalVisibilityCondition,
  ConditionalVisibilityConfig,
  ConditionalVisibilityGroup,
  ConditionalVisibilityOperator,
  ConditionalVisibilitySource,
  ConditionalVisibilityValue,
} from "./types.ts"

const ALLOWED_OPERATORS: ConditionalVisibilityOperator[] = [
  "equals",
  "notEquals",
  "contains",
  "notContains",
  "greaterThan",
  "greaterOrEqual",
  "lessThan",
  "lessOrEqual",
  "isEmpty",
  "isNotEmpty",
  "inList",
  "notInList",
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const toStringOrFallback = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback

const toFiniteNumberOrFallback = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

const toConditionValue = (value: unknown): ConditionalVisibilityValue => {
  if (value === null) {
    return null
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value
  }

  return ""
}

const normalizeSource = (raw: unknown): ConditionalVisibilitySource => {
  if (!isRecord(raw)) {
    return { kind: "locale" }
  }

  const sourceKind = raw.kind
  if (sourceKind === "collectionField") {
    return {
      kind: "collectionField",
      fieldId: toStringOrFallback(raw.fieldId, ""),
    }
  }

  if (sourceKind === "componentProp") {
    return {
      kind: "componentProp",
      propKey: toStringOrFallback(raw.propKey, ""),
    }
  }

  return { kind: "locale" }
}

const normalizeOperator = (raw: unknown): ConditionalVisibilityOperator =>
  typeof raw === "string" && ALLOWED_OPERATORS.includes(raw as ConditionalVisibilityOperator)
    ? (raw as ConditionalVisibilityOperator)
    : "equals"

const normalizeCondition = (
  raw: unknown,
  fallback: ConditionalVisibilityCondition,
): ConditionalVisibilityCondition => {
  if (!isRecord(raw)) {
    return fallback
  }

  const normalizedValue = toConditionValue(raw.value)
  const normalizedValues = Array.isArray(raw.values)
    ? raw.values.map((value) => toConditionValue(value))
    : []

  return {
    id: toStringOrFallback(raw.id, fallback.id),
    source: normalizeSource(raw.source),
    operator: normalizeOperator(raw.operator),
    value: normalizedValue,
    values: normalizedValues,
  }
}

const normalizeGroup = (raw: unknown, index: number): ConditionalVisibilityGroup | null => {
  if (!isRecord(raw)) {
    return null
  }

  const fallbackCondition = createDefaultConditionalVisibilityCondition()
  const rawConditions = Array.isArray(raw.conditions) ? raw.conditions : []
  const conditions = rawConditions
    .map((condition) => normalizeCondition(condition, fallbackCondition))
    .filter((condition) => Boolean(condition.id))

  return {
    id: toStringOrFallback(raw.id, `group-${index + 1}`),
    priority: toFiniteNumberOrFallback(raw.priority, index),
    matchType: raw.matchType === "any" ? "any" : "all",
    resultVisibility: raw.resultVisibility === "visible" ? "visible" : "hidden",
    conditions,
  }
}

export const normalizeConditionalVisibilityConfig = (
  raw: unknown,
): ConditionalVisibilityConfig => {
  if (!isRecord(raw)) {
    return DEFAULT_CONDITIONAL_VISIBILITY_CONFIG
  }

  const groups = Array.isArray(raw.groups)
    ? raw.groups
        .map((group, index) => normalizeGroup(group, index))
        .filter((group): group is ConditionalVisibilityGroup => group !== null)
    : []

  return {
    enabled: raw.enabled === true,
    elseVisibility: raw.elseVisibility === "hidden" ? "hidden" : "visible",
    groups,
  }
}
