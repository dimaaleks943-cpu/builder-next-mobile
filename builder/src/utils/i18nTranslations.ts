import {
  SUPPORTED_LOCALES,
  type Locale,
  type TranslationsByLocale,
} from "../api/extranet"
import type { SerializedNodes } from "@craftjs/core"
import { CRAFT_DISPLAY_NAME } from "../craft/craftDisplayNames"

export type StoredTranslationsByPage = {
  translate: TranslationsByLocale
  translate_mobile: TranslationsByLocale
}

const STORAGE_PREFIX = "builder:i18n:v1:page:"

export const createEmptyTranslations = (): TranslationsByLocale => ({
  ru: {},
  en: {},
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const normalizeSingleLocaleMap = (value: unknown): Record<string, string> => {
  if (!isRecord(value)) return {}
  const out: Record<string, string> = {}
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string") out[key] = item
  }
  return out
}

export const normalizeTranslations = (value: unknown): TranslationsByLocale => {
  if (typeof value === "string") {
    try {
      return normalizeTranslations(JSON.parse(value))
    } catch {
      return createEmptyTranslations()
    }
  }
  if (!isRecord(value)) return createEmptyTranslations()
  return {
    ru: normalizeSingleLocaleMap(value.ru),
    en: normalizeSingleLocaleMap(value.en),
  }
}

export const mergeTranslations = (
  primary: TranslationsByLocale,
  fallback: TranslationsByLocale,
): TranslationsByLocale => ({
  ru: { ...fallback.ru, ...primary.ru },
  en: { ...fallback.en, ...primary.en },
})

export const resolveTranslationText = (
  translations: TranslationsByLocale,
  locale: Locale,
  key: string | undefined | null,
  fallbackText: string,
): string => {
  if (!key) return fallbackText
  return (
    translations[locale][key] ??
    translations.ru[key] ??
    fallbackText
  )
}

const parseSerializedNodes = (raw: string): SerializedNodes | null => {
  if (!raw.trim()) return null
  try {
    return JSON.parse(raw) as SerializedNodes
  } catch {
    return null
  }
}

const TEXTUAL_NODE_NAMES = new Set([
  CRAFT_DISPLAY_NAME.Text,
  CRAFT_DISPLAY_NAME.LinkText,
])

const collectUsedI18nKeysFromNodes = (nodes: SerializedNodes): Set<string> => {
  const keys = new Set<string>()
  for (const node of Object.values(nodes)) {
    const props = (node as { props?: Record<string, unknown> }).props
    const i18nKey = typeof props?.i18nKey === "string" ? props.i18nKey.trim() : ""
    const collectionField =
      typeof props?.collectionField === "string" ? props.collectionField.trim() : ""
    const displayName =
      typeof (node as { displayName?: string }).displayName === "string"
        ? ((node as { displayName: string }).displayName ?? "")
        : ""
    if (
      i18nKey &&
      !collectionField &&
      TEXTUAL_NODE_NAMES.has(displayName)
    ) {
      keys.add(i18nKey)
    }
  }
  return keys
}

export const collectUsedI18nKeys = (
  contentRaw: string,
  contentMobileRaw: string,
): {
  webKeys: Set<string>
  mobileKeys: Set<string>
} => ({
  webKeys: collectUsedI18nKeysFromNodes(parseSerializedNodes(contentRaw) ?? {}),
  mobileKeys: collectUsedI18nKeysFromNodes(parseSerializedNodes(contentMobileRaw) ?? {}),
})

const pruneLocaleMap = (
  localeMap: Record<string, string>,
  used: Set<string>,
): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(localeMap)) {
    if (used.has(key) && value.trim() !== "") {
      out[key] = value
    }
  }
  return out
}

export const pruneTranslationsByKeys = (
  translations: TranslationsByLocale,
  usedKeys: Set<string>,
): TranslationsByLocale => ({
  ru: pruneLocaleMap(translations.ru, usedKeys),
  en: pruneLocaleMap(translations.en, usedKeys),
})

const storageKey = (pageId: string): string => `${STORAGE_PREFIX}${pageId}`

export const loadStoredTranslations = (
  pageId: string,
): StoredTranslationsByPage | null => {
  try {
    const raw = window.localStorage.getItem(storageKey(pageId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredTranslationsByPage>
    return {
      translate: normalizeTranslations(parsed.translate),
      translate_mobile: normalizeTranslations(parsed.translate_mobile),
    }
  } catch {
    return null
  }
}

export const saveStoredTranslations = (
  pageId: string,
  data: StoredTranslationsByPage,
): void => {
  try {
    window.localStorage.setItem(storageKey(pageId), JSON.stringify(data))
  } catch {
    // ignore storage quota/security errors
  }
}

export const toLocaleLabel = (locale: Locale): string => locale.toUpperCase()

export const ensureSupportedLocale = (value: string): Locale =>
  (SUPPORTED_LOCALES as readonly string[]).includes(value) ? (value as Locale) : "ru"

export const makeTextI18nKey = (nodeId: string, field = "text"): string =>
  `txt_${nodeId}_${field}`
