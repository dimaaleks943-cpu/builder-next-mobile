import uploadedFontsMockJson from "./mockData.json"
import { buildUploadedFontFamilyStack } from "./fontFace.utils.ts"
import type { UploadedFont } from "./types.ts"

export const DEFAULT_FONT_SELECT_OPTIONS = [
  { id: "system", value: "System" },
  { id: "Roboto", value: "Roboto" },
  { id: "Inter", value: "Inter" },
] as const

export const getUploadedFonts = (): UploadedFont[] =>
  uploadedFontsMockJson as UploadedFont[]

export const getUploadedFontSelectOptions = (): Array<{ id: string; value: string }> =>
  getUploadedFonts().map((font) => ({
    id: buildUploadedFontFamilyStack(font),
    value: font.fontFamily,
  }))

export const getTypographyFontSelectOptions = (): Array<{ id: string; value: string }> => [
  ...DEFAULT_FONT_SELECT_OPTIONS,
  ...getUploadedFontSelectOptions(),
]

export const findUploadedFontByFamilyStack = (
  familyStack: string,
): UploadedFont | undefined =>
  getUploadedFonts().find((font) => buildUploadedFontFamilyStack(font) === familyStack)
