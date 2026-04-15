import React from "react"
import type { SsrLocale } from "@/lib/localeFromPath"

/**
 * Базовый slug витрины (страница `/gid`) и хвост категории из URL для ссылок на template.
 */
export type StorefrontPageContextValue = {
  /** Локаль из URL-префикса (`ru` без префикса, `en` при `/en/...`). */
  locale: SsrLocale
  /** Slug статической/витринной страницы, напр. `/gid` — префикс для push и ссылок. */
  pageBaseSlug: string
  /**
   * Сегменты категории между `pageBaseSlug` и slug итема, если они есть в текущем URL
   * (напр. `europe` для `/gid/europe/luvr`).
   */
  categorySlugTrailFromUrl: string | null
}

const defaultValue: StorefrontPageContextValue = {
  locale: "ru",
  pageBaseSlug: "/",
  categorySlugTrailFromUrl: null,
}

const StorefrontPageContext =
  React.createContext<StorefrontPageContextValue>(defaultValue)

export const StorefrontPageProvider = ({
  children,
  locale,
  pageBaseSlug,
  categorySlugTrailFromUrl,
}: {
  children: React.ReactNode
  locale: SsrLocale
  pageBaseSlug: string
  categorySlugTrailFromUrl: string | null
}) => {
  const value = React.useMemo(
    () => ({ locale, pageBaseSlug, categorySlugTrailFromUrl }),
    [locale, pageBaseSlug, categorySlugTrailFromUrl],
  )
  return (
    <StorefrontPageContext.Provider value={value}>
      {children}
    </StorefrontPageContext.Provider>
  )
}

export const useStorefrontPage = (): StorefrontPageContextValue =>
  React.useContext(StorefrontPageContext)
