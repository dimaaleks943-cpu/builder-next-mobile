import uploadedFontsMockJson from "./mockData.json"
import type { UploadedFont } from "./types.ts"

//TODO имитация получения шрифта для билдера
export const fetchUploadedFontsMock = async (): Promise<UploadedFont[]> => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 150)
  })

  return uploadedFontsMockJson as UploadedFont[]
}
