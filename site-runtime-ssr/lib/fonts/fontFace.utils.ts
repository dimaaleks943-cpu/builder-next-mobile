import type { UploadedFont } from "./types"

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

const isVariableFontFile = (fileName: string): boolean => /variable/i.test(fileName)

const buildFontFaceWeight = (font: UploadedFont): string => {
  if (isVariableFontFile(font.fileName)) {
    return "100 900"
  }

  if (font.fontWeight.length > 1) {
    return `${Math.min(...font.fontWeight)} ${Math.max(...font.fontWeight)}`
  }

  return String(font.fontWeight[0] ?? 400)
}

export const buildFontFaceCss = (font: UploadedFont): string => {
  const format = getFontFaceFormat(font.fileName)
  const fontWeight = buildFontFaceWeight(font)

  return `
@font-face {
  font-family: ${quoteFontFamilyName(font.fontFamily)};
  src: url(data:${font.mimeType};base64,${font.fileBase64}) format('${format}');
  font-weight: ${fontWeight};
  font-style: ${font.style};
  font-display: ${font.display};
}`.trim()
}

export const buildUploadedFontsFaceCss = (fonts: UploadedFont[]): string =>
  fonts.map(buildFontFaceCss).join("\n")
