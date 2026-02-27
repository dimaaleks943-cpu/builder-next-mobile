import { createContext, useContext } from "react"

export type CollectionInfo = {
  key: string
  label: string
  items: any[]
}

export type CollectionsContextValue = {
  collections: CollectionInfo[]
}

/**
 * Пробрасываем инфу о всех загруженных коллекциях, что бы показать список доступных коллекций,
 * динамически собрать список полей и привязывать значение к компоненту (Text)
 * */
export const CollectionsContext = createContext<CollectionsContextValue | undefined>(
  undefined,
)

export const useCollectionsContext = (): CollectionsContextValue | undefined => {
  return useContext(CollectionsContext)
}

