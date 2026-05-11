import { Box, styled } from "@mui/material"
import { COLORS } from "../../../../theme/colors.ts"

export const PositionGridFrame = styled(Box)(() => ({
  width: "50px",
  height: "50px",
  flexShrink: 0,
  borderRadius: "2px",
  border: `1px solid ${COLORS.purple100}`,
  position: "relative",
  boxSizing: "border-box",
  backgroundColor: COLORS.white,
}))

export const PositionNineGridLayout = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gridTemplateRows: "repeat(3, 1fr)",
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
}))

export const PositionNineGridCell = styled("button")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: 0,
  padding: 0,
  border: "none",
  backgroundColor: "transparent",
  cursor: "pointer",
  fontFamily: "inherit",
  boxSizing: "border-box",
  "&:focus-visible": {
    outline: `2px solid ${COLORS.purple400}`,
    outlineOffset: -2,
  },
}))

export const PositionNineGridDotShell = styled(Box)(() => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  pointerEvents: "none",
}))

export const PositionNineGridDiamondWrap = styled(Box)(() => ({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
}))

export const PositionNineGridDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "$selected",
})<{ $selected: boolean }>(({ $selected }) => ({
  width: "2px",
  height: "2px",
  borderRadius: "50%",
  flexShrink: 0,
  zIndex: 1,
  backgroundColor: $selected ? COLORS.purple400 : COLORS.purple200,
}))
