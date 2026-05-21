import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from "@mui/material"
import { type ReactNode } from "react"
import { COLORS } from "../../../../../../theme/colors.ts"
import {
  type FontUploadFormValues,
  type FontUploadStatus,
  type FontWeight,
} from "../../fontUpload.types.ts"
import {
  FONT_DISPLAY_OPTIONS,
  FONT_FALLBACK_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  isFontUploadFormComplete,
} from "../../fontUpload.utils.ts"
import {
  FontsUploadCheckIcon,
  FontsUploadFallbackRow,
  FontsUploadFileName,
  FontsUploadFileRow,
  FontsUploadFormCard,
  FontsUploadFormHint,
  FontsUploadFormLabel,
  FontsUploadFormRow,
  FontsUploadSubmitButton,
} from "./styles.ts"

interface Props {
  pendingId: string
  file: File
  form: FontUploadFormValues
  uploadStatus: FontUploadStatus
  onFormChange: (pendingId: string, patch: Partial<FontUploadFormValues>) => void
  onRemove: (pendingId: string) => void
  onUpload: (pendingId: string) => void
}

/** Карточка для загрузки шрифта: имя, fontWeight, display, style, fallback. */
export const FontUploadFileForm = ({
  pendingId,
  file,
  form,
  uploadStatus,
  onFormChange,
  onRemove,
  onUpload,
}: Props): ReactNode => {
  const weightLabelId = `font-upload-weight-label-${pendingId}`
  const displayLabelId = `font-upload-display-label-${pendingId}`
  const fallbackLabelId = `font-upload-fallback-label-${pendingId}`
  const styleLabelId = `font-upload-style-label-${pendingId}`

  const isComplete = isFontUploadFormComplete(form)
  const isUploading = uploadStatus === "uploading"

  const handleWeightChange = (value: FontWeight[]) => {
    onFormChange(pendingId, { fontWeight: value })
  }

  return (
    <FontsUploadFormCard>
      <Box>
        <FontsUploadFormLabel>Font file</FontsUploadFormLabel>
        <FontsUploadFileRow>
          <FontsUploadFileName>{file.name}</FontsUploadFileName>
        </FontsUploadFileRow>
        <FontsUploadSubmitButton
          variant="text"
          size="small"
          onClick={() => onRemove(pendingId)}
          sx={{ mt: 0.5, p: 0, minWidth: 0, color: COLORS.gray600, backgroundColor: "transparent" }}
        >
          Удалить
        </FontsUploadSubmitButton>
      </Box>

      <TextField
        fullWidth
        label="Font family"
        size="small"
        value={form.fontFamily}
        onChange={(event) => onFormChange(pendingId, { fontFamily: event.target.value })}
        sx={{ "& .MuiOutlinedInput-root": { backgroundColor: COLORS.white } }}
      />

      <FontsUploadFormRow>
        <FormControl fullWidth size="small">
          <InputLabel id={weightLabelId}>Font weight</InputLabel>
          <Select
            labelId={weightLabelId}
            label="Font weight"
            multiple
            value={form.fontWeight}
            onChange={(event) => handleWeightChange(event.target.value as FontWeight[])}
            renderValue={(selected) =>
              selected
                .map((weight) => FONT_WEIGHT_OPTIONS.find((option) => option.value === weight)?.label ?? weight)
                .join(", ")
            }
            sx={{ "& .MuiOutlinedInput-root": { backgroundColor: COLORS.white } }}
          >
            {FONT_WEIGHT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={form.fontWeight.includes(option.value)} size="small" />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel id={displayLabelId}>Display</InputLabel>
          <Select
            labelId={displayLabelId}
            label="Display"
            value={form.display}
            displayEmpty
            onChange={(event) =>
              onFormChange(pendingId, { display: event.target.value as FontUploadFormValues["display"] })
            }
            sx={{ "& .MuiOutlinedInput-root": { backgroundColor: COLORS.white } }}
          >
            <MenuItem value="" disabled>
              Select...
            </MenuItem>
            {FONT_DISPLAY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </FontsUploadFormRow>

      <FormControl>
        <FontsUploadFormLabel id={styleLabelId}>Style</FontsUploadFormLabel>
        <RadioGroup
          row
          aria-labelledby={styleLabelId}
          value={form.style}
          onChange={(event) =>
            onFormChange(pendingId, { style: event.target.value as FontUploadFormValues["style"] })
          }
        >
          <FormControlLabel value="normal" control={<Radio size="small" />} label="Normal" />
          <FormControlLabel value="italic" control={<Radio size="small" />} label="Italic" />
        </RadioGroup>
      </FormControl>

      <FontsUploadFallbackRow>
        <FormControl fullWidth size="small">
          <InputLabel id={fallbackLabelId}>Fallback</InputLabel>
          <Select
            labelId={fallbackLabelId}
            label="Fallback"
            value={form.fallback}
            displayEmpty
            onChange={(event) => onFormChange(pendingId, { fallback: event.target.value })}
            sx={{ "& .MuiOutlinedInput-root": { backgroundColor: COLORS.white } }}
          >
            <MenuItem value="" disabled>
              Select...
            </MenuItem>
            {FONT_FALLBACK_OPTIONS.map((fallback) => (
              <MenuItem key={fallback} value={fallback}>
                {fallback}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FontsUploadFormHint>
          Define the fallback font to be used in case a user&apos;s web browser fails to load your
          custom fonts.
        </FontsUploadFormHint>
      </FontsUploadFallbackRow>

      <FontsUploadSubmitButton
        ready={isComplete}
        variant="contained"
        disableElevation
        disabled={!isComplete || isUploading}
        onClick={() => onUpload(pendingId)}
      >
        <FontsUploadCheckIcon>✓</FontsUploadCheckIcon>
        {isUploading ? "Uploading..." : "Upload font file"}
      </FontsUploadSubmitButton>
    </FontsUploadFormCard>
  )
}
