import { Box, InputBase, Menu, MenuItem, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { COLORS } from "../../../../../../../../theme/colors.ts"

export const variablesMenuPaperSx = {
  borderRadius: "2px",
  marginTop: "4px",
  padding: "4px 0",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
  "& .MuiList-root": {
    padding: 0,
  },
} as const

export const CollectionRowRoot = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 4,
  minHeight: 32,
  padding: "4px 6px 4px 2px",
  borderRadius: 6,
  cursor: "pointer",
  userSelect: "none",
  "&:hover, &.collection-row-selected, &.collection-row-menu-open": {
    backgroundColor: COLORS.gray100,
  },
  "&:hover .collection-row-more-section, &.collection-row-menu-open .collection-row-more-section, &.collection-row-selected .collection-row-more-section":
    {
      opacity: 1,
      maxWidth: 28,
      pointerEvents: "auto",
    },
  "&.collection-row-selected .collection-row-chevron-section": {
    opacity: 1,
    maxWidth: 20,
    pointerEvents: "auto",
  },
  "&.collection-row-editing": {
    backgroundColor: COLORS.gray100,
  },
})

export const CollectionDragHandle = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 20,
  height: 20,
  flexShrink: 0,
  cursor: "grab",
  touchAction: "none",
  "&:active": {
    cursor: "grabbing",
  },
})

export const CollectionName = styled(Typography)({
  flex: 1,
  minWidth: 0,
  fontSize: 12,
  lineHeight: "16px",
  color: COLORS.black,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
})

export const CollectionNameEditing = styled(InputBase)({
  flex: 1,
  minWidth: 0,
  fontSize: 12,
  lineHeight: "16px",
  color: COLORS.black,
  "& .MuiInputBase-input": {
    padding: 0,
  },
})

export const CollectionMoreSection = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
  opacity: 0,
  maxWidth: 0,
  overflow: "hidden",
  pointerEvents: "none",
  transition: "opacity 0.15s ease, max-width 0.15s ease",
})

export const CollectionMoreButton = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  borderRadius: 4,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: COLORS.gray200,
  },
})

export const CollectionChevronSection = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  opacity: 0,
  maxWidth: 0,
  overflow: "hidden",
  pointerEvents: "none",
  transition: "opacity 0.15s ease, max-width 0.15s ease",
})

export const VariablesContextMenu = styled(Menu)({})

export const VariablesContextMenuItem = styled(MenuItem)({
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
