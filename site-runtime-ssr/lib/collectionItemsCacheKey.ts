/**
 * Составной ключ кэша элементов коллекции: `filterScope::content_type_id`,
 * либо только `content_type_id`, если scope не задан.
 * Разделяет данные списков одного типа с разными фильтрами и совпадает с ключом SSR-префетча.
 */
export function getCollectionItemsCacheKey(
  filterScope: string | undefined | null,
  contentTypeId: string,
): string {
  const scope = filterScope?.trim()
  if (!scope) return contentTypeId
  return `${scope}::${contentTypeId}`
}
