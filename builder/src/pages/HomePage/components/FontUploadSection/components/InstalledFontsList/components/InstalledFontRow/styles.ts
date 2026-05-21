import { Box, Button, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { COLORS } from "../../../../../../../../theme/colors.ts";

export const InstalledFontsRow = styled(Box)({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  gap: 12,
  padding: "12px 0",
})

export const InstalledFontsRowContent = styled(Box)({
  minWidth: 0,
})

export const InstalledFontsFamilyName = styled(Typography)({
  fontSize: 16,
  lineHeight: "24px",
  color: COLORS.black,
  marginBottom: 4,
  wordBreak: "break-word",
})

export const InstalledFontsMetaRow = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 8,
  fontSize: 12,
  lineHeight: "16px",
  color: COLORS.gray600,
})

export const InstalledFontsMetaItem = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
})

export const InstalledFontsMetaDivider = styled(Typography)({
  fontSize: 12,
  lineHeight: "16px",
  color: COLORS.gray400,
})

export const InstalledFontsActions = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
})

export const InstalledFontsActionButton = styled(Button)({
  textTransform: "none",
  fontWeight: 600,
  fontSize: 12,
  lineHeight: "16px",
  padding: "6px 12px",
  minWidth: 0,
  gap: 6,
  color: COLORS.blue400,
  borderColor: COLORS.blue200,
  backgroundColor: COLORS.white,
  "&:hover": {
    borderColor: COLORS.blue400,
    backgroundColor: COLORS.blue100,
  },
})

export const InstalledFontsIconWrap = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: COLORS.gray600,
})
