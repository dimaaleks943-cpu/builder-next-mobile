import React from "react";

export type StorefrontPageContextValue = {
  pageBaseSlug: string;
  categorySlugTrailFromUrl: string | null;
};

const defaultValue: StorefrontPageContextValue = {
  pageBaseSlug: "/",
  categorySlugTrailFromUrl: null,
};

const StorefrontPageContext =
  React.createContext<StorefrontPageContextValue>(defaultValue);

export const StorefrontPageProvider = ({
  children,
  pageBaseSlug,
  categorySlugTrailFromUrl,
}: {
  children: React.ReactNode;
  pageBaseSlug: string;
  categorySlugTrailFromUrl: string | null;
}) => {
  const value = React.useMemo(
    () => ({ pageBaseSlug, categorySlugTrailFromUrl }),
    [pageBaseSlug, categorySlugTrailFromUrl],
  );
  return (
    <StorefrontPageContext.Provider value={value}>
      {children}
    </StorefrontPageContext.Provider>
  );
};

export const useStorefrontPage = (): StorefrontPageContextValue =>
  React.useContext(StorefrontPageContext);
