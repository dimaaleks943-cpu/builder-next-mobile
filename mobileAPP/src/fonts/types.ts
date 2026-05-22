export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

export type FontDisplay = "auto" | "block" | "swap" | "fallback" | "optional"

export type FontStyle = "normal" | "italic"

export interface UploadedFont {
  id: string
  fontFamily: string
  fontWeight: FontWeight[]
  display: FontDisplay
  style: FontStyle
  fallback: string
  fileName: string
  fileBase64: string
  mimeType: string
  uploadedAt: string
}
