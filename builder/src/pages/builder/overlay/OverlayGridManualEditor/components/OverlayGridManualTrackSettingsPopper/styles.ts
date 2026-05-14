import { Box, Button, Paper, styled, Typography } from "@mui/material";
import { COLORS } from "../../../../../../theme/colors.ts";

export const OverlayGridManualTrackPopperPaper = styled(Paper)(() => ({
  pointerEvents: "auto",
  padding: "12px",
  minWidth: 272,
  maxWidth: 320,
  boxSizing: "border-box",
  borderRadius: "8px",
  backgroundColor: COLORS.white,
  border: `1px solid ${COLORS.purple100}`,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
}))

export const OverlayGridManualTrackPopperSpacedBlock = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  width: "100%",
}))

export const OverlayGridManualTrackPopperPlaceholder = styled(Typography)(() => ({
  fontSize: "10px",
  lineHeight: "14px",
  color: COLORS.gray500,
  fontFamily: "Inter, Arial, sans-serif",
}))

export const OverlayGridManualTrackPopperWarningBox = styled(Box)(() => ({
  borderRadius: "6px",
  padding: "2px",
  display: "grid",
  gridTemplateColumns: "20px 1fr",
  gap: "8px",
  alignItems: "flex-start",
  backgroundColor: COLORS.yellow100,
  border: `1px solid ${COLORS.yellow400}`,
  marginBottom: "6px",
}))

export const OverlayGridManualTrackPopperFooter = styled(Box)(() => ({
  paddingTop: "6px",
  borderTop: `1px solid ${COLORS.purple200}`,
  display: "flex",
  justifyContent: "flex-end",
}))

export const OverlayGridManualTrackPopperDeleteButton = styled(Button)(() => ({
  textTransform: "none",
  fontSize: "10px",
  lineHeight: "14px",
  padding: "6px 10px",
  borderRadius: "6px",
  gap: "6px",
  color: COLORS.white,
  border: `1px solid ${COLORS.purple400}`,
  backgroundColor: COLORS.purple400,
  fontFamily: "Inter, Arial, sans-serif",
  "&:hover": {
    backgroundColor: COLORS.gray700,
    borderColor: COLORS.gray600,
  },
}))
