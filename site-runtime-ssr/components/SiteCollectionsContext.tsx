import React from "react"
import type { IContentItem } from "@/lib/contentTypes"

export type SiteCollectionsContextValue = {
  domain: string
  collectionItemsByTypeId: Record<string, IContentItem[]>
}

const defaultValue: SiteCollectionsContextValue = {
  domain: "",
  collectionItemsByTypeId: {},
}

const SiteCollectionsContext =
  React.createContext<SiteCollectionsContextValue>(defaultValue)

export const SiteCollectionsProvider = ({
  domain,
  collectionItemsByTypeId,
  children,
}: SiteCollectionsContextValue & { children: React.ReactNode }) => (
  <SiteCollectionsContext.Provider
    value={{ domain, collectionItemsByTypeId }}
  >
    {children}
  </SiteCollectionsContext.Provider>
)

export const useSiteCollections = (): SiteCollectionsContextValue =>
  React.useContext(SiteCollectionsContext)
