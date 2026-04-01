import React from "react";
import type { IContentItem } from "../api/contentTypes";
import type { SitePage } from "../api/sitePagesApi";

export type SiteCollectionsContextValue = {
  domain: string;
  collectionItemsByTypeId: Record<string, IContentItem[]>;
  sitePages: SitePage[];
};

const defaultValue: SiteCollectionsContextValue = {
  domain: "",
  collectionItemsByTypeId: {},
  sitePages: [],
};

const SiteCollectionsContext =
  React.createContext<SiteCollectionsContextValue>(defaultValue);

export const SiteCollectionsProvider = ({
  domain,
  collectionItemsByTypeId,
  sitePages,
  children,
}: SiteCollectionsContextValue & { children: React.ReactNode }) => (
  <SiteCollectionsContext.Provider
    value={{ domain, collectionItemsByTypeId, sitePages }}
  >
    {children}
  </SiteCollectionsContext.Provider>
);

export const useSiteCollections = (): SiteCollectionsContextValue =>
  React.useContext(SiteCollectionsContext);
