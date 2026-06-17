import type { IContentItem, IContentItemField } from "../../../../api/extranet.ts"
import { findContentItemField } from "../../../../utils/contentFieldValue.ts"
import type {
  ConditionalVisibilitySource,
  ConditionalVisibilitySourceResolverContext,
  ConditionalVisibilityValue,
} from "./types.ts"

const toPrimitiveValue = (value: unknown): ConditionalVisibilityValue | undefined => {
  if (value === null) {
    return null
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value
  }

  return undefined
}

const resolveContentFieldValue = (
  field: IContentItemField | undefined,
): ConditionalVisibilityValue | undefined => {
  if (!field) {
    return undefined
  }

  if (field.value_text !== null && field.value_text !== undefined) {
    return toPrimitiveValue(field.value_text)
  }

  if (field.value_float !== null && field.value_float !== undefined) {
    const floatValue = toPrimitiveValue(field.value_float)
    return typeof floatValue === "number" && Number.isFinite(floatValue) ? floatValue : undefined
  }

  if (field.value_boolean !== null && field.value_boolean !== undefined) {
    return toPrimitiveValue(field.value_boolean)
  }

  return toPrimitiveValue(field.value)
}

export const resolveConditionalVisibilitySourceValue = (
  source: ConditionalVisibilitySource,
  context: ConditionalVisibilitySourceResolverContext,
): ConditionalVisibilityValue | undefined => {
  if (source.kind === "locale") {
    return toPrimitiveValue(context.locale ?? null)
  }

  if (source.kind === "collectionField") {
    const item = (context.collectionItem ?? null) as IContentItem | null
    if (!item || !source.fieldId) {
      return undefined
    }

    const field = findContentItemField(item, source.fieldId)
    return resolveContentFieldValue(field)
  }

  if (source.kind === "componentProp") {
    if (!context.componentProps || !source.propKey) {
      return undefined
    }

    return toPrimitiveValue(context.componentProps[source.propKey])
  }

  return undefined
}
