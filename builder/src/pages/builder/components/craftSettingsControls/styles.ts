import { Box, Paper, Typography, styled } from "@mui/material"
import { COLORS } from "../../../../theme/colors.ts"

/** Fixed-width left label (48px) for craft settings rows */
export const CraftSettingsFixedLabel = styled(Typography)(() => ({
  width: "48px",
  minWidth: "48px",
  flexShrink: 0,
  fontSize: "10px",
  lineHeight: "14px",
  color: COLORS.gray700,
  textAlign: "left",
  letterSpacing: "normal",
})) as typeof Typography

/** Inline label that grows (e.g. select / value-with-unit row) */
export const CraftSettingsFluidLabel = styled(Typography)(() => ({
  fontSize: "10px",
  lineHeight: "14px",
  flex: 1,
})) as typeof Typography

/** Purple clickable label that opens the craft style reset popover */
export const CraftSettingsResetTriggerFixedLabel = styled(CraftSettingsFixedLabel)(() => ({
  color: COLORS.purple400,
  fontWeight: 400,
  cursor: "pointer",
})) as typeof Typography

/** Same as {@link CraftSettingsResetTriggerFixedLabel} for fluid-width rows */
export const CraftSettingsResetTriggerFluidLabel = styled(CraftSettingsFluidLabel)(() => ({
  color: COLORS.purple400,
  fontWeight: 400,
  cursor: "pointer",
})) as typeof Typography

/** Native button: matches {@link CraftSettingsFixedLabel} metrics without Typography `component` typing issues */
export const CraftSettingsResetToggleLabelButton = styled("button", {
  shouldForwardProp: (prop) => prop !== "$hasResettableValue",
})<{ $hasResettableValue: boolean }>(({ $hasResettableValue }) => ({
  width: "48px",
  minWidth: "48px",
  flexShrink: 0,
  fontSize: "10px",
  lineHeight: "14px",
  textAlign: "left",
  border: "none",
  backgroundColor: "transparent",
  padding: 0,
  margin: 0,
  fontFamily: "inherit",
  color: $hasResettableValue ? COLORS.purple400 : COLORS.gray700,
  cursor: $hasResettableValue ? "pointer" : "default",
  ...($hasResettableValue ? { "&:hover": { color: COLORS.purple400 } } : {}),
}))

export const CraftSettingsSelectShellInline = styled(Box)(() => ({
  flex: 4,
  position: "relative",
  display: "flex",
  alignItems: "center",
}))

export const CraftSettingsSelectShellFullRow = styled(Box)(() => ({
  flex: 1,
  width: "100%",
  minWidth: 0,
  position: "relative",
  display: "flex",
  alignItems: "center",
}))

export const CraftSettingsResetPopoverPaper = styled(Paper)(() => ({
  width: "211px",
  border: `1px solid ${COLORS.purple100}`,
  borderRadius: "8px",
  padding: "8px",
  boxSizing: "border-box",
}))

/** Zero-size absolute layer for CSS-border triangles on the flex-align overlay */
export const FlexAlignSpaceAroundArrow = styled(Box)(() => ({
  position: "absolute",
  width: 0,
  height: 0,
  padding: 0,
  margin: 0,
  lineHeight: 0,
}))
