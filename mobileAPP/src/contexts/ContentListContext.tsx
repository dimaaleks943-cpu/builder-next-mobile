import React from "react";

/** В ячейке ContentList — чтобы LinkText мог подставить slug категории в template-URL. */
export type ContentListContextValue = {
  filterScope: string | undefined;
};

const defaultValue: ContentListContextValue = { filterScope: undefined };

const ContentListContext =
  React.createContext<ContentListContextValue>(defaultValue);

export const ContentListProvider = ({
  children,
  filterScope,
}: {
  children: React.ReactNode;
  filterScope: string | undefined;
}) => {
  const value = React.useMemo(() => ({ filterScope }), [filterScope]);
  return (
    <ContentListContext.Provider value={value}>
      {children}
    </ContentListContext.Provider>
  );
};

export const useContentListContext = (): ContentListContextValue =>
  React.useContext(ContentListContext);
