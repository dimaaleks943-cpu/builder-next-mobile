import { createContext, useContext } from "react"

export type ContentListDataContextValue = {
  collectionKey: string | null
  itemData: any | null
}
/** Позволяет компоненту внутри ячейки получить доступ к данным конкретного элемента коллекции без проброса пропсов через Craft. */
export const ContentListDataContext = createContext<ContentListDataContextValue | undefined>(
  undefined,
)

export const useContentListData = (): ContentListDataContextValue | undefined => {
  return useContext(ContentListDataContext)
}
