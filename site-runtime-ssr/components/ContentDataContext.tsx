import React from "react"

export interface ContentDataContextValue {
  collectionKey: string | null
  itemData: any | null
}

/**
 * Глобальный контекст данных для "динамических" контейнеров (список, таблица и т.п.).
 * Через него простые компоненты (например, `Text`) получают данные текущего элемента
 * коллекции/строки/записи, не зная, в каком именно контейнере они находятся.
 *
 * @example
 * <ContentDataProvider collectionKey="550e8400-e29b-41d4-a716-446655440000" itemData={item}>
 *   <Text collectionField="<content-field-uuid>" />
 * </ContentDataProvider>
 */
const ContentDataContext = React.createContext<ContentDataContextValue>({
  collectionKey: null,
  itemData: null,
})

export const ContentDataProvider = ({
  collectionKey,
  itemData,
  children,
}: ContentDataContextValue & { children: React.ReactNode }) => {
  return (
    <ContentDataContext.Provider
      value={{
        collectionKey,
        itemData,
      }}
    >
      {children}
    </ContentDataContext.Provider>
  )
}

export const useContentData = () => {
  return React.useContext(ContentDataContext)
}

