import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

interface CraftGridManualEditBridgeContextValue {
  activeNodeId: string | null
  /** Увеличивается при каждом открытии — для сброса черновика в оверлее. */
  openSeq: number
  openGridManualEdit: (nodeId: string) => void
  closeGridManualEdit: () => void
}

const CraftGridManualEditBridgeContext =
  createContext<CraftGridManualEditBridgeContextValue | null>(null)

interface ProviderProps {
  children: ReactNode
}

export const CraftGridManualEditBridgeProvider = ({ children }: ProviderProps) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [openSeq, setOpenSeq] = useState(0)

  const openGridManualEdit = useCallback((nodeId: string) => {
    setActiveNodeId(nodeId)
    setOpenSeq((n) => n + 1)
  }, [])

  const closeGridManualEdit = useCallback(() => {
    setActiveNodeId(null)
  }, [])

  const value = useMemo(
    () => ({
      activeNodeId,
      openSeq,
      openGridManualEdit,
      closeGridManualEdit,
    }),
    [activeNodeId, openSeq, openGridManualEdit, closeGridManualEdit],
  )

  return (
    <CraftGridManualEditBridgeContext.Provider value={value}>
      {children}
    </CraftGridManualEditBridgeContext.Provider>
  )
}

export const useCraftGridManualEditBridge = () => useContext(CraftGridManualEditBridgeContext)

