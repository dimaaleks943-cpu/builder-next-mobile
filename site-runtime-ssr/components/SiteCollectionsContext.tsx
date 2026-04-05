import React, { useCallback, useEffect, useState } from "react"
import type { IContentItem } from "@/lib/contentTypes"
import type { SitePage } from "@/lib/sitePages"

export type SiteCollectionsContextValue = {
  domain: string
  /**
   * Кэш элементов коллекций: ключ `getCollectionItemsCacheKey(filterScope, content_type_id)` или только type id.
   * При смене категории ContentList вызывает `setItemsForKey` с тем же ключом, что и при SSR-префетче.
   */
  collectionItemsByKey: Record<string, IContentItem[]>
  /** Подмена среза items для ключа (после клиентского fetch с `categoryIds`). */
  setItemsForKey: (cacheKey: string, items: IContentItem[]) => void
  sitePages: SitePage[]
}

const defaultValue: SiteCollectionsContextValue = {
  domain: "",
  collectionItemsByKey: {},
  setItemsForKey: () => {},
  sitePages: [],
}

const SiteCollectionsContext =
  React.createContext<SiteCollectionsContextValue>(defaultValue)

export const SiteCollectionsProvider = ({
  domain,
  collectionItemsByKey: initialByKey,
  sitePages,
  children,
}: Omit<SiteCollectionsContextValue, "setItemsForKey"> & {
  children: React.ReactNode
}) => {
  const [collectionItemsByKey, setCollectionItemsByKey] =
    useState<Record<string, IContentItem[]>>(initialByKey)

  useEffect(() => {
    setCollectionItemsByKey(initialByKey)
  }, [initialByKey])

  const setItemsForKey = useCallback((cacheKey: string, items: IContentItem[]) => {
    setCollectionItemsByKey((prev) => ({ ...prev, [cacheKey]: items }))
  }, [])

  return (
    <SiteCollectionsContext.Provider
      value={{ domain, collectionItemsByKey, setItemsForKey, sitePages }}
    >
      {children}
    </SiteCollectionsContext.Provider>
  )
}

export const useSiteCollections = (): SiteCollectionsContextValue =>
  React.useContext(SiteCollectionsContext)
