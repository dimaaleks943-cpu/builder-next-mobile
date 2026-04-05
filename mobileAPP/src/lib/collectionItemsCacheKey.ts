/**
 * Составной ключ кэша элементов коллекции: `filterScope::content_type_id`,
 * либо только `content_type_id`, если scope не задан.
 * Совпадает с логикой билдера/SSR, чтобы мобильное приложение использовало те же слоты кэша.
 */
export function getCollectionItemsCacheKey(
  filterScope: string | undefined | null,
  contentTypeId: string,
): string {
  const scope = filterScope?.trim();
  if (!scope) return contentTypeId;
  return `${scope}::${contentTypeId}`;
}
