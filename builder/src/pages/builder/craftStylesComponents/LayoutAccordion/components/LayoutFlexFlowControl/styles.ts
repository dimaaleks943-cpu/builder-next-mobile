import { Box, ListSubheader, Menu, MenuItem, Typography, styled } from "@mui/material"
import { COLORS } from "../../../../../../theme/colors.ts"

export const LayoutFlexFlowRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  minWidth: 0,
}))

export const LayoutFlexFlowSegmented = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "stretch",
  justifyContent: "space-between",
  backgroundColor: COLORS.purple100,
  padding: "1px",
  minHeight: "22px",
}))

export const LayoutFlexFlowSegmentBtn = styled("button", {
  shouldForwardProp: (prop) => prop !== "$active",
})<{ $active: boolean }>(({ $active }) => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "2px",
  border: "none",
  cursor: "pointer",
  color: COLORS.purple400,
  backgroundColor: $active ? COLORS.white : COLORS.purple100,
  fontFamily: "inherit",
  padding: "2px 4px",
}))

export const LayoutFlexFlowMenuTrigger = styled("button", {
  shouldForwardProp: (prop) => prop !== "$active",
})<{ $active: boolean }>(({ $active }) => ({
  flex: "0 0 26px",
  minWidth: "26px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "2px",
  border: "none",
  cursor: "pointer",
  color: COLORS.purple400,
  backgroundColor: $active ? COLORS.white : COLORS.purple100,
  fontFamily: "inherit",
}))

export const LayoutFlexFlowIconSpin = styled(Box, {
  shouldForwardProp: (prop) => prop !== "$rotate",
})<{ $rotate?: number }>(({ $rotate }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 0,
  transform: `rotate(${String($rotate)}deg)`,
}))

export const LayoutFlexFlowMenu = styled(Menu)(() => ({
  "& .MuiPaper-root": {
    border: `1px solid ${COLORS.purple100}`,
    borderRadius: "8px",
    marginTop: "4px",
    minWidth: "240px",
    maxWidth: "min(320px, 100vw)",
  },
}))

export const LayoutFlexFlowMenuSection = styled(ListSubheader)(() => ({
  fontSize: "10px",
  lineHeight: "14px",
  fontWeight: 700,
  color: COLORS.gray800,
  padding: "8px 12px 4px",
  textTransform: "none",
}))

export const LayoutFlexFlowMenuItem = styled(MenuItem)(() => ({
  fontSize: "11px",
  lineHeight: "16px",
  color: COLORS.gray700,
  gap: "8px",
}))

export const LayoutFlexFlowMenuItemIcon = styled(Box)(() => ({
  flexShrink: 0,
  width: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}))

export const LayoutFlexFlowMenuFooter = styled(Typography)(() => ({
  fontSize: "10px",
  lineHeight: "14px",
  color: COLORS.gray600,
  padding: "8px 12px 10px",
  borderTop: `1px solid ${COLORS.purple100}`,
}))
