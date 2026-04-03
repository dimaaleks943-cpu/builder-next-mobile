import { createContext, useContext } from "react"
import type { IContentItem, IContentTypeField } from "../../../api/extranet"

/**
 * Коллекция в билдере: `key` — `content_type_id` (UUID) для привязки в JSON страницы.
 * `fields` — метаданные полей типа (имена для селекта); `items` — экземпляры без scope (ленивая загрузка по типу).
 * Для витрин с `filterScope` кэш элементов — в `collectionItemsByKey` по ключу `getCollectionItemsCacheKey(scope, content_type_id)`.
 */
export type CollectionInfo = {
  key: string
  label: string
  items: IContentItem[]
  fields: IContentTypeField[]
}

export type CollectionsContextValue = {
  collections: CollectionInfo[]
  /** Кэш элементов по составному ключу (`scope::typeId` или голый `content_type_id`). */
  collectionItemsByKey: Record<string, IContentItem[]>
  /** Запись среза items для превью; `cacheKey` совпадает с `getCollectionItemsCacheKey` при filterScope. */
  setCollectionItems: (cacheKey: string, items: IContentItem[]) => void
}

/**
 * Пробрасываем инфу о всех загруженных коллекциях, что бы показать список доступных коллекций,
 * динамически собрать список полей и привязывать значение к компоненту (Text)
 */
export const CollectionsContext = createContext<CollectionsContextValue | undefined>(
  undefined,
)

export const useCollectionsContext = (): CollectionsContextValue | undefined => {
  return useContext(CollectionsContext)
}
