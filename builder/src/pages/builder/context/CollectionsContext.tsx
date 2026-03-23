import { createContext, useContext } from "react"
import type { IContentItem, IContentTypeField } from "../../../api/extranet"

/**
 * Коллекция в билдере: `key` — `content_type_id` (UUID) для привязки в JSON страницы.
 * `fields` — метаданные полей типа (имена для селекта); `items` — экземпляры, подгружаются лениво.
 */
export type CollectionInfo = {
  key: string
  label: string
  items: IContentItem[]
  fields: IContentTypeField[]
}

export type CollectionsContextValue = {
  collections: CollectionInfo[]
  /** Кэш элементов по `content_type_id`; вызывается после fetch из ContentList. */
  setCollectionItems: (contentTypeId: string, items: IContentItem[]) => void
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
