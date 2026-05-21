export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

export type FontDisplay = "auto" | "block" | "swap" | "fallback" | "optional"

export type FontStyle = "normal" | "italic"

export type FontUploadStatus = "pending" | "uploading" | "uploaded" | "error"

export interface FontUploadFormValues {
  fontFamily: string
  fontWeight: FontWeight[]
  display: FontDisplay | ""
  style: FontStyle | ""
  fallback: string
}

export interface PendingFontUpload {
  id: string
  file: File
  form: FontUploadFormValues
  uploadStatus: FontUploadStatus
}

/** Тело POST-запроса на загрузку шрифта (файл — base64 без data-URL префикса). */
export interface FontUploadPostPayload {
  fontFamily: string
  fontWeight: FontWeight[]
  display: FontDisplay
  style: FontStyle
  fallback: string
  fileName: string
  fileBase64: string
  mimeType: string
}

export interface UploadedFont extends FontUploadPostPayload {
  id: string
  uploadedAt: string
}
