import { styled } from "@mui/material/styles";
import { Box, IconButton, Typography } from "@mui/material";
import { COLORS } from "../../../../../../theme/colors.ts";

export const VariablesMenuHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 8px",
  gap: 8,
})

export const VariablesMenuTitle = styled(Typography)({
  color: COLORS.black,
  fontWeight: 700,
  fontSize: 14,
  lineHeight: "20px",
})

export const VariablesMenuAddButton = styled(IconButton)({
  width: 24,
  height: 24,
  padding: 0,
  borderRadius: 4,
  "&:hover": {
    backgroundColor: COLORS.gray100,
  },
})

export const CollectionList = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: "0 8px 8px",
  overflowY: "auto",
})

export const VariablesMenuLoading = styled(Typography)({
  padding: "8px",
  fontSize: 12,
  lineHeight: "16px",
  color: COLORS.gray600,
})

export const VariablesMenuShell = styled(Box)({
  height: "100%",
  display: "flex",
  flexDirection: "row",
})

export const VariablesMenuSidebar = styled(Box)({
  width: 280,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRight: `1px solid ${COLORS.gray200}`,
  backgroundColor: COLORS.white,
  flexShrink: 0,
})
