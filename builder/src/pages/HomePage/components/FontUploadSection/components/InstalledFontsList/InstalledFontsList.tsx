import { type ReactNode } from "react"
import { type UploadedFont } from "../../fontUpload.types.ts"
import {
  InstalledFontsEmptyText,
  InstalledFontsRoot,
  InstalledFontsTitle,
} from "./styles.ts"
import { InstalledFontRow } from "./components/InstalledFontRow/InstalledFontRow.tsx";

interface Props {
  fonts: UploadedFont[]
  onDelete: (fontId: string) => void
}

export const InstalledFontsList = ({ fonts, onDelete }: Props): ReactNode => {
  const handleDelete = (fontId: string) => {
    onDelete(fontId)
  }

  return (
    <InstalledFontsRoot>
      <InstalledFontsTitle>Установленый шрифты</InstalledFontsTitle>

      {fonts.length === 0 ? (
        <InstalledFontsEmptyText>Нет загруженных шрифтов</InstalledFontsEmptyText>
      ) : (
        fonts.map((font) => (
          <InstalledFontRow
            key={font.id}
            font={font}
            onDelete={handleDelete}
          />
        ))
      )}
    </InstalledFontsRoot>
  )
}
