import { createContext, useContext } from "react"

export type RightPanelContextValue = {
  tabIndex: number
  setTabIndex: (index: number) => void
}

/**  Пробрасываем состояние активной вкладки правой панели (BuilderRightPanel)  */
export const RightPanelContext = createContext<RightPanelContextValue | undefined>(undefined)

export const useRightPanelContext = (): RightPanelContextValue | undefined => {
  return useContext(RightPanelContext)
}

