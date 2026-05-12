import { Box, Menu, MenuItem, styled } from "@mui/material"
import { COLORS } from "../../../../../../theme/colors.ts"

export const LayoutDisplayRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  minWidth: 0,
}))

export const LayoutDisplaySegmented = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "stretch",
  justifyContent: "space-between",
  backgroundColor: COLORS.purple100,
  padding: "1px",
  minHeight: "22px",
}))

export const LayoutDisplaySegmentBtn = styled("button", {
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
  fontSize: "10px",
  lineHeight: "14px",
  color: COLORS.purple400,
  backgroundColor: $active ? COLORS.white : COLORS.purple100,
  fontFamily: "inherit",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
}))

export const LayoutDisplayInlineTrigger = styled("button", {
  shouldForwardProp: (prop) => prop !== "$active",
})<{ $active: boolean }>(({ $active }) => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "2px",
  borderRadius: "2px",
  border: "none",
  cursor: "pointer",
  fontSize: "10px",
  lineHeight: "14px",
  color: COLORS.purple400,
  backgroundColor: $active ? COLORS.white : COLORS.purple100,
  fontFamily: "inherit",
  overflow: "hidden",
  paddingInline: "2px",
}))

/** Подпись внутри триггера: одна строка, без вылезания за кнопку при узкой колонке. */
export const LayoutDisplayInlineTriggerLabel = styled("span")(() => ({
  minWidth: 0,
  flex: "1 1 0",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  textAlign: "center",
}))

export const LayoutDisplayInlineTriggerChevron = styled("span")(() => ({
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
  transform: "rotate(90deg)",
  pointerEvents: "none",
}))

export const LayoutDisplayMenu = styled(Menu)(() => ({
  "& .MuiPaper-root": {
    border: `1px solid ${COLORS.purple100}`,
    borderRadius: "8px",
    marginTop: "4px",
    minWidth: "140px",
  },
}))

export const LayoutDisplayMenuItem = styled(MenuItem)(() => ({
  fontSize: "11px",
  lineHeight: "16px",
  color: COLORS.gray700,
}))
