import uploadedFontsMockJson from "./mockData.json"
import { buildUploadedFontsFaceCss } from "./fontFace.utils"
import type { UploadedFont } from "./types"

export const getUploadedFonts = (): UploadedFont[] =>
  uploadedFontsMockJson as UploadedFont[]

/** Имитация GET /fonts до появления реального API. */
export const fetchUploadedFontsMock = async (): Promise<UploadedFont[]> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0)
  })

  return getUploadedFonts()
}

export const getUploadedFontsFaceCss = (): string =>
  buildUploadedFontsFaceCss(getUploadedFonts())
