import { Box, Paper, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { COLORS } from "../../../../../theme/colors.ts"

export const SendToRoot = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
})

export const SendToHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
})

export const SendToLabel = styled(Typography)({
  fontSize: "12px",
  lineHeight: "14px",
  color: COLORS.gray700,
})

export const SendToAddButton = styled("button")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "20px",
  height: "20px",
  padding: 0,
  border: "none",
  borderRadius: "2px",
  backgroundColor: "transparent",
  cursor: "pointer",
  flexShrink: 0,
  "&:hover": {
    backgroundColor: COLORS.gray100,
  },
})

export const SendToContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  borderRadius: "4px",
  border: `1px solid ${COLORS.gray300}`,
  backgroundColor: COLORS.white,
  overflow: "hidden",
})

export const SendToRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "0 8px",
  minHeight: "32px",
  cursor: "pointer",
  "& + &": {
    borderTop: `1px solid ${COLORS.gray200}`,
  },
  "&:hover": {
    backgroundColor: COLORS.gray100,
  },
})

export const SendToRowIcon = styled(Box)({
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "16px",
  height: "16px",
})

export const SendToRowLabel = styled(Typography)({
  flex: 1,
  minWidth: 0,
  fontSize: "12px",
  lineHeight: "14px",
  fontWeight: 500,
  color: COLORS.gray900,
})

export const SendToRowDeleteButton = styled("button")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "20px",
  height: "20px",
  padding: 0,
  border: "none",
  borderRadius: "2px",
  backgroundColor: "transparent",
  cursor: "pointer",
  flexShrink: 0,
  opacity: 0.7,
  "&:hover": {
    opacity: 1,
    backgroundColor: COLORS.gray200,
  },
})

export const SendToMenuPaper = styled(Paper)({
  minWidth: "180px",
  padding: "4px 0",
  borderRadius: "4px",
  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
  backgroundColor: COLORS.white,
})

export const SendToMenuItem = styled("button", {
  shouldForwardProp: (prop) => prop !== "$disabled",
})<{ $disabled?: boolean }>(({ $disabled }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "100%",
  padding: "8px 12px",
  border: "none",
  backgroundColor: "transparent",
  cursor: $disabled ? "not-allowed" : "pointer",
  opacity: $disabled ? 0.45 : 1,
  textAlign: "left",
  fontFamily: "inherit",
  "&:hover": $disabled
    ? {}
    : {
        backgroundColor: COLORS.gray100,
      },
}))

export const SendToMenuItemLabel = styled(Typography)({
  fontSize: "12px",
  lineHeight: "14px",
  color: COLORS.gray900,
})

export const SendToConfigPaper = styled(Paper)({
  width: "220px",
  maxWidth: "min(220px, calc(100vw - 24px))",
  padding: "12px",
  borderRadius: "4px",
  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
  backgroundColor: COLORS.white,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  boxSizing: "border-box",
})

export const SendToConfigActionsRow = styled(Box)({
  display: "flex",
  justifyContent: "flex-end",
  width: "100%",
})

export const SendToSaveButton = styled("button")({
  padding: "6px 12px",
  borderRadius: "4px",
  border: "none",
  backgroundColor: COLORS.blue400,
  color: COLORS.white,
  fontSize: "12px",
  lineHeight: "14px",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
  "&:hover": {
    backgroundColor: COLORS.blue500,
  },
})
