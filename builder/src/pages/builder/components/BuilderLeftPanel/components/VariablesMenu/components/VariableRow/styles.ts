import { Box, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { COLORS } from "../../../../../../../../theme/colors.ts"

export const VariableRowRoot = styled(Box)({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  alignItems: "center",
  minHeight: 36,
  borderBottom: `1px solid ${COLORS.gray200}`,
  "&:hover": {
    backgroundColor: COLORS.gray100,
  },
})

export const VariableNameCell = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  minWidth: 0,
  padding: "8px 16px",
})

export const VariableValueCell = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  minWidth: 0,
  padding: "8px 16px",
  borderLeft: `1px solid ${COLORS.purple200}`,
})

export const VariableName = styled(Typography)({
  fontSize: 11,
  lineHeight: "14px",
  color: COLORS.black,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
})

export const VariableValue = styled(Typography)({
  fontSize: 11,
  lineHeight: "14px",
  color: COLORS.gray700,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
})

export const VariableTypeIcon = styled(Box)({
  width: 16,
  height: 16,
  borderRadius: 4,
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.purple100,
})

export const VariableTypeIconButton = styled(Box)({
  width: 16,
  height: 16,
  borderRadius: 4,
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.purple100,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: COLORS.purple200,
  },
})

export const VariableColorSwatch = styled(Box)({
  width: 16,
  height: 16,
  borderRadius: 2,
  flexShrink: 0,
  border: `1px solid ${COLORS.gray200}`,
})
