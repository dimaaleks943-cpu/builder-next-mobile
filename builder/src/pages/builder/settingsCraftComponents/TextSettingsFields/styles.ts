import { Box, styled, Typography } from "@mui/material"
import { COLORS } from "../../../../theme/colors.ts"

export const FieldsRoot = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: 8,
}))

export const TextRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
}))

export const TextInputShell = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  position: "relative",
  display: "flex",
  alignItems: "center",
  boxSizing: "border-box",
  padding: 4,
  borderRadius: 2,
  border: `1px solid ${COLORS.purple100}`,
  backgroundColor: COLORS.gray100,
  overflow: "visible",
  gap: 4,
}))

export const TextInputShellConnected = styled(TextInputShell)(() => ({
  backgroundColor: COLORS.purple400,
  borderColor: COLORS.purple400,
}))

export const CollectionFieldIconWrap = styled(Box)(() => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: 12,
  height: 12,
}))

export const CollectionFieldName = styled(Typography)(() => ({
  flex: 1,
  minWidth: 0,
  fontSize: 10,
  lineHeight: "14px",
  color: COLORS.white,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
})) as typeof Typography

export const TextInput = styled("input")(() => ({
  flex: 1,
  minWidth: 0,
  width: 0,
  boxSizing: "border-box",
  border: "none",
  outline: "none",
  padding: 0,
  fontSize: 10,
  lineHeight: "14px",
  color: COLORS.black,
  backgroundColor: "transparent",
  fontFamily: "inherit",
}))

export const ConnectBlock = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: 8,
}))

export const ConnectBlockTitle = styled(Typography)(() => ({
  fontSize: 10,
  lineHeight: "14px",
  fontWeight: 500,
  color: COLORS.gray700,
})) as typeof Typography

export const ConnectSearchShell = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  boxSizing: "border-box",
  padding: "4px 6px",
  borderRadius: 2,
  border: `1px solid ${COLORS.purple100}`,
  backgroundColor: COLORS.gray100,
}))

export const ConnectSearchIconArea = styled(Box)(() => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: 12,
  height: 12,
}))

export const ConnectSearchInput = styled("input")(() => ({
  flex: 1,
  minWidth: 0,
  border: "none",
  outline: "none",
  padding: 0,
  fontSize: 10,
  lineHeight: "14px",
  color: COLORS.black,
  backgroundColor: "transparent",
  fontFamily: "inherit",
  "&::placeholder": {
    color: COLORS.gray500,
  },
}))

export const ConnectSectionHeader = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
}))

export const ConnectSectionTitle = styled(Typography)(() => ({
  fontSize: 10,
  lineHeight: "14px",
  fontWeight: 500,
  color: COLORS.gray700,
})) as typeof Typography

export const ConnectFieldList = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: 4,
}))

export const ConnectFieldRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  cursor: "pointer",
  borderRadius: 2,
  padding: "2px 0",
  "&:hover": {
    backgroundColor: COLORS.gray100,
  },
}))

export const ConnectFieldIcon = styled(Box)(() => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: 12,
  height: 12,
}))

export const ConnectFieldLabel = styled(Typography)(() => ({
  flex: 1,
  minWidth: 0,
  fontSize: 10,
  lineHeight: "14px",
  fontWeight: 400,
  color: COLORS.gray700,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
})) as typeof Typography

export const ConnectEmptyMessage = styled(Typography)(() => ({
  fontSize: 10,
  lineHeight: "14px",
  fontWeight: 400,
  color: COLORS.gray500,
})) as typeof Typography

export const SearchIconSvg = styled("svg")(() => ({
  width: 12,
  height: 12,
  display: "block",
}))

export const ConnectButton = styled(Box)(() => ({
  position: "absolute",
  top: -5,
  left: -7,
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

export const ConnectDot = styled(Box)(() => ({
  width: 4,
  height: 4,
  borderRadius: "50%",
  backgroundColor: COLORS.white,
}))
