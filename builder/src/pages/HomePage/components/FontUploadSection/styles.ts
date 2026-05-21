import { Box, Button, ButtonGroup, FormControl, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { COLORS } from "../../../../theme/colors.ts"

export const FontsTabRoot = styled(Box)({
  maxWidth: 720,
})

export const FontsTabHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 16,
})

export const FontsTabTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: 20,
  lineHeight: "28px",
  color: COLORS.black,
})

export const FontsModeButtonGroup = styled(ButtonGroup)({
  "& .MuiButtonGroup-grouped": {
    border: "none",
    minWidth: 0,
    borderRadius: "4px !important",
    "&:not(:last-of-type)": {
      borderRight: "none",
    },
  },
})

export const FontsModeButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ active }) => ({
  textTransform: "uppercase",
  fontWeight: 600,
  fontSize: "14px",
  lineHeight: "20px",
  color: COLORS.purple400,
  backgroundColor: active ? COLORS.purple100 : "transparent",
  padding: "8px 32px",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: COLORS.purple100,
    boxShadow: "none",
  },
}))

export const FontsLibraryDescription = styled(Typography)({
  fontSize: 12,
  lineHeight: "18px",
  color: COLORS.gray600,
  marginBottom: 16,
})

export const FontsLibrarySelectFormControl = styled(FormControl)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: COLORS.white,
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: COLORS.purple400,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: COLORS.purple400,
  },
})


export const FontsUploadPlaceholder = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 12,
})

export const FontsUploadActionButton = styled(Button)({
  textTransform: "none",
  fontWeight: 600,
  fontSize: 12,
  padding: "12px 20px",
  backgroundColor: COLORS.purple400,
  color: COLORS.white,
  "&:hover": {
    backgroundColor: COLORS.purple400,
    filter: "brightness(0.92)",
  },
})

export const FontsUploadFormsStack = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 12,
})

export const FontsUploadValidationError = styled(Typography)({
  marginTop: 8,
  fontSize: 12,
  lineHeight: "16px",
  color: COLORS.red300,
})

export const FontsUploadHiddenInput = styled("input")({
  display: "none",
})
