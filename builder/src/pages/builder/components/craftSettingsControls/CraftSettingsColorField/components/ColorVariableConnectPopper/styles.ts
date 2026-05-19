import { Box, Paper, styled, Typography } from "@mui/material";
import { COLORS } from "../../../../../../../theme/colors.ts";

export const ColorVariableConnectPopoverPaper = styled(Paper)(() => ({
  width: 280,
  maxHeight: 360,
  display: "flex",
  flexDirection: "column",
  border: `1px solid ${COLORS.purple100}`,
  borderRadius: "8px",
  overflow: "hidden",
  boxSizing: "border-box",
}))

export const ColorVariableConnectHeader = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 10px",
  borderBottom: `1px solid ${COLORS.gray200}`,
}))

export const ColorVariableConnectTitle = styled(Typography)(() => ({
  fontSize: 12,
  lineHeight: "16px",
  fontWeight: 700,
  color: COLORS.black,
}))

export const ColorVariableConnectSearch = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  padding: "8px 10px",
  borderBottom: `1px solid ${COLORS.gray200}`,
}))

export const ColorVariableConnectSearchInput = styled("input")(() => ({
  width: "100%",
  border: "none",
  outline: "none",
  backgroundColor: "transparent",
  fontSize: 11,
  lineHeight: "14px",
  color: COLORS.black,
  "&::placeholder": {
    color: COLORS.gray500,
  },
}))

export const ColorVariableConnectList = styled(Box)(() => ({
  flex: 1,
  overflowY: "auto",
  padding: "4px 0",
}))

export const ColorVariableConnectGroupTitle = styled(Typography)(() => ({
  padding: "6px 10px 4px",
  fontSize: 10,
  lineHeight: "14px",
  fontWeight: 600,
  color: COLORS.gray700,
}))

export const ColorVariableConnectItem = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: COLORS.gray100,
  },
}))

export const ColorVariableConnectItemSwatch = styled(Box)(() => ({
  width: 14,
  height: 14,
  borderRadius: 2,
  border: `1px solid ${COLORS.gray200}`,
  flexShrink: 0,
}))

export const ColorVariableConnectItemName = styled(Typography)(() => ({
  flex: 1,
  minWidth: 0,
  fontSize: 11,
  lineHeight: "14px",
  color: COLORS.black,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}))

export const ColorVariableConnectItemValue = styled(Typography)(() => ({
  flexShrink: 0,
  maxWidth: 120,
  fontSize: 10,
  lineHeight: "14px",
  color: COLORS.gray600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}))
