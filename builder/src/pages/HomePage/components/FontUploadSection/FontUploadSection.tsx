import {
  type ChangeEvent,
  type ReactNode,
  useRef,
  useState,
} from "react"
import {
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material"
import { FontUploadFileForm } from "./components/FontUploadFileForm/FontUploadFileForm.tsx"
import {
  type FontUploadFormValues,
  type FontUploadPostPayload,
  type PendingFontUpload,
  type UploadedFont,
} from "./fontUpload.types.ts"
import {
  ALLOWED_FONT_EXTENSIONS,
  createEmptyFontUploadForm,
  fileToBase64,
  getFontMimeType,
  isFontUploadFormComplete,
  mockUploadFontRequest,
  partitionFontFiles,
} from "./fontUpload.utils.ts"
import {
  FontsLibraryDescription,
  FontsLibrarySelectFormControl,
  FontsModeButton,
  FontsModeButtonGroup,
  FontsTabHeader,
  FontsTabRoot,
  FontsTabTitle,
  FontsUploadActionButton,
  FontsUploadFormsStack,
  FontsUploadHiddenInput,
  FontsUploadPlaceholder,
  FontsUploadValidationError,
} from "./styles.ts"

enum FONTS_TAB_MODE {
  LIBRARY = "library",
  UPLOAD = "upload",
}

const DEFAULT_LIBRARY_FONTS = [
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Arial",
  "Inter",
  "Lato",
  "Nunito",
  "PT Sans",
] as const

const FONT_FILE_ACCEPT = ALLOWED_FONT_EXTENSIONS.join(",")

export const FontUploadSection = (): ReactNode => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tabMode, setTabMode] = useState<FONTS_TAB_MODE>(FONTS_TAB_MODE.LIBRARY)
  const [selectedLibraryFont, setSelectedLibraryFont] = useState<string>("")
  const [pendingUploads, setPendingUploads] = useState<PendingFontUpload[]>([])
  const [uploadedFonts, setUploadedFonts] = useState<UploadedFont[]>([])
  const [validationError, setValidationError] = useState<string>("")

  const handlePickFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList?.length) return

    const { validFiles, invalidFiles } = partitionFontFiles(Array.from(fileList))

    if (invalidFiles.length > 0) {
      const invalidNames = invalidFiles.map((file) => file.name).join(", ")
      setValidationError(
        `Неподдерживаемый формат: ${invalidNames}. Допустимы: WOFF, WOFF2, TTF, OTF.`,
      )
    } else {
      setValidationError("")
    }

    if (validFiles.length > 0) {
      setPendingUploads((prev) => [
        ...prev,
        ...validFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
          form: createEmptyFontUploadForm(),
          uploadStatus: "pending" as const,
        })),
      ])
    }

    event.target.value = ""
  }

  const handleFormChange = (pendingId: string, patch: Partial<FontUploadFormValues>) => {
    setPendingUploads((prev) =>
      prev.map((item) =>
        item.id === pendingId
          ? { ...item, form: { ...item.form, ...patch }, uploadStatus: "pending" }
          : item,
      ),
    )
  }

  const handleRemovePending = (pendingId: string) => {
    setPendingUploads((prev) => prev.filter((item) => item.id !== pendingId))
  }

  const handleUpload = async (pendingId: string) => {
    const pendingItem = pendingUploads.find((item) => item.id === pendingId)
    if (!pendingItem || !isFontUploadFormComplete(pendingItem.form)) return

    setPendingUploads((prev) =>
      prev.map((item) =>
        item.id === pendingId ? { ...item, uploadStatus: "uploading" } : item,
      ),
    )

    try {
      const fileBase64 = await fileToBase64(pendingItem.file)
      const payload: FontUploadPostPayload = {
        fontFamily: pendingItem.form.fontFamily.trim(),
        fontWeight: pendingItem.form.fontWeight,
        display: pendingItem.form.display as FontUploadPostPayload["display"],
        style: pendingItem.form.style as FontUploadPostPayload["style"],
        fallback: pendingItem.form.fallback,
        fileName: pendingItem.file.name,
        fileBase64,
        mimeType: pendingItem.file.type || getFontMimeType(pendingItem.file.name),
      }

      await mockUploadFontRequest(payload)

      setUploadedFonts((prev) => [
        ...prev,
        {
          ...payload,
          id: crypto.randomUUID(),
          uploadedAt: new Date().toISOString(),
        },
      ])

      setPendingUploads((prev) => prev.filter((item) => item.id !== pendingId))
    } catch {
      setPendingUploads((prev) =>
        prev.map((item) =>
          item.id === pendingId ? { ...item, uploadStatus: "error" } : item,
        ),
      )
    }
  }

  const handleToggleManage = () => {

  }

  return (
    <FontsTabRoot>
      <FontsTabHeader>
        <FontsTabTitle>Шрифты</FontsTabTitle>
      </FontsTabHeader>

      <FontsModeButtonGroup variant="text" disableElevation disableRipple>
        <FontsModeButton
          active={tabMode === FONTS_TAB_MODE.LIBRARY}
          onClick={() => setTabMode(FONTS_TAB_MODE.LIBRARY)}
        >
          Библиотека
        </FontsModeButton>
        <FontsModeButton
          active={tabMode === FONTS_TAB_MODE.UPLOAD}
          onClick={() => setTabMode(FONTS_TAB_MODE.UPLOAD)}
        >
          Загрузить шрифт
        </FontsModeButton>
      </FontsModeButtonGroup>

      {tabMode === FONTS_TAB_MODE.LIBRARY ? (
        <>
          <FontsLibraryDescription>
            Мы отобрали для вас лучшие шрифты. Используйте их, чтобы придать своему
            проекту подходящий стиль.
          </FontsLibraryDescription>

          <FontsLibrarySelectFormControl fullWidth size="small">
            <InputLabel id="fonts-library-select-label">Выберите шрифт</InputLabel>
            <Select
              labelId="fonts-library-select-label"
              label="Выберите шрифт"
              value={selectedLibraryFont}
              displayEmpty
              onChange={(event) => setSelectedLibraryFont(event.target.value)}
            >
              {DEFAULT_LIBRARY_FONTS.map((fontName) => (
                <MenuItem key={fontName} value={fontName}>
                  {fontName}
                </MenuItem>
              ))}
            </Select>
          </FontsLibrarySelectFormControl>
        </>
      ) : (
        <>
          <FontsUploadPlaceholder>
            <FontsUploadActionButton
              variant="contained"
              disableElevation
              onClick={handlePickFileClick}
            >
              Загрузить файлы шрифта
            </FontsUploadActionButton>
            <FontsUploadHiddenInput
              ref={fileInputRef}
              type="file"
              multiple
              accept={FONT_FILE_ACCEPT}
              onChange={handleFileInputChange}
            />
            <FontsUploadActionButton
              variant="contained"
              disableElevation
              onClick={handleToggleManage}
            >
              Управлять файлами шрифта
            </FontsUploadActionButton>
          </FontsUploadPlaceholder>

          {validationError ? (
            <FontsUploadValidationError>{validationError}</FontsUploadValidationError>
          ) : null}

          {pendingUploads.length > 0 ? (
            <FontsUploadFormsStack>
              {pendingUploads.map((item) => (
                <FontUploadFileForm
                  key={item.id}
                  pendingId={item.id}
                  file={item.file}
                  form={item.form}
                  uploadStatus={item.uploadStatus}
                  onFormChange={handleFormChange}
                  onRemove={handleRemovePending}
                  onUpload={handleUpload}
                />
              ))}
            </FontsUploadFormsStack>
          ) : null}
        </>
      )}
    </FontsTabRoot>
  )
}
