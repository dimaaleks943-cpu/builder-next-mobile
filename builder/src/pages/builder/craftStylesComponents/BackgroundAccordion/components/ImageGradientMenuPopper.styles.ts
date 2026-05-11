import { Box, Checkbox, Paper, TextField, Typography, styled } from "@mui/material"
import { COLORS } from "../../../../../theme/colors.ts"

export const ImageGradientMenuPaper = styled(Paper)(() => ({
  width: "211px",
  maxWidth: "min(211px, calc(100vw - 24px))",
  borderRadius: "4px",
  boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
  backgroundColor: COLORS.white,
  overflow: "hidden",
  padding: 0,
  boxSizing: "border-box",
}))

export const ImageGradientMenuSection = styled(Box)(() => ({
  padding: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  borderBottom: `1px solid ${COLORS.purple100}`,
}))

export const ImageGradientMenuSectionDense = styled(Box)(() => ({
  padding: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  borderBottom: `1px solid ${COLORS.purple100}`,
}))

export const ImageGradientMenuFooterSection = styled(Box)(() => ({
  padding: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
}))

export const MenuRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  alignSelf: "stretch",
  width: "100%",
}))

export const MenuRowSpread = styled(Box)(() => ({
  display: "flex",
  alignItems: "flex-start",
  gap: "6px",
  alignSelf: "stretch",
  width: "100%",
}))

export const MenuRowLabel = styled(Typography)(() => ({
  width: "46px",
  minWidth: "46px",
  flexShrink: 0,
  fontSize: "10px",
  lineHeight: "14px",
  letterSpacing: "0.015em",
  color: COLORS.gray700,
}))

export const ChooseImageButtonRow = styled(Box)(() => ({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  alignSelf: "stretch",
  width: "100%",
  paddingLeft: "52px",
  boxSizing: "border-box",
}))

export const ChooseImageTriggerButton = styled("button")(() => ({
  width: "143px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  padding: "4px",
  borderRadius: "2px",
  border: `1px solid ${COLORS.purple100}`,
  backgroundColor: COLORS.white,
  cursor: "pointer",
  fontFamily: "inherit",
  margin: 0,
  boxSizing: "border-box",
}))

export const ImageUrlEntryPaper = styled(Paper)(() => ({
  width: "200px",
  maxWidth: "min(200px, calc(100vw - 24px))",
  padding: "8px",
  borderRadius: "4px",
  boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
  backgroundColor: COLORS.white,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
}))

export const ImageUrlEntryActionsRow = styled(Box)(() => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: "6px",
  alignItems: "center",
  width: "100%",
}))

export const ImageUrlEntryButton = styled("button")(() => ({
  padding: "4px 8px",
  borderRadius: "2px",
  border: `1px solid ${COLORS.purple100}`,
  backgroundColor: COLORS.white,
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "10px",
  lineHeight: "14px",
  color: COLORS.black,
  margin: 0,
  boxSizing: "border-box",
}))

export const ImageUrlEntryPrimaryButton = styled(ImageUrlEntryButton)(() => ({
  backgroundColor: COLORS.purple400,
  borderColor: COLORS.purple400,
  color: COLORS.white,
}))

export const ImageUrlEntryField = styled(TextField)(() => ({
  width: "100%",
  "& .MuiInputBase-root": {
    fontSize: "10px",
    lineHeight: "14px",
    borderRadius: "2px",
  },
  "& .MuiInputBase-input": {
    padding: "6px 8px",
    color: COLORS.black,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: COLORS.purple100,
  },
}))

export const UnitFieldCaption = styled(Typography)(() => ({
  width: "53px",
  fontSize: "8px",
  lineHeight: "10px",
  letterSpacing: "0.0188em",
  color: COLORS.gray700,
  textAlign: "center",
}))

export const ImagePreviewFrame = styled(Box)(() => ({
  width: "50px",
  height: "50px",
  flexShrink: 0,
  borderRadius: "2px",
  border: `1px solid ${COLORS.purple100}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  position: "relative",
  boxSizing: "border-box",
  backgroundColor: COLORS.gray100,
}))

export const ImageTransparencyCheckerboard = styled(Box)(() => ({
  position: "absolute",
  inset: 0,
  backgroundColor: COLORS.white,
  backgroundImage: `
    linear-gradient(45deg, ${COLORS.gray200} 25%, transparent 25%),
    linear-gradient(-45deg, ${COLORS.gray200} 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, ${COLORS.gray200} 75%),
    linear-gradient(-45deg, transparent 75%, ${COLORS.gray200} 75%)
  `,
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
}))

export const ImageMetaColumn = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: "4px",
}))

export const PixelHintRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  alignSelf: "stretch",
}))

export const PixelDensityCheckbox = styled(Checkbox)(() => ({
  padding: "0 4px 0 0",
  color: COLORS.gray500,
  "&.Mui-checked": {
    color: COLORS.purple400,
  },
  "&.Mui-disabled": {
    color: COLORS.gray300,
  },
}))

export const PixelDensityLabel = styled("span")(() => ({
  flex: 1,
  fontSize: "10px",
  lineHeight: "14px",
  letterSpacing: "0.015em",
  color: COLORS.gray700,
  userSelect: "none",
}))

export const PositionBlock = styled(Box)(() => ({
  display: "flex",
  gap: "12px",
  alignSelf: "stretch",
  width: "100%",
}))

export const PositionGridFrame = styled(Box)(() => ({
  width: "50px",
  height: "50px",
  flexShrink: 0,
  borderRadius: "2px",
  border: `1px solid ${COLORS.purple100}`,
  position: "relative",
  boxSizing: "border-box",
  backgroundColor: COLORS.white,
}))

export const PositionNineGridLayout = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gridTemplateRows: "repeat(3, 1fr)",
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
}))

export const PositionNineGridCell = styled("button")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: 0,
  padding: 0,
  border: "none",
  backgroundColor: "transparent",
  cursor: "pointer",
  fontFamily: "inherit",
  boxSizing: "border-box",
  "&:focus-visible": {
    outline: `2px solid ${COLORS.purple400}`,
    outlineOffset: -2,
  },
}))

export const PositionNineGridDotShell = styled(Box)(() => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  pointerEvents: "none",
}))

export const PositionNineGridDiamondWrap = styled(Box)(() => ({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
}))

export const PositionNineGridDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "$selected",
})<{ $selected: boolean }>(({ $selected }) => ({
  width: "2px",
  height: "2px",
  borderRadius: "50%",
  flexShrink: 0,
  zIndex: 1,
  backgroundColor: $selected ? COLORS.purple400 : COLORS.purple200,
}))

export const PositionInputsColumn = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: "6px",
}))

export const InsetAxisRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  alignSelf: "stretch",
  width: "100%",
}))

export const InsetAxisLabel = styled(Typography)(() => ({
  width: "18px",
  minWidth: "18px",
  flexShrink: 0,
  fontSize: "10px",
  lineHeight: "14px",
  letterSpacing: "0.015em",
  color: COLORS.gray700,
}))
