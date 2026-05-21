import { Box, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { COLORS } from "../../../../../../theme/colors.ts"

export const InstalledFontsRoot = styled(Box)({
  marginTop: 16,
})

export const InstalledFontsTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: 16,
  lineHeight: "24px",
  color: COLORS.black,
})

export const InstalledFontsEmptyText = styled(Typography)({
  fontSize: 12,
  lineHeight: "16px",
  color: COLORS.gray600,
  padding: "12px 0",
})
