/**
 * Составной ключ кэша элементов коллекции: `filterScope::content_type_id`,
 * либо только `content_type_id`, если scope не задан.
 *
 * Нужен, чтобы один и тот же `content_type_id` мог отображаться в нескольких списках с разными фильтрами
 * и чтобы SSR/клиент не затирали данные разных scope друг друга.
 */
export function getCollectionItemsCacheKey(
  filterScope: string | undefined | null,
  contentTypeId: string,
): string {
  const scope = filterScope?.trim()
  // Пустая строка после trim считается отсутствием scope — тот же ключ, что у списка без фильтра.
  if (!scope) return contentTypeId
  return `${scope}::${contentTypeId}`
}
