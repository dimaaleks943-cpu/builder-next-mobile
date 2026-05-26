import { Box, IconButton, styled, Typography } from "@mui/material"
import { COLORS } from "../../theme/colors.ts"

export const ModalRoot = styled(Box)(() => ({
  position: "fixed",
  width: 228,
  backgroundColor: COLORS.white,
  borderRadius: 4,
  boxShadow: "0px 2px 4px rgba(0,0,0,0.25)",
  zIndex: 16000,
  boxSizing: "border-box",
}))

export const ModalHeader = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 8,
}))

export const ModalTitle = styled(Typography)(() => ({
  fontWeight: 500,
  fontSize: 12,
  lineHeight: "14px",
  color: COLORS.black,
}))

export const ModalCloseButton = styled(IconButton)(() => ({
  padding: 0,
}))

export const ModalDivider = styled(Box)(() => ({
  height: 1,
  backgroundColor: COLORS.purple100,
}))

export const ModalContent = styled(Box)(() => ({
  padding: 8,
}))

export const ShowAllSettingsWrapper = styled(Box)(() => ({
  padding: 8,
  paddingTop: 0,
}))

export const ShowAllSettingsButton = styled("button")(() => ({
  width: "100%",
  backgroundColor: COLORS.purple100,
  borderRadius: 2,
  padding: 4,
  fontSize: 10,
  lineHeight: "14px",
  fontWeight: 400,
  color: COLORS.black,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  boxSizing: "border-box",
}))
