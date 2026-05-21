import { useEffect } from "react"
import { getFontFaceFormat, quoteFontFamilyName } from "./fontFace.utils.ts"
import { fetchUploadedFontsMock } from "./fetchUploadedFontsMock.ts"
import type { UploadedFont } from "./types.ts";

const STYLE_ELEMENT_ID = "builder-uploaded-fonts-face-registry"

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

const buildFontFaceCss = (font: UploadedFont): string => {
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

const buildUploadedFontsFaceCss = (fonts: UploadedFont[]): string =>
  fonts.map(buildFontFaceCss).join("\n")

/** Регитстрация шрифта в билдере */
export const BuilderUploadedFontsFaceRegistry = () => {
  useEffect(() => {
    let isCancelled = false

    fetchUploadedFontsMock().then((fonts) => {
      if (isCancelled) return

      const css = buildUploadedFontsFaceCss(fonts)
      if (!css) return

      let styleElement = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null

      if (!styleElement) {
        styleElement = document.createElement("style")
        styleElement.id = STYLE_ELEMENT_ID
        document.head.appendChild(styleElement)
      }

      styleElement.textContent = css
    })

    return () => {
      isCancelled = true
      document.getElementById(STYLE_ELEMENT_ID)?.remove()
    }
  }, [])

  return null
}
