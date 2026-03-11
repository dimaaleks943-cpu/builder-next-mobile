import React from "react";

export interface ContentDataContextValue {
  collectionKey: string | null;
  itemData: any | null;
}

const ContentDataContext = React.createContext<ContentDataContextValue>({
  collectionKey: null,
  itemData: null,
});

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
  );
};

export const useContentData = () => {
  return React.useContext(ContentDataContext);
};

