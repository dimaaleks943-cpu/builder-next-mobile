import type { SsrLocale } from "@/lib/localeFromPath"

export type TranslationsByLocale = Record<SsrLocale, Record<string, string>>

export type PageTranslatePayload = {
  translate: TranslationsByLocale
  translate_mobile: TranslationsByLocale
}

const emptyLocaleMaps = (): TranslationsByLocale => ({
  ru: {},
  en: {},
})

/** Заглушка до API `translate` / списка локалей: ключ — `SitePage.id`. */
export const PAGE_TRANSLATIONS_BY_ID: Record<string, PageTranslatePayload> = {
  "ebfe8299-a8b5-4f2e-a2b6-d44a210cccd7": {
    translate: {"ru":{"txt_EkfzzVyi9C_text":"Главная страница","txt_8s1NqloV92_text":"Русское слово, славянское"},"en":{"txt_EkfzzVyi9C_text":"Main page","txt_8s1NqloV92_text":"English worlds, pindos"}},
    translate_mobile: emptyLocaleMaps(),
  },
  "206befc1-220d-4039-8879-89c8223145f7": {
    translate: {"ru":{"txt_E8yCmf1Rs5_text":"ГИД по местам"},"en":{"txt_E8yCmf1Rs5_text":"Guide on placces"}},
    translate_mobile: emptyLocaleMaps(),
  },
}

export const getHardcodedTranslationsForPage = (
  pageId: string,
): PageTranslatePayload =>
  PAGE_TRANSLATIONS_BY_ID[pageId] ?? {
    translate: emptyLocaleMaps(),
    translate_mobile: emptyLocaleMaps(),
  }
