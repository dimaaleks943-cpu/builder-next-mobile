import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { InlineSettingsViewportAnchor } from "../overlay/OverlayManager/inlineModalAnchor.ts"

export type { InlineSettingsViewportAnchor }

export interface CraftInlineSettingsRequest {
  nodeId: string | null
  seq: number
  viewportAnchor: InlineSettingsViewportAnchor | null
}

interface CraftInlineSettingsBridgeContextValue {
  request: CraftInlineSettingsRequest
  requestInlineSettingsOpen: (
    nodeId: string,
    viewportAnchor?: InlineSettingsViewportAnchor | null,
  ) => void
}

const CraftInlineSettingsBridgeContext =
  createContext<CraftInlineSettingsBridgeContextValue | null>(null)

interface ProviderProps {
  children: ReactNode
}

export const CraftInlineSettingsBridgeProvider = ({ children }: ProviderProps) => {
  const [request, setRequest] = useState<CraftInlineSettingsRequest>({
    nodeId: null,
    seq: 0,
    viewportAnchor: null,
  })

  const requestInlineSettingsOpen = useCallback(
    (nodeId: string, viewportAnchor: InlineSettingsViewportAnchor | null = null) => {
      setRequest((prev) => ({
        nodeId,
        seq: prev.seq + 1,
        viewportAnchor,
      }))
    },
    [],
  )

  const value = useMemo(
    () => ({ request, requestInlineSettingsOpen }),
    [request, requestInlineSettingsOpen],
  )

  return (
    <CraftInlineSettingsBridgeContext.Provider value={value}>
      {children}
    </CraftInlineSettingsBridgeContext.Provider>
  )
}

export const useCraftInlineSettingsBridge = () => {
  const ctx = useContext(CraftInlineSettingsBridgeContext)
  if (!ctx) {
    throw new Error(
      "useCraftInlineSettingsBridge must be used within CraftInlineSettingsBridgeProvider",
    )
  }
  return ctx
}

/** Реагирует на запрос открытия inline-модалки (например, из overlay badge). */
export const useReactToInlineSettingsOpenRequest = (
  nodeId: string | undefined,
  onOpen: (viewportAnchor: InlineSettingsViewportAnchor | null) => void,
) => {
  const { request } = useCraftInlineSettingsBridge()
  const lastHandledSeqRef = useRef(0)
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen

  useEffect(() => {
    if (!nodeId) return
    if (request.nodeId !== nodeId) return
    if (request.seq <= lastHandledSeqRef.current) return
    lastHandledSeqRef.current = request.seq
    onOpenRef.current(request.viewportAnchor)
  }, [request.nodeId, request.seq, request.viewportAnchor, nodeId])
}
