import { Box, IconButton, styled } from "@mui/material"
import { COLORS } from "../../../../../theme/colors.ts"

export const LinearGradientTrackShell = styled(Box)(() => ({
  position: "relative",
  width: "100%",
  height: "22px",
  borderRadius: "2px",
  border: `1px solid ${COLORS.purple100}`,
  boxSizing: "border-box",
  overflow: "visible",
  flexShrink: 0,
  cursor: "pointer",
}))

export const LinearGradientTrackFill = styled(Box)(() => ({
  position: "absolute",
  inset: 0,
  borderRadius: "1px",
  pointerEvents: "none",
}))

export const LinearGradientThumb = styled("button", {
  shouldForwardProp: (prop) => prop !== "$selected" && prop !== "$stopColor",
})<{ $selected: boolean; $stopColor: string }>(({ $selected, $stopColor }) => ({
  position: "absolute",
  top: "50%",
  transform: "translate(-50%, -50%)",
  width: "10px",
  height: "16px",
  margin: 0,
  padding: 0,
  borderRadius: "2px",
  cursor: "grab",
  touchAction: "none",
  userSelect: "none",
  WebkitUserSelect: "none",
  boxSizing: "border-box",
  zIndex: $selected ? 2 : 1,
  backgroundColor: $selected ? $stopColor : COLORS.white,
  border: $selected ? `2px solid ${COLORS.white}` : `1px solid ${COLORS.gray300}`,
  flexShrink: 0,
  fontFamily: "inherit",
  "&:active": {
    cursor: "grabbing",
  },
  "&:focus-visible": {
    outline: `2px solid ${COLORS.purple400}`,
    outlineOffset: 1,
  },
}))

export const LinearGradientOptionsRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  gap: "8px",
}))

export const LinearGradientRepeatLabel = styled(Box)(() => ({
  fontSize: "10px",
  lineHeight: "14px",
  letterSpacing: "0.015em",
  color: COLORS.gray700,
  userSelect: "none",
}))

export const LinearGradientSwapButton = styled(IconButton)(() => ({
  padding: "2px",
  color: COLORS.gray700,
  "&:hover": {
    color: COLORS.purple400,
    backgroundColor: "transparent",
  },
}))

export const LinearGradientAngleDialShell = styled(Box)(() => ({
  width: "25px",
  height: "25px",
  borderRadius: "50%",
  backgroundColor: COLORS.gray400,
  position: "relative",
  flexShrink: 0,
  cursor: "pointer",
  touchAction: "none",
  boxSizing: "border-box",
}))

export const LinearGradientAngleDialRotate = styled(Box)(() => ({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  transformOrigin: "50% 50%",
}))

export const LinearGradientAngleDialKnob = styled(Box)(() => ({
  position: "absolute",
  left: "50%",
  top: "2px",
  width: "6px",
  height: "6px",
  marginLeft: "-3px",
  borderRadius: "50%",
  backgroundColor: COLORS.white,
}))

export const LinearGradientAngleStepButton = styled(IconButton)(() => ({
  padding: "2px",
  color: COLORS.gray700,
  "&:hover": {
    color: COLORS.purple400,
    backgroundColor: "transparent",
  },
}))
