import { createContext, useContext } from "react"
import { MODE_TYPE } from "../builder.enum.ts"
import type { Locale, TranslationsByLocale } from "../../../api/extranet.ts"

export type BuilderMode = MODE_TYPE.WEB | MODE_TYPE.RN

export type BuilderModeContextValue = {
  mode: BuilderMode
  setMode: (mode: BuilderMode) => void
  activeLocale: Locale
  setActiveLocale: (locale: Locale) => void
  contentWeb: string
  contentMobile: string
  setContentWeb: (value: string) => void
  setContentMobile: (value: string) => void
  translateWeb: TranslationsByLocale
  translateMobile: TranslationsByLocale
  setTranslateWeb: (value: TranslationsByLocale) => void
  setTranslateMobile: (value: TranslationsByLocale) => void
}

export const BuilderModeContext = createContext<
  BuilderModeContextValue | undefined
>(undefined)

export const useBuilderModeContext = (): BuilderModeContextValue | undefined => {
  return useContext(BuilderModeContext)
}
