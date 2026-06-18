import type { SsrLocale } from "../localeFromPath";

export type ConditionalVisibilityValue = string | number | boolean | null;

export type ConditionalVisibilityElse = "visible" | "hidden";

export type ConditionalVisibilityGroupMatch = "all" | "any";

export type ConditionalVisibilityGroupResult = "visible" | "hidden";

export type ConditionalVisibilityOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "greaterThan"
  | "greaterOrEqual"
  | "lessThan"
  | "lessOrEqual"
  | "isEmpty"
  | "isNotEmpty"
  | "inList"
  | "notInList";

export interface ConditionalVisibilityCollectionFieldSource {
  kind: "collectionField";
  fieldId: string;
}

export interface ConditionalVisibilityLocaleSource {
  kind: "locale";
}

export interface ConditionalVisibilityComponentPropSource {
  kind: "componentProp";
  propKey: string;
}

export type ConditionalVisibilitySource =
  | ConditionalVisibilityCollectionFieldSource
  | ConditionalVisibilityLocaleSource
  | ConditionalVisibilityComponentPropSource;

export interface ConditionalVisibilityCondition {
  id: string;
  source: ConditionalVisibilitySource;
  operator: ConditionalVisibilityOperator;
  value: ConditionalVisibilityValue;
  values: ConditionalVisibilityValue[];
}

export interface ConditionalVisibilityGroup {
  id: string;
  priority: number;
  matchType: ConditionalVisibilityGroupMatch;
  resultVisibility: ConditionalVisibilityGroupResult;
  conditions: ConditionalVisibilityCondition[];
}

export interface ConditionalVisibilityConfig {
  enabled: boolean;
  elseVisibility: ConditionalVisibilityElse;
  groups: ConditionalVisibilityGroup[];
}

export interface ConditionalVisibilitySourceResolverContext {
  collectionItem: unknown | null;
  locale: SsrLocale | string | null;
  componentProps: Record<string, unknown> | null;
}

export interface ConditionalVisibilityEvaluationContext {
  resolveSourceValue: (
    source: ConditionalVisibilitySource,
  ) => ConditionalVisibilityValue | undefined;
}

export interface ConditionalVisibilityEvaluationResult {
  isVisible: boolean;
  matchedGroupId: string | null;
}
