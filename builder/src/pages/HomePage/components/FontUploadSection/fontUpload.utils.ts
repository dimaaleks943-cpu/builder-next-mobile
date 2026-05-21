import {
  type FontUploadFormValues,
  type FontUploadPostPayload,
} from "./fontUpload.types.ts"

export const ALLOWED_FONT_EXTENSIONS = [".woff", ".woff2", ".ttf", ".otf"] as const

export const FONT_WEIGHT_OPTIONS = [
  { value: 100, label: "100 (Thin)" },
  { value: 200, label: "200 (Extra Light)" },
  { value: 300, label: "300 (Light)" },
  { value: 400, label: "400 (Normal)" },
  { value: 500, label: "500 (Medium)" },
  { value: 600, label: "600 (Semi Bold)" },
  { value: 700, label: "700 (Bold)" },
  { value: 800, label: "800 (Extra Bold)" },
  { value: 900, label: "900 (Black)" },
] as const

export const FONT_DISPLAY_OPTIONS = [
  { value: "auto", label: "auto" },
  { value: "block", label: "block" },
  { value: "swap", label: "swap" },
  { value: "fallback", label: "fallback" },
  { value: "optional", label: "optional" },
] as const

export const FONT_FALLBACK_OPTIONS = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Tahoma",
  "sans-serif",
  "serif",
  "monospace",
] as const

export const createEmptyFontUploadForm = (): FontUploadFormValues => ({
  fontFamily: "",
  fontWeight: [],
  display: "",
  style: "",
  fallback: "",
})

export const getFontFileExtension = (fileName: string): string => {
  const dotIndex = fileName.lastIndexOf(".")
  if (dotIndex === -1) return ""
  return fileName.slice(dotIndex).toLowerCase()
}

export const isAllowedFontFile = (file: File): boolean => {
  const extension = getFontFileExtension(file.name)
  return ALLOWED_FONT_EXTENSIONS.includes(
    extension as (typeof ALLOWED_FONT_EXTENSIONS)[number],
  )
}

export const partitionFontFiles = (files: File[]): {
  validFiles: File[]
  invalidFiles: File[]
} => {
  const validFiles: File[] = []
  const invalidFiles: File[] = []

  files.forEach((file) => {
    if (isAllowedFontFile(file)) {
      validFiles.push(file)
      return
    }
    invalidFiles.push(file)
  })

  return { validFiles, invalidFiles }
}

export const isFontUploadFormComplete = (form: FontUploadFormValues): boolean =>
  form.fontFamily.trim() !== "" &&
  form.fontWeight.length > 0 &&
  form.display !== "" &&
  form.style !== "" &&
  form.fallback !== ""

export const getFontMimeType = (fileName: string): string => {
  const extension = getFontFileExtension(fileName)

  switch (extension) {
    case ".woff":
      return "font/woff"
    case ".woff2":
      return "font/woff2"
    case ".ttf":
      return "font/ttf"
    case ".otf":
      return "font/otf"
    default:
      return "application/octet-stream"
  }
}

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to read file as base64"))
        return
      }

      const base64 = reader.result.split(",")[1] ?? reader.result
      resolve(base64)
    }

    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })

/** Имитация POST-запроса на сервер до появления реального API. */
export const mockUploadFontRequest = async (
  payload: FontUploadPostPayload,
): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 800)
  })

  if (import.meta.env.DEV) {
    console.info("[mockUploadFontRequest]", {
      ...payload,
      fileBase64: `[base64, ${payload.fileBase64.length} chars]`,
    })
  }
}
