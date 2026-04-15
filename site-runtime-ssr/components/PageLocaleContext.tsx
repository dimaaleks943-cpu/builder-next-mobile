import React, { useMemo } from "react"
import type { SsrLocale } from "@/lib/localeFromPath"
import type { TranslationsByLocale } from "@/lib/hardcodedPageTranslations"

export type PageLocaleContextValue = {
  locale: SsrLocale
  translate: TranslationsByLocale
}

const defaultValue: PageLocaleContextValue = {
  locale: "ru",
  translate: { ru: {}, en: {} },
}

const PageLocaleContext =
  React.createContext<PageLocaleContextValue>(defaultValue)

export const PageLocaleProvider = ({
  children,
  locale,
  translate,
}: {
  children: React.ReactNode
  locale: SsrLocale
  translate: TranslationsByLocale
}) => {
  const value = useMemo(
    () => ({ locale, translate }),
    [locale, translate],
  )
  return (
    <PageLocaleContext.Provider value={value}>
      {children}
    </PageLocaleContext.Provider>
  )
}

export const usePageLocale = (): PageLocaleContextValue =>
  React.useContext(PageLocaleContext)
