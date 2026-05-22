import * as FileSystem from "expo-file-system/legacy"
import * as Font from "expo-font"
import type { UploadedFont } from "./types"

export interface LoadUploadedFontsResult {
  loadedFontFamilies: Set<string>
  errors: string[]
}

const sanitizeFileName = (fileName: string): string =>
  fileName.replace(/[^a-zA-Z0-9._-]/g, "_")

export const loadUploadedFonts = async (
  fonts: UploadedFont[],
): Promise<LoadUploadedFontsResult> => {
  const loadedFontFamilies = new Set<string>()
  const errors: string[] = []
  const cacheDir = FileSystem.cacheDirectory

  if (!cacheDir) {
    const message = "FileSystem.cacheDirectory is unavailable"
    console.error(`[loadUploadedFonts] ${message}`)
    return { loadedFontFamilies, errors: [message] }
  }

  for (const font of fonts) {
    try {
      const safeFileName = sanitizeFileName(font.fileName)
      const fileUri = `${cacheDir}uploaded-font-${font.id}-${safeFileName}`

      await FileSystem.writeAsStringAsync(fileUri, font.fileBase64, {
        encoding: FileSystem.EncodingType.Base64,
      })

      await Font.loadAsync({
        [font.fontFamily]: fileUri,
      })

      if (!Font.isLoaded(font.fontFamily)) {
        throw new Error(`Font.isLoaded returned false for "${font.fontFamily}"`)
      }

      loadedFontFamilies.add(font.fontFamily)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error)
      const errorMessage = `Failed to load font "${font.fontFamily}": ${message}`
      errors.push(errorMessage)
      console.error(`[loadUploadedFonts] ${errorMessage}`)
    }
  }

  return { loadedFontFamilies, errors }
}
