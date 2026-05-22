import uploadedFontsMockJson from "./mockData.json"
import type { UploadedFont } from "./types"

export const getUploadedFonts = (): UploadedFont[] =>
  uploadedFontsMockJson as UploadedFont[]

export const fetchUploadedFontsMock = async (): Promise<UploadedFont[]> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 150)
  })

  return getUploadedFonts()
}
