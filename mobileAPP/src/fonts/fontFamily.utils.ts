import type { UploadedFont } from "./types"

export const quoteFontFamilyName = (fontFamily: string): string => {
  const escaped = fontFamily.replace(/'/g, "\\'")
  return `'${escaped}'`
}

export const buildUploadedFontFamilyStack = (font: UploadedFont): string => {
  const primary = quoteFontFamilyName(font.fontFamily)
  return `${primary}, ${font.fallback}, sans-serif`
}

export const parsePrimaryFontFamilyFromStack = (
  familyStack: string,
): string | undefined => {
  const trimmed = familyStack.trim()
  if (!trimmed) return undefined

  const quotedMatch = trimmed.match(/^(['"])(.*?)\1/)
  if (quotedMatch) return quotedMatch[2] || undefined

  const commaIndex = trimmed.indexOf(",")
  const primary = (commaIndex === -1 ? trimmed : trimmed.slice(0, commaIndex)).trim()
  return primary || undefined
}

export const findUploadedFontByFamilyStack = (
  fonts: UploadedFont[],
  familyStack: string,
): UploadedFont | undefined =>
  fonts.find((font) => buildUploadedFontFamilyStack(font) === familyStack)
