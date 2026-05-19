import { Box, InputBase, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { COLORS } from "../../../../../../../../theme/colors.ts"

export const CollectionDetailRoot = styled(Box)({
  width: 520,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: COLORS.white,
  borderRight: `1px solid ${COLORS.gray200}`,
})

export const CollectionDetailHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "12px 16px",
  borderBottom: `1px solid ${COLORS.gray200}`,
})

export const CollectionDetailTitle = styled(Typography)({
  color: COLORS.black,
  fontWeight: 700,
  fontSize: 14,
  lineHeight: "20px",
  flexShrink: 0,
})

export const CollectionDetailHeaderActions = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  minWidth: 0,
  flex: 1,
  justifyContent: "flex-end",
})

export const CollectionDetailSearch = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
  minWidth: 0,
  flex: 1,
  maxWidth: 220,
  height: 28,
  padding: "0 8px",
  borderRadius: 4,
  border: `1px solid ${COLORS.gray200}`,
  backgroundColor: COLORS.gray100,
})

export const CollectionDetailSearchInput = styled(InputBase)({
  flex: 1,
  minWidth: 0,
  fontSize: 11,
  lineHeight: "14px",
  color: COLORS.black,
  "& .MuiInputBase-input": {
    padding: 0,
    "&::placeholder": {
      color: COLORS.gray500,
      opacity: 1,
    },
  },
})

export const AddVariableButton = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  flexShrink: 0,
  height: 28,
  padding: "0 10px",
  borderRadius: 4,
  backgroundColor: COLORS.purple400,
  color: COLORS.white,
  fontSize: 11,
  lineHeight: "14px",
  fontWeight: 600,
  cursor: "pointer",
  userSelect: "none",
  whiteSpace: "nowrap",
  "&:hover": {
    backgroundColor: COLORS.purple200,
    color: COLORS.black,
  },
})

export const VariablesTable = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "hidden",
})

export const VariablesTableHeader = styled(Box)({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  alignItems: "center",
  minHeight: 32,
  borderBottom: `1px solid ${COLORS.gray200}`,
  backgroundColor: COLORS.secondaryVeryLightGray,
})

export const VariablesTableHeaderCell = styled(Typography)({
  padding: "8px 16px",
  fontSize: 11,
  lineHeight: "14px",
  fontWeight: 600,
  color: COLORS.gray700,
  "& + &": {
    borderLeft: `1px solid ${COLORS.purple200}`,
  },
})

export const VariablesTableBody = styled(Box)({
  flex: 1,
  overflowY: "auto",
})

export const CollectionDetailEmpty = styled(Typography)({
  padding: "16px",
  fontSize: 12,
  lineHeight: "16px",
  color: COLORS.gray600,
})

export const VariablesTableEmpty = styled(Typography)({
  padding: "16px",
  fontSize: 12,
  lineHeight: "16px",
  color: COLORS.gray600,
})
