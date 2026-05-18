import { Box, InputBase, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { COLORS } from "../../../../theme/colors.ts"

export const SelectorRoot = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginBottom: 4,
})

export const SelectorHeaderRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
})

export const SelectorLabel = styled(Typography)({
  fontSize: 11,
  fontWeight: 600,
  color: COLORS.gray700,
})

export const SelectorChevron = styled(Box)({
  display: "inline-flex",
  flexShrink: 0,
  pointerEvents: "none",
})

export const SelectorField = styled(Box)({
  display: "flex",
  alignItems: "center",
  minHeight: 32,
  borderRadius: 4,
  border: `1px solid ${COLORS.gray300}`,
  backgroundColor: COLORS.white,
  padding: "2px 8px",
  gap: 6,
  cursor: "pointer",
  width: "100%",
  boxSizing: "border-box",
})

export const ClassPillStack = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  width: "100%",
})

export const ClassPillRowRoot = styled(Box)({
  display: "flex",
  alignItems: "center",
  minHeight: 32,
  borderRadius: 4,
  border: `1px solid ${COLORS.gray300}`,
  backgroundColor: COLORS.white,
  padding: "2px 6px 2px 8px",
  gap: 4,
  width: "100%",
  boxSizing: "border-box",
  "&:hover .class-pill-chevron": {
    opacity: 1,
  },
})

export const ClassPill = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  flex: 1,
  minWidth: 0,
  padding: "2px 8px",
  borderRadius: 4,
  backgroundColor: COLORS.lightPurple,
  color: COLORS.purple400,
  fontSize: 12,
  fontWeight: 500,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
})

export const ClassPillEditing = styled(InputBase)({
  flex: 1,
  minWidth: 0,
  fontSize: 12,
  fontWeight: 500,
  padding: "2px 8px",
  borderRadius: 4,
  backgroundColor: COLORS.gray200,
  color: COLORS.gray900,
  "& .MuiInputBase-input": {
    padding: 0,
  },
})

export const ClassPillChevronButton = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: 24,
  height: 24,
  borderRadius: 4,
  cursor: "pointer",
  opacity: 0,
  transition: "opacity 0.15s ease",
  "&:hover": {
    backgroundColor: COLORS.gray100,
  },
})

export const PlaceholderText = styled(Typography)({
  fontSize: 12,
  color: COLORS.gray500,
  flex: 1,
})

export const UsageHint = styled(Typography)({
  fontSize: 10,
  lineHeight: "14px",
  color: COLORS.gray600,
})

export const MenuItemRow = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  width: "100%",
})
