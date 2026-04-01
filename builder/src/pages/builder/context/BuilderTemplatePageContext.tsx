import { createContext, useContext } from "react"
import type { IContentItem } from "../../../api/extranet"

export type BuilderTemplatePageContextValue = {
  /**
   * Для страницы type === "template" с привязанной коллекцией — тот же ключ, что у ContentList (content_type_id).
   * Используется в панелях настроек вне вложенного ContentListDataContext.
   */
  templatePageCollectionKey: string | null
  /** Запись превью для резолва значений полей в настройках на template-странице. */
  templatePreviewItem: IContentItem | null
}

const defaultValue: BuilderTemplatePageContextValue = {
  templatePageCollectionKey: null,
  templatePreviewItem: null,
}

export const BuilderTemplatePageContext =
  createContext<BuilderTemplatePageContextValue>(defaultValue)

export const useBuilderTemplatePage = (): BuilderTemplatePageContextValue => {
  return useContext(BuilderTemplatePageContext)
}
