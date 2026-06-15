import { Box, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { COLORS } from "../../../../../theme/colors.ts"

export const FieldsRoot = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
})

export const FieldsLabel = styled(Typography)({
  display: "block",
  fontSize: "12px",
  lineHeight: "14px",
  color: COLORS.gray700,
})

export const FieldsContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  borderRadius: "4px",
  border: `1px solid ${COLORS.gray300}`,
  backgroundColor: COLORS.white,
  overflow: "hidden",
})

export const FieldRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "0 8px",
  minHeight: "32px",
  "& + &": {
    borderTop: `1px solid ${COLORS.gray200}`,
  },
})

export const FieldIcon = styled(Box)({
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "16px",
  height: "16px",
  fontSize: "11px",
  lineHeight: 1,
  fontWeight: 600,
  color: COLORS.gray600,
})

export const FieldName = styled(Typography)({
  flex: 1,
  minWidth: 0,
  fontSize: "12px",
  lineHeight: "14px",
  fontWeight: 500,
  color: COLORS.gray900,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
})

export const FieldTypeLabel = styled(Typography)({
  flexShrink: 0,
  fontSize: "12px",
  lineHeight: "14px",
  color: COLORS.gray500,
})

export const EmptyFieldsText = styled(Typography)({
  padding: "8px 10px",
  fontSize: "12px",
  lineHeight: "14px",
  color: COLORS.gray500,
})
