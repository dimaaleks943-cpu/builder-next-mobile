import { Box, styled } from "@mui/material"
import { alpha } from "@mui/material/styles"
import { COLORS } from "../../../../../../theme/colors.ts";

export const FlexAlignGridRoot = styled(Box)(() => ({
  position: "relative",
  width: 50,
  height: 50,
  flexShrink: 0,
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gridTemplateRows: "repeat(3, 1fr)",
  boxSizing: "border-box",
  border: `1px solid ${COLORS.purple100}`,
  borderRadius: "4px",
  backgroundColor: COLORS.white,
  overflow: "hidden",
}))

export const FlexAlignGridCell = styled("button")(() => ({
  margin: 0,
  padding: 0,
  minWidth: 0,
  minHeight: 0,
  width: "100%",
  height: "100%",
  border: "none",
  backgroundColor: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  "&:nth-of-type(3n)": {
    borderRight: "none",
  },
  "&:nth-of-type(n + 7)": {
    borderBottom: "none",
  },
  "&:hover": {
    backgroundColor: alpha(COLORS.white, 0.06),
  },
}))

export const FlexAlignGridDot = styled(Box)(() => ({
  width: "3px",
  height: "3px",
  borderRadius: "50%",
  backgroundColor: COLORS.purple200,
  flexShrink: 0,
}))

export const FlexAlignBarVertical = styled(Box)(() => ({
  width: "2px",
  borderRadius: "1px",
  backgroundColor: COLORS.purple400,
  flexShrink: 0,
}))

export const FlexAlignBarHorizontal = styled(Box)(() => ({
  height: "2px",
  borderRadius: "1px",
  backgroundColor: COLORS.purple400,
  flexShrink: 0,
}))

export const FlexAlignClusterRow = styled(Box)(() => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "center",
  gap: "2px",
}))

export const FlexAlignClusterCol = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: "2px",
}))

export const FlexAlignDistributedBarWrap = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
}))

export const FlexAlignStretchBarsOuter = styled(Box, {
  shouldForwardProp: (prop) =>
    !["$isRow", "$justify", "$grouped"].includes(String(prop)),
})<{
  $isRow: boolean
  $justify:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
  $grouped: boolean
}>(({ $isRow, $justify, $grouped }) => ({
  position: "absolute",
  inset: 0,
  boxSizing: "border-box",
  padding: $isRow ? "3px 5px" : "5px 3px",
  pointerEvents: "none",
  display: "flex",
  flexDirection: $isRow ? "row" : "column",
  alignItems: "stretch",
  justifyContent: $justify,
  zIndex: 1,
  gap: $grouped ? "2px" : 0,
}))

export const FlexAlignStretchTray = styled(Box, {
  shouldForwardProp: (prop) => prop !== "$isRow",
})<{ $isRow: boolean }>(({ $isRow }) => ({
  display: "flex",
  flexDirection: $isRow ? "row" : "column",
  alignItems: "stretch",
  justifyContent: "center",
  boxSizing: "border-box",
  ...($isRow
    ? {
        height: "100%",
        width: "auto",
        gap: "2px",
      }
    : {
        width: "100%",
        height: "auto",
        gap: "2px",
      }),
}))

export const FlexAlignStretchBarVerticalFull = styled(Box)(() => ({
  width: "2px",
  borderRadius: "1px",
  backgroundColor: COLORS.purple400,
  flexShrink: 0,
  alignSelf: "stretch",
}))

export const FlexAlignStretchBarHorizontalFull = styled(Box)(() => ({
  height: "2px",
  borderRadius: "1px",
  backgroundColor: COLORS.purple400,
  flexShrink: 0,
  alignSelf: "stretch",
}))

export const FlexAlignSpaceAroundOverlay = styled(Box)(() => ({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  boxSizing: "border-box",
  zIndex: 2,
}))
