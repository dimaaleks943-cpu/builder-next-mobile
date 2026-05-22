import React, { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { findUploadedFontByFamilyStack } from "../../fonts/fontFamily.utils"
import { loadUploadedFonts } from "../../fonts/loadUploadedFonts"
import { fetchUploadedFontsMock } from "../../fonts/uploadedFontsRegistry"
import type { UploadedFont } from "../../fonts/types"

export interface UploadedFontsContextValue {
  fontsLoaded: boolean
  fontsLoadError: string | null
  uploadedFonts: UploadedFont[]
  resolveRnFontFamily: (familyStack: string) => string | undefined
}

const UploadedFontsContext = React.createContext<UploadedFontsContextValue | null>(
  null,
)

interface Props {
  children: React.ReactNode
}

export const UploadedFontsProvider = ({ children }: Props) => {
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [fontsLoadError, setFontsLoadError] = useState<string | null>(null)
  const [uploadedFonts, setUploadedFonts] = useState<UploadedFont[]>([])
  const [loadedFontFamilies, setLoadedFontFamilies] = useState<Set<string>>(
    () => new Set(),
  )

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const fonts = await fetchUploadedFontsMock()
        if (cancelled) return

        setUploadedFonts(fonts)

        const { loadedFontFamilies: loaded, errors } = await loadUploadedFonts(fonts)
        if (cancelled) return

        setLoadedFontFamilies(loaded)

        if (errors.length > 0) {
          setFontsLoadError(errors.join("; "))
        }
      } catch (error) {
        if (cancelled) return

        const message =
          error instanceof Error ? error.message : String(error)
        setFontsLoadError(message)
        console.error("[UploadedFontsProvider] Font bootstrap failed:", message)
      } finally {
        if (!cancelled) {
          setFontsLoaded(true)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const resolveRnFontFamily = useCallback(
    (familyStack: string): string | undefined => {
      const font = findUploadedFontByFamilyStack(uploadedFonts, familyStack)
      if (!font) return undefined
      if (!loadedFontFamilies.has(font.fontFamily)) return undefined
      return font.fontFamily
    },
    [loadedFontFamilies, uploadedFonts],
  )

  const value = useMemo(
    () => ({
      fontsLoaded,
      fontsLoadError,
      uploadedFonts,
      resolveRnFontFamily,
    }),
    [fontsLoaded, fontsLoadError, uploadedFonts, resolveRnFontFamily],
  )

  return (
    <UploadedFontsContext.Provider value={value}>
      {children}
    </UploadedFontsContext.Provider>
  )
}

export const useUploadedFonts = (): UploadedFontsContextValue => {
  const context = useContext(UploadedFontsContext)

  if (!context && __DEV__) {
    throw new Error("useUploadedFonts must be used within UploadedFontsProvider")
  }

  return (
    context ?? {
      fontsLoaded: true,
      fontsLoadError: null,
      uploadedFonts: [],
      resolveRnFontFamily: () => undefined,
    }
  )
}
