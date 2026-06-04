import { useMemo } from "react"
import { useContentData } from "./ContentDataContext"
import { usePageLocale } from "./PageLocaleContext"
import {
  findContentItemField,
  getContentFieldDisplayValue,
} from "@/lib/contentFieldValue"
import type { IContentItem } from "@/lib/contentTypes"
import { resolveTranslationText } from "@/lib/resolvePageTranslation"
import { renderParagraphText } from "@/lib/renderParagraphText"

interface Props {
  className?: string
  "data-craft-node-id"?: string
  text?: string
  i18nKey?: string | null
  collectionField?: string | null
}

export const Paragraph = ({
  className,
  "data-craft-node-id": dataCraftNodeId,
  text,
  i18nKey = null,
  collectionField = null,
}: Props) => {
  const contentData = useContentData()
  const pageLocale = usePageLocale()
  const textFallback = text as string;

  const displayText = useMemo(() => {
    if (collectionField && contentData?.itemData) {
      const item = contentData.itemData as IContentItem
      const field = findContentItemField(item, collectionField)
      if (field) {
        const resolved = getContentFieldDisplayValue(field)
        return resolved !== "" ? resolved : textFallback
      }
    }
    if (!collectionField || !contentData?.itemData) {
      return resolveTranslationText(
        pageLocale.translate,
        pageLocale.locale,
        i18nKey,
        textFallback,
      )
    }
    return textFallback
  }, [
    collectionField,
    contentData?.itemData,
    i18nKey,
    pageLocale.locale,
    pageLocale.translate,
    textFallback,
  ])

  return (
    <p className={className} data-craft-node-id={dataCraftNodeId}>
      {renderParagraphText(displayText)}
    </p>
  )
}
