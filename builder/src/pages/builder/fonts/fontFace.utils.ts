import type { UploadedFont } from "./types.ts"

const getFontFileExtension = (fileName: string): string => {
  const dotIndex = fileName.lastIndexOf(".")
  if (dotIndex === -1) return ""
  return fileName.slice(dotIndex).toLowerCase()
}

export const getFontFaceFormat = (fileName: string): string => {
  switch (getFontFileExtension(fileName)) {
    case ".woff":
      return "woff"
    case ".woff2":
      return "woff2"
    case ".ttf":
      return "truetype"
    case ".otf":
      return "opentype"
    default:
      return "woff"
  }
}

export const quoteFontFamilyName = (fontFamily: string): string => {
  const escaped = fontFamily.replace(/'/g, "\\'")
  return `'${escaped}'`
}

export const buildUploadedFontFamilyStack = (font: UploadedFont): string => {
  const primary = quoteFontFamilyName(font.fontFamily)
  return `${primary}, ${font.fallback}, sans-serif`
}

