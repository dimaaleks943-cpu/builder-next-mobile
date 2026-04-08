import React from "react"

/**
 * Базовый slug витрины (страница `/gid`) и хвост категории из URL для ссылок на template.
 */
export type StorefrontPageContextValue = {
  /** Slug статической/витринной страницы, напр. `/gid` — префикс для push и ссылок. */
  pageBaseSlug: string
  /**
   * Сегменты категории между `pageBaseSlug` и slug итема, если они есть в текущем URL
   * (напр. `europe` для `/gid/europe/luvr`).
   */
  categorySlugTrailFromUrl: string | null
}

const defaultValue: StorefrontPageContextValue = {
  pageBaseSlug: "/",
  categorySlugTrailFromUrl: null,
}

const StorefrontPageContext =
  React.createContext<StorefrontPageContextValue>(defaultValue)

export const StorefrontPageProvider = ({
  children,
  pageBaseSlug,
  categorySlugTrailFromUrl,
}: {
  children: React.ReactNode
  pageBaseSlug: string
  categorySlugTrailFromUrl: string | null
}) => {
  const value = React.useMemo(
    () => ({ pageBaseSlug, categorySlugTrailFromUrl }),
    [pageBaseSlug, categorySlugTrailFromUrl],
  )
  return (
    <StorefrontPageContext.Provider value={value}>
      {children}
    </StorefrontPageContext.Provider>
  )
}

export const useStorefrontPage = (): StorefrontPageContextValue =>
  React.useContext(StorefrontPageContext)
