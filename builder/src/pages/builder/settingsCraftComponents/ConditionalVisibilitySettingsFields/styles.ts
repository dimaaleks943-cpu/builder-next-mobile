import { Box, Typography, styled } from "@mui/material"
import { COLORS } from "../../../../theme/colors.ts"

export const Root = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: 8,
}))

export const Section = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: "8px 10px",
  borderRadius: 4,
  border: `1px solid ${COLORS.gray200}`,
  backgroundColor: COLORS.gray100,
}))

export const Row = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
}))

export const Column = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: 8,
  width: "100%",
}))

export const GroupHeader = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
}))

export const GroupTitle = styled(Typography)(() => ({
  fontSize: 11,
  fontWeight: 600,
  lineHeight: "14px",
  color: COLORS.gray700,
})) as typeof Typography

export const ActionButton = styled("button")(() => ({
  border: `1px solid ${COLORS.purple200}`,
  borderRadius: 4,
  backgroundColor: COLORS.white,
  color: COLORS.purple400,
  fontSize: 10,
  lineHeight: "14px",
  cursor: "pointer",
  padding: "4px 8px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
}))

export const DangerButton = styled(ActionButton)(() => ({
  borderColor: COLORS.red100,
  color: COLORS.red300,
}))

export const Hint = styled(Typography)(() => ({
  fontSize: 10,
  lineHeight: "14px",
  color: COLORS.gray600,
})) as typeof Typography
