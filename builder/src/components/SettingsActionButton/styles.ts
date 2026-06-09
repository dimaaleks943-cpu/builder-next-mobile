import { styled } from "@mui/material"
import { COLORS } from "../../theme/colors.ts"

export const ActionButton = styled("button")(() => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  backgroundColor: COLORS.purple100,
  borderRadius: 2,
  padding: 4,
  fontSize: 10,
  lineHeight: "14px",
  fontWeight: 400,
  color: COLORS.black,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  boxSizing: "border-box",
  "&:disabled": {
    cursor: "not-allowed",
    opacity: 0.5,
  },
}))
