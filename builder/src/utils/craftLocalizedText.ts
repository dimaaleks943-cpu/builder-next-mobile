import type { IContentItem } from "../api/extranet"
import type { BuilderModeContextValue } from "../pages/builder/context/BuilderModeContext.tsx"
import { MODE_TYPE } from "../pages/builder/builder.enum.ts"
import { findContentItemField, getContentFieldDisplayValue } from "./contentFieldValue"
import { makeTextI18nKey, resolveTranslationText } from "./i18nTranslations.ts"

export type CraftTextSetProp = (id: string, updater: (props: any) => void) => void

export function getCraftTextDisplayText(params: {
  text: string
  collectionField: string | null
  itemData: unknown | undefined
  i18nKey: string | null
  modeContext: BuilderModeContextValue | undefined
}): string {
  const { text, collectionField, itemData, i18nKey, modeContext } = params
  if (!collectionField || !itemData) {
    if (!modeContext) return text
    const translations =
      modeContext.mode === MODE_TYPE.WEB
        ? modeContext.translateWeb
        : modeContext.translateMobile
    return resolveTranslationText(
      translations,
      modeContext.activeLocale,
      i18nKey,
      text,
    )
  }
  const item = itemData as IContentItem
  const field = findContentItemField(item, collectionField)
  const resolved = getContentFieldDisplayValue(field)
  return resolved !== "" ? resolved : text
}

export function commitCraftTextDraft(params: {
  nodeId: string
  value: string
  i18nKey: string | null
  collectionField: string | null
  modeContext: BuilderModeContextValue | undefined
  setProp: CraftTextSetProp
}): void {
  const { nodeId, value, i18nKey, collectionField, modeContext, setProp } = params
  const nextI18nKey = i18nKey || makeTextI18nKey(nodeId, "text")
  setProp(nodeId, (props: any) => {
    props.text = value
    props.i18nKey = nextI18nKey
  })
  if (!collectionField && modeContext) {
    const setTranslations =
      modeContext.mode === MODE_TYPE.WEB
        ? modeContext.setTranslateWeb
        : modeContext.setTranslateMobile
    const currentTranslations =
      modeContext.mode === MODE_TYPE.WEB
        ? modeContext.translateWeb
        : modeContext.translateMobile
    setTranslations({
      ...currentTranslations,
      [modeContext.activeLocale]: {
        ...currentTranslations[modeContext.activeLocale],
        [nextI18nKey]: value,
      },
    })
  }
}
