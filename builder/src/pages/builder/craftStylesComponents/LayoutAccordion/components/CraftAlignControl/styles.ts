import { Box, styled, Typography } from "@mui/material"
import { COLORS } from "../../../../../../theme/colors"

/** 62×62 surface for {@link CraftAlignControl} grid / stretch preview */
export const CraftAlignControlSurface = styled(Box)(() => ({
  position: "relative",
  width: "62px",
  height: "62px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  border: `1px solid ${COLORS.purple100}`,
  borderRadius: "4px",
  backgroundColor: COLORS.white,
  boxSizing: "border-box",
  cursor: "pointer",
  overflow: "hidden",
}))

export const CraftAlignControlGridHost = styled(Box)(() => ({
  position: "relative",
  zIndex: 1,
  width: "100%",
  height: "100%",
  minHeight: 0,
  minWidth: 0,
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gridTemplateRows: "repeat(3, 1fr)",
  gap: 0,
  padding: "3px",
  boxSizing: "border-box",
}))

export const CraftAlignControlStretchArrowsLayer = styled(Box)(() => ({
  position: "absolute",
  inset: 0,
  zIndex: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
}))

export const CraftAlignControlSelection = styled(Box, {
  shouldForwardProp: (p) =>
    !["$rowStart", "$rowEnd", "$colStart", "$colEnd"].includes(String(p)),
})<{
  $rowStart: number
  $rowEnd: number
  $colStart: number
  $colEnd: number
}>(({ $rowStart, $rowEnd, $colStart, $colEnd }) => ({
  gridRow: `${$rowStart} / ${$rowEnd}`,
  gridColumn: `${$colStart} / ${$colEnd}`,
  zIndex: 0,
  boxSizing: "border-box",
  border: `1px solid ${COLORS.gray300}`,
  borderRadius: "2px",
  backgroundColor: COLORS.purple400,
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 0,
  minHeight: 0,
}))

export const CraftAlignControlCellButton = styled("button")(() => ({
  position: "relative",
  zIndex: 1,
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  padding: 0,
  margin: 0,
  border: "none",
  backgroundColor: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "inherit",
}))

export const CraftAlignControlDot = styled(Box)(() => ({
  width: "2px",
  height: "2px",
  borderRadius: "50%",
  backgroundColor: COLORS.purple200,
  flexShrink: 0,
}))

export const CraftAlignControlSelectedInnerSquare = styled(Box)(() => ({
  width: "5px",
  height: "5px",
  borderRadius: "1px",
  backgroundColor: COLORS.purple400,
  flexShrink: 0,
}))

export const CraftAlignControlBaselineMark = styled(Typography)(() => ({
  fontSize: "11px",
  fontWeight: 600,
  lineHeight: 1,
  color: COLORS.white,
  userSelect: "none",
})) as typeof Typography

/** Full-width row: fixed label column + align surface / selects (matches layout grid section rows) */
export const CraftAlignControlRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "stretch",
  gap: "8px",
  width: "100%",
}))

export const CraftAlignControlLabelColumn = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
}))

export const CraftAlignControlInputsArea = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  gap: "8px",
}))
