import type { SsrLocale } from "@/lib/localeFromPath"
import type { TranslationsByLocale } from "@/lib/hardcodedPageTranslations"

export const resolveTranslationText = (
  translations: TranslationsByLocale,
  locale: SsrLocale,
  key: string | undefined | null,
  fallbackText: string,
): string => {
  if (!key) return fallbackText
  return translations[locale][key] ?? translations.ru[key] ?? fallbackText
}
