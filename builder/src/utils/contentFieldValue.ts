import type { IContentItem, IContentItemField } from "../api/extranet"

/** UUID контент-типа (источник коллекции в Craft). Не legacy-ключи вроде `products`. */
const CONTENT_TYPE_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isExtranetContentTypeId(key: string): boolean {
  return CONTENT_TYPE_ID_RE.test(key.trim())
}

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

/**
 * URL для `<img src>`. Поддержка строки и вложенных объектов (как у каталога: urls.small.url).
 */
export function getContentFieldImageUrl(field: IContentItemField | undefined): string | undefined {
  if (!field) return undefined

  const fromText = field.value_text?.trim()
  if (fromText) return fromText

  const v = field.value
  if (typeof v === "string" && v.trim()) return v.trim()

  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>
    const direct = o.url
    if (typeof direct === "string" && direct) return direct
    const urls = o.urls as Record<string, { url?: string }> | undefined
    const fromSmall = urls?.small?.url
    const fromOriginal = urls?.original?.url
    const candidate =
      (typeof fromSmall === "string" && fromSmall) ||
      (typeof fromOriginal === "string" && fromOriginal)
    if (candidate) return candidate
  }

  const s = getContentFieldDisplayValue(field).trim()
  return s || undefined
}

/** Данные элемента коллекции: новый контракт (`fields[]`) или плоский legacy-объект (старые пресеты). */
export function isLegacyFlatCollectionItem(item: unknown): item is Record<string, unknown> {
  if (!item || typeof item !== "object") return false
  return !Array.isArray((item as IContentItem).fields)
}
