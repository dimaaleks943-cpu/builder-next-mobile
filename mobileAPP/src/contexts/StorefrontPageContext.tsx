import React from "react";

import type { PreviewParams } from "../lib/previewQuery";

export type StorefrontPageContextValue = {
  pageBaseSlug: string;
  categorySlugTrailFromUrl: string | null;
  previewParams: PreviewParams;
};

const defaultValue: StorefrontPageContextValue = {
  pageBaseSlug: "/",
  categorySlugTrailFromUrl: null,
  previewParams: {},
};

const StorefrontPageContext =
  React.createContext<StorefrontPageContextValue>(defaultValue);

export const StorefrontPageProvider = ({
  children,
  pageBaseSlug,
  categorySlugTrailFromUrl,
  previewParams,
}: {
  children: React.ReactNode;
  pageBaseSlug: string;
  categorySlugTrailFromUrl: string | null;
  previewParams: PreviewParams;
}) => {
  const value = React.useMemo(
    () => ({ pageBaseSlug, categorySlugTrailFromUrl, previewParams }),
    [pageBaseSlug, categorySlugTrailFromUrl, previewParams],
  );
  return (
    <StorefrontPageContext.Provider value={value}>
      {children}
    </StorefrontPageContext.Provider>
  );
};

export const useStorefrontPage = (): StorefrontPageContextValue =>
  React.useContext(StorefrontPageContext);
