import { Box, InputBase, Menu, MenuItem, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { COLORS } from "../../../../theme/colors.ts"

export const styleSelectorMenuPaperSx = {
  borderRadius: "2px",
  marginTop: "4px",
  padding: "4px 0",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
  "& .MuiList-root": {
    padding: 0,
  },
} as const

export const StyleSelectorMenu = styled(Menu)({})

export const StyleSelectorMenuItem = styled(MenuItem)({
  fontSize: 10,
  lineHeight: "14px",
  letterSpacing: "0.015em",
  color: COLORS.black,
  minHeight: 24,
  padding: "4px 8px",
  gap: 4,
  "&.Mui-disabled": {
    opacity: 0.5,
    color: COLORS.gray600,
  },
})

export const StyleSelectorMenuItemMulti = styled(StyleSelectorMenuItem)({
  minHeight: "auto",
  alignItems: "flex-start",
  padding: "4px 8px",
})

export const SelectorRoot = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
})

export const SelectorLabel = styled(Typography)({
  fontSize: 11,
  fontWeight: 600,
  color: COLORS.gray700,
})

export const SelectorField = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  alignContent: "flex-start",
  gap: 4,
  minHeight: 28,
  borderRadius: 2,
  border: `1px solid ${COLORS.purple100}`,
  backgroundColor: COLORS.gray100,
  padding: 4,
  cursor: "pointer",
  width: "100%",
  boxSizing: "border-box",
})

export const SelectorFieldSpacer = styled(Box)({
  flex: 1,
  minWidth: 8,
  minHeight: 20,
})

export const SelectorChevron = styled(Box)({
  display: "inline-flex",
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  width: 16,
  height: 16,
  marginLeft: "auto",
  pointerEvents: "none",
})

export const ClassPillRowRoot = styled(Box)({
  display: "inline-flex",
  alignItems: "stretch",
  maxWidth: "100%",
  borderRadius: 2,
  backgroundColor: COLORS.purple100,
  overflow: "hidden",
  "&:hover .class-pill-chevron-section, &.class-pill-menu-open .class-pill-chevron-section":
    {
      opacity: 1,
      maxWidth: 32,
      pointerEvents: "auto",
    },
  "&.class-pill-editing": {
    backgroundColor: COLORS.gray700,
  },
})

export const ClassPill = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 4px",
  fontSize: 10,
  lineHeight: "14px",
  letterSpacing: "0.015em",
  fontWeight: 400,
  color: COLORS.black,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: "100%",
})

export const ClassPillEditing = styled(InputBase)({
  flex: 1,
  minWidth: 48,
  maxWidth: 200,
  fontSize: 10,
  lineHeight: "14px",
  padding: "2px 4px",
  color: COLORS.white,
  backgroundColor: "transparent",
  "& .MuiInputBase-input": {
    padding: 0,
    color: COLORS.white,
  },
})

export const ClassPillChevronSection = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
  opacity: 0,
  maxWidth: 0,
  overflow: "hidden",
  pointerEvents: "none",
  transition: "opacity 0.15s ease, max-width 0.15s ease",
})

export const ClassPillDivider = styled(Box)({
  width: 1,
  alignSelf: "stretch",
  margin: "3px 0",
  backgroundColor: "rgba(255, 255, 255, 0.5)",
})

export const ClassPillChevronButton = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 20,
  height: "100%",
  minHeight: 20,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: COLORS.purple200,
  },
})

export const PlaceholderText = styled(Typography)({
  fontSize: 10,
  lineHeight: "14px",
  color: COLORS.gray500,
  padding: "2px 4px",
})

export const UsageHint = styled(Typography)({
  fontSize: 10,
  lineHeight: "14px",
  color: COLORS.gray700,
})

export const MenuItemRow = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 2,
  width: "100%",
  minWidth: 0,
})

export const MenuItemPrimary = styled("span")({
  fontSize: 10,
  lineHeight: "14px",
  letterSpacing: "0.015em",
  color: COLORS.black,
})

export const MenuItemSecondary = styled(Typography)({
  fontSize: 10,
  lineHeight: "14px",
  color: COLORS.gray700,
})
