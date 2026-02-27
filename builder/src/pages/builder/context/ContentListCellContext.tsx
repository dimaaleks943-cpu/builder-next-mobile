import { createContext, useContext } from "react"

/** Дает понять компоненту ниже по дереву (внутри ячейки) “нахоидтся ли он внутри ячейки ContentList” */
export const ContentListCellContext = createContext<boolean>(false)

export const useInsideContentListCell = (): boolean =>
  useContext(ContentListCellContext)
