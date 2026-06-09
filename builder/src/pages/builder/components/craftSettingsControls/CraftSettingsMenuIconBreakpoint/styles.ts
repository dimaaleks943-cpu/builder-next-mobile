import { Box, IconButton, Slider, Typography, styled } from "@mui/material"
import { COLORS } from "../../../../../theme/colors.ts"

export const MenuIconBreakpointRoot = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  width: "100%",
  boxSizing: "border-box",
}))

export const MenuIconBreakpointHeaderRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  columnGap: "8px",
}))

export const MenuIconBreakpointHeaderLabel = styled(Typography)(() => ({
  fontSize: "10px",
  lineHeight: "14px",
  color: COLORS.gray700,
  flexShrink: 0,
})) as typeof Typography

export const MenuIconBreakpointHeaderValue = styled(Typography)(() => ({
  fontSize: "10px",
  lineHeight: "14px",
  color: COLORS.gray600,
  fontStyle: "italic",
  textAlign: "right",
  flex: 1,
  minWidth: 0,
})) as typeof Typography

export const MenuIconBreakpointIconsRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "$columnCount",
})<{ $columnCount: number }>(({ $columnCount }) => ({
  display: "grid",
  gridTemplateColumns: `repeat(${$columnCount}, 1fr)`,
  width: "100%",
  paddingLeft: "6px",
  paddingRight: "6px",
  boxSizing: "border-box",
}))

export const MenuIconBreakpointDeviceButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "$active" && prop !== "$rotated",
})<{ $active: boolean; $rotated?: boolean }>(({ $active, $rotated }) => ({
  justifySelf: "center",
  borderRadius: "2px",
  padding: "2px",
  backgroundColor: $active ? COLORS.purple100 : "transparent",
  ...($rotated ? { transform: "rotate(270deg)" } : {}),
}))

export const MenuIconBreakpointSlider = styled(Slider)(() => ({
  width: "100%",
  color: COLORS.purple400,
  padding: "6px 0",
  "& .MuiSlider-rail": {
    height: 2,
    opacity: 1,
    backgroundColor: COLORS.purple100,
  },
  "& .MuiSlider-track": {
    height: 2,
    border: "none",
    backgroundColor: COLORS.purple400,
  },
  "& .MuiSlider-thumb": {
    width: 12,
    height: 12,
    backgroundColor: COLORS.white,
    border: `2px solid ${COLORS.purple400}`,
    transition: "none",
    "&::before, &::after": {
      display: "none",
    },
    "&:hover, &.Mui-focusVisible, &.Mui-active": {
      boxShadow: "none",
      transform: "translate(-50%, -50%) scale(1)",
    },
  },
  "@media (pointer: fine)": {
    "& .MuiSlider-thumb:hover": {
      boxShadow: "none",
      transform: "translate(-50%, -50%) scale(1)",
    },
  },
}))
