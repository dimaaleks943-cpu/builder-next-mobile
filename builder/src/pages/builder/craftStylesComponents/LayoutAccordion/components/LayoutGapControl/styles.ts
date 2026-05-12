import { Box, Typography, styled } from "@mui/material"
import { COLORS } from "../../../../../../theme/colors.ts"

export const LayoutGapControlRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  columnGap: "8px",
  boxSizing: "border-box",
}))

export const LayoutGapControlLabel = styled(Typography)(() => ({
  minWidth: "48px",
  fontSize: "10px",
  lineHeight: "14px",
  color: COLORS.gray700,
  flexShrink: 0,
}))
