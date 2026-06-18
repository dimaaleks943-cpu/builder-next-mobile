import type {
  ConditionalVisibilityCondition,
  ConditionalVisibilityConfig,
  ConditionalVisibilityEvaluationContext,
  ConditionalVisibilityEvaluationResult,
  ConditionalVisibilityValue,
} from "./types";

const isEmptyValue = (value: ConditionalVisibilityValue | undefined): boolean =>
  value === undefined || value === null || value === "";

const toComparableNumber = (
  value: ConditionalVisibilityValue | undefined,
): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const toComparableString = (
  value: ConditionalVisibilityValue | undefined,
): string => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
};

const evaluateCondition = (
  condition: ConditionalVisibilityCondition,
  context: ConditionalVisibilityEvaluationContext,
): boolean => {
  const sourceValue = context.resolveSourceValue(condition.source);
  const operand = condition.value;

  if (condition.operator === "isEmpty") {
    return isEmptyValue(sourceValue);
  }

  if (condition.operator === "isNotEmpty") {
    return !isEmptyValue(sourceValue);
  }

  if (condition.operator === "equals") {
    return sourceValue === operand;
  }

  if (condition.operator === "notEquals") {
    return sourceValue !== operand;
  }

  if (condition.operator === "contains") {
    return toComparableString(sourceValue).includes(toComparableString(operand));
  }

  if (condition.operator === "notContains") {
    return !toComparableString(sourceValue).includes(
      toComparableString(operand),
    );
  }

  if (condition.operator === "greaterThan") {
    const sourceNumber = toComparableNumber(sourceValue);
    const operandNumber = toComparableNumber(operand);
    return (
      sourceNumber !== null &&
      operandNumber !== null &&
      sourceNumber > operandNumber
    );
  }

  if (condition.operator === "greaterOrEqual") {
    const sourceNumber = toComparableNumber(sourceValue);
    const operandNumber = toComparableNumber(operand);
    return (
      sourceNumber !== null &&
      operandNumber !== null &&
      sourceNumber >= operandNumber
    );
  }

  if (condition.operator === "lessThan") {
    const sourceNumber = toComparableNumber(sourceValue);
    const operandNumber = toComparableNumber(operand);
    return (
      sourceNumber !== null &&
      operandNumber !== null &&
      sourceNumber < operandNumber
    );
  }

  if (condition.operator === "lessOrEqual") {
    const sourceNumber = toComparableNumber(sourceValue);
    const operandNumber = toComparableNumber(operand);
    return (
      sourceNumber !== null &&
      operandNumber !== null &&
      sourceNumber <= operandNumber
    );
  }

  if (condition.operator === "inList") {
    return condition.values.some((value) => value === sourceValue);
  }

  if (condition.operator === "notInList") {
    return !condition.values.some((value) => value === sourceValue);
  }

  return false;
};

export const evaluateConditionalVisibility = (params: {
  rawConfig: ConditionalVisibilityConfig | null | undefined;
  context: ConditionalVisibilityEvaluationContext;
}): ConditionalVisibilityEvaluationResult => {
  const config = params.rawConfig;

  if (!config || !config.enabled) {
    return {
      isVisible: true,
      matchedGroupId: null,
    };
  }

  const sortedGroups = [...config.groups].sort(
    (left, right) => left.priority - right.priority,
  );

  for (const group of sortedGroups) {
    if (group.conditions.length === 0) {
      continue;
    }

    const conditionMatches = group.conditions.map((condition) =>
      evaluateCondition(condition, params.context),
    );
    const matched =
      group.matchType === "all"
        ? conditionMatches.every((value) => value)
        : conditionMatches.some((value) => value);

    if (matched) {
      return {
        isVisible: group.resultVisibility === "visible",
        matchedGroupId: group.id,
      };
    }
  }

  return {
    isVisible: config.elseVisibility === "visible",
    matchedGroupId: null,
  };
};
