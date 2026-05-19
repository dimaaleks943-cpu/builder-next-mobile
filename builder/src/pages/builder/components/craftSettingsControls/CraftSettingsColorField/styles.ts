import { Box, styled, Typography } from "@mui/material";
import { ColorFieldInputShell } from "../styles.ts";
import { COLORS } from "../../../../../theme/colors.ts";

export const ColorFieldInputShellVariable = styled(ColorFieldInputShell)(() => ({
  backgroundColor: COLORS.purple400,
  borderColor: COLORS.purple400,
}))

export const ColorVariableConnectButton = styled(Box)(() => ({
  position: "absolute",
  top: -6,
  left: -6,
  width: 14,
  height: 14,
  borderRadius: "50%",
  backgroundColor: COLORS.purple400,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: 2,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.16)",
}))

export const ColorVariableConnectDot = styled(Box)(() => ({
  width: 4,
  height: 4,
  borderRadius: "50%",
  backgroundColor: COLORS.white,
}))

export const ColorFieldSwatch = styled(Box)(() => ({
  width: "12px",
  height: "12px",
  borderRadius: "2px",
  border: `1px solid ${COLORS.gray300}`,
  position: "relative",
  flexShrink: 0,
  cursor: "pointer",
  overflow: "hidden",
}))

export const ColorFieldTextInput = styled("input")(() => ({
  flex: 1,
  minWidth: 0,
  width: 0,
  boxSizing: "border-box",
  border: "none",
  outline: "none",
  padding: 0,
  fontSize: "12px",
  lineHeight: "14px",
  color: COLORS.black,
  backgroundColor: "transparent",
}))

export const ColorFieldVariableName = styled(Typography)(() => ({
  flex: 1,
  minWidth: 0,
  fontSize: "12px",
  lineHeight: "14px",
  color: COLORS.white,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}))
