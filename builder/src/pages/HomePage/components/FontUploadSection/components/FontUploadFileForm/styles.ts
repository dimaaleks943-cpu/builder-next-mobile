import { Box, Button, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { COLORS } from "../../../../../../theme/colors.ts"

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

export const FontsUploadFormRow = styled(Box)({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
})

export const FontsUploadFallbackRow = styled(Box)({
  display: "grid",
  gridTemplateColumns: "minmax(0, 280px) 1fr",
  gap: 16,
  alignItems: "start",
})

export const FontsUploadFormLabel = styled(Typography)({
  fontSize: 12,
  fontWeight: 600,
  color: COLORS.gray700,
  marginBottom: 4,
})

export const FontsUploadFileRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
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

export const FontsUploadSubmitButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "ready",
})<{ ready?: boolean }>(({ ready }) => ({
  alignSelf: "flex-start",
  textTransform: "none",
  fontWeight: 600,
  fontSize: 12,
  gap: 6,
  padding: "8px 16px",
  color: COLORS.white,
  backgroundColor: ready ? COLORS.blue400 : COLORS.gray300,
  "&:hover": {
    backgroundColor: ready ? COLORS.blue400 : COLORS.gray300,
    filter: ready ? "brightness(0.92)" : "none",
  },
  "&.Mui-disabled": {
    color: COLORS.white,
    backgroundColor: COLORS.gray300,
  },
}))

export const FontsUploadCheckIcon = styled(Box)({
  width: 16,
  height: 16,
  borderRadius: "50%",
  border: `1px solid ${COLORS.white}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
  lineHeight: 1,
})
