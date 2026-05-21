import {
  type ReactNode,
  useState,
} from "react"
import {
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material"
import {
  FontsLibraryDescription,
  FontsLibrarySelectFormControl,
  FontsModeButton,
  FontsModeButtonGroup,
  FontsTabHeader,
  FontsTabRoot,
  FontsTabTitle,
  FontsUploadActionButton,
  FontsUploadPlaceholder,
} from "../styles.ts"

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

export const FontUploadSection = (): ReactNode => {
  const [tabMode, setTabMode] = useState<FONTS_TAB_MODE>(FONTS_TAB_MODE.LIBRARY)
  const [selectedLibraryFont, setSelectedLibraryFont] = useState<string>("")

  const handlePickFileClick = () => {

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
          active={tabMode === "library"}
          onClick={() => setTabMode(FONTS_TAB_MODE.LIBRARY)}
        >
          Библиотека
        </FontsModeButton>
        <FontsModeButton
          active={tabMode === "upload"}
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
            <FontsUploadActionButton
              variant="contained"
              disableElevation
              onClick={handleToggleManage}
            >
              Управлять файлами шрифта
            </FontsUploadActionButton>
          </FontsUploadPlaceholder>

        </>
      )}
    </FontsTabRoot>
  )
}
