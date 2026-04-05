import React, { useCallback, useEffect, useState } from "react";
import type { IContentItem } from "../api/contentTypes";
import type { SitePage } from "../api/sitePagesApi";

export type SiteCollectionsContextValue = {
  domain: string;
  /** Кэш items по `getCollectionItemsCacheKey(filterScope, typeId)`; обновляется при смене категории в ContentList. */
  collectionItemsByKey: Record<string, IContentItem[]>;
  setItemsForKey: (cacheKey: string, items: IContentItem[]) => void;
  sitePages: SitePage[];
};

const defaultValue: SiteCollectionsContextValue = {
  domain: "",
  collectionItemsByKey: {},
  setItemsForKey: () => {},
  sitePages: [],
};

const SiteCollectionsContext =
  React.createContext<SiteCollectionsContextValue>(defaultValue);

export const SiteCollectionsProvider = ({
  domain,
  collectionItemsByKey: initialByKey,
  sitePages,
  children,
}: Omit<SiteCollectionsContextValue, "setItemsForKey"> & {
  children: React.ReactNode;
}) => {
  const [collectionItemsByKey, setCollectionItemsByKey] = useState<
    Record<string, IContentItem[]>
  >(initialByKey);

  useEffect(() => {
    setCollectionItemsByKey(initialByKey);
  }, [initialByKey]);

  const setItemsForKey = useCallback((cacheKey: string, items: IContentItem[]) => {
    setCollectionItemsByKey((prev) => ({ ...prev, [cacheKey]: items }));
  }, []);

  return (
    <SiteCollectionsContext.Provider
      value={{ domain, collectionItemsByKey, setItemsForKey, sitePages }}
    >
      {children}
    </SiteCollectionsContext.Provider>
  );
};

export const useSiteCollections = (): SiteCollectionsContextValue =>
  React.useContext(SiteCollectionsContext);
