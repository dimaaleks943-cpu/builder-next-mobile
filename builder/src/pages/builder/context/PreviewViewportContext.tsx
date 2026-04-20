import { createContext, useContext } from "react"
import type { PreviewViewport } from "../builder.enum"

export const PreviewViewportContext = createContext<PreviewViewport>("desktop")

export const usePreviewViewport = () => useContext(PreviewViewportContext)
