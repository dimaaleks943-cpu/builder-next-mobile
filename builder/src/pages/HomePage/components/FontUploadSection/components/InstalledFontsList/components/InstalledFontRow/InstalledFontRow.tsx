import {
  capitalizeFontStyle,
  formatBase64FileSize,
  formatFontWeightsLabel,
  getFontFaceFormat,
  getFontFileExtensionLabel
} from "../../../../fontUpload.utils.ts";
import { DeleteIcon } from "../../../../../../../../icons/DeleteIcon.tsx";
import { COLORS } from "../../../../../../../../theme/colors.ts";
import { Divider } from "@mui/material";
import type { UploadedFont } from "../../../../fontUpload.types.ts";
import type { ReactNode } from "react";
import {
  InstalledFontsActionButton,
  InstalledFontsActions,
  InstalledFontsFamilyName, InstalledFontsIconWrap, InstalledFontsMetaDivider,
  InstalledFontsMetaItem, InstalledFontsMetaRow,
  InstalledFontsRow,
  InstalledFontsRowContent
} from "./styles.ts";

interface Props {
  font: UploadedFont
  onDelete: (fontId: string) => void
}


export const InstalledFontRow = ({
  font,
  onDelete,
}: Props): ReactNode => {
  const previewFontFamily = `installed-font-preview-${font.id}`
  const fontFaceFormat = getFontFaceFormat(font.fileName)
  const extensionLabel = getFontFileExtensionLabel(font.fileName)
  const fileSizeLabel = formatBase64FileSize(font.fileBase64)
  const weightsLabel = formatFontWeightsLabel(font.fontWeight)
  const styleLabel = capitalizeFontStyle(font.style)

  return (
    <>
      <style>    {/* для визуального отображения шрифта в карточке*/}
        {` 
          @font-face {
            font-family: '${previewFontFamily}';
            src: url(data:${font.mimeType};base64,${font.fileBase64}) format('${fontFaceFormat}');
            font-display: swap;
          }
        `}
      </style>

      <InstalledFontsRow>
        <InstalledFontsRowContent>
          <InstalledFontsFamilyName sx={{ fontFamily: `'${previewFontFamily}', sans-serif` }}>
            {font.fontFamily}
          </InstalledFontsFamilyName>

          <InstalledFontsMetaRow>
            <InstalledFontsMetaItem>
              <InstalledFontsIconWrap>Aa</InstalledFontsIconWrap>
              {weightsLabel}
            </InstalledFontsMetaItem>

            <InstalledFontsMetaDivider>|</InstalledFontsMetaDivider>

            <InstalledFontsMetaItem>Style: {styleLabel}</InstalledFontsMetaItem>

            <InstalledFontsMetaDivider>|</InstalledFontsMetaDivider>

            <InstalledFontsMetaItem>
              {extensionLabel}
            </InstalledFontsMetaItem>

            <InstalledFontsMetaDivider>|</InstalledFontsMetaDivider>

            <InstalledFontsMetaItem>
              {fileSizeLabel}
            </InstalledFontsMetaItem>

            <InstalledFontsMetaDivider>|</InstalledFontsMetaDivider>

            <InstalledFontsMetaItem>Display: {font.display}</InstalledFontsMetaItem>
          </InstalledFontsMetaRow>
        </InstalledFontsRowContent>

        <InstalledFontsActions>
          <InstalledFontsActionButton variant="outlined" size="small" onClick={() => {
          }}>
            Edit
          </InstalledFontsActionButton>
          <InstalledFontsActionButton variant="outlined" size="small" onClick={() => onDelete(font.id)}>
            <DeleteIcon size={14} fill={COLORS.blue400}/>
            Delete
          </InstalledFontsActionButton>
        </InstalledFontsActions>
      </InstalledFontsRow>
      <Divider/>
    </>
  )
}
