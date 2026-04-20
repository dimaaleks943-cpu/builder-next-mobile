import { useMemo } from "react"
import { useContentData } from "./ContentDataContext"
import { usePageLocale } from "./PageLocaleContext"
import {
  findContentItemField,
  getContentFieldDisplayValue,
} from "@/lib/contentFieldValue"
import type { IContentItem } from "@/lib/contentTypes"
import { resolveTranslationText } from "@/lib/resolvePageTranslation"
import {
  type CraftVisualEffectsProps,
} from "@/lib/craftVisualEffects"

interface TextProps extends CraftVisualEffectsProps {
  className?: string
  "data-craft-node-id"?: string
  text?: string
  i18nKey?: string | null
  collectionField?: string | null
}

export const Text = ({
  className,
  "data-craft-node-id": dataCraftNodeId,
  text = "Текст",
  i18nKey = null,
  collectionField = null,
}: TextProps) => {
  const contentData = useContentData()
  const pageLocale = usePageLocale()

  const displayText = useMemo(() => {
    if (collectionField && contentData?.itemData) {
      const item = contentData.itemData as IContentItem
      const field = findContentItemField(item, collectionField)
      if (field) {
        const resolved = getContentFieldDisplayValue(field)
        return resolved !== "" ? resolved : text
      }
    }
    if (!collectionField || !contentData?.itemData) {
      return resolveTranslationText(
        pageLocale.translate,
        pageLocale.locale,
        i18nKey,
        text as string,
      )
    }
    return text
  }, [
    collectionField,
    contentData?.itemData,
    i18nKey,
    pageLocale.locale,
    pageLocale.translate,
    text,
  ])

  return (
    <span className={className} data-craft-node-id={dataCraftNodeId}>
      {displayText}
    </span>
  )
}
