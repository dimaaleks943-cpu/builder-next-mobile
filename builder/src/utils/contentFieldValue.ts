import type { IContentItem, IContentItemField } from "../api/extranet"

export function findContentItemField(
  item: IContentItem | null | undefined,
  fieldId: string,
): IContentItemField | undefined {
  if (!item?.fields?.length) return undefined
  return item.fields.find((f) => f.id === fieldId)
}

/**
 * Строка для превью текста. Значения приходят в разных `value_*` в зависимости от типа поля;
 * единой строковой схемы нет — обрабатываем типичные варианты и безопасно сериализуем остальное.
 */
export function getContentFieldDisplayValue(field: IContentItemField | undefined): string {
  if (!field) return ""

  if (field.value_text != null && field.value_text !== "") {
    return String(field.value_text)
  }
  if (field.value_boolean !== null && field.value_boolean !== undefined) {
    return field.value_boolean ? "true" : "false"
  }
  if (field.value_float !== null && field.value_float !== undefined && !Number.isNaN(field.value_float)) {
    return String(field.value_float)
  }
  const v = field.value
  if (v === null || v === undefined) return ""
  if (typeof v === "string") return v
  if (typeof v === "number" || typeof v === "boolean") return String(v)
  if (typeof v === "object") {
    try {
      return JSON.stringify(v)
    } catch {
      return String(v)
    }
  }
  return String(v)
}
