import { Box, Button, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { COLORS } from "../../../../../../theme/colors"

export const FontsUploadFormCard = styled(Box)({
  marginTop: 16,
  padding: 16,
  borderRadius: 8,
  backgroundColor: COLORS.white,
  border: `1px solid ${COLORS.gray200}`,
  display: "flex",
  flexDirection: "column",
  gap: 16,
})


export const FontsUploadFormLabel = styled(Typography)({
  fontSize: 12,
  fontWeight: 600,
  color: COLORS.gray700,
  marginBottom: 4,
})

export const FontsUploadFileName = styled(Typography)({
  fontSize: 14,
  color: COLORS.black,
  wordBreak: "break-all",
})

export const FontsUploadFormHint = styled(Typography)({
  fontSize: 12,
  lineHeight: "16px",
  color: COLORS.gray600,
})

export const FontsUploadSubmitButton = styled(Button)({
  alignSelf: "flex-start",
  textTransform: "none",
  fontWeight: 600,
  fontSize: 12,
  gap: 6,
})
