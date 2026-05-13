import { Box, Typography, styled } from "@mui/material"
import { COLORS } from "../../../../../../theme/colors.ts"

export const LayoutGridSectionRoot = styled(Box)(() => ({
  marginTop: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
}))

export const LayoutGridSectionGridRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "stretch",
  gap: "8px",
  width: "100%",
}))

export const LayoutGridSectionGridMainLabelColumn = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
}))

export const LayoutGridSectionGridInputsArea = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  gap: "8px",
}))

export const LayoutGridSectionNumericStack = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "4px",
}))

export const LayoutGridSectionSubLabel = styled(Typography)(() => ({
  fontSize: "10px",
  lineHeight: "14px",
  color: COLORS.gray700,
  textAlign: "center",
  alignSelf: "stretch",
}))

export const LayoutGridAutoFlowIconSpin = styled(Box)(() => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 0,
  transform: "rotate(90deg)",
}))
