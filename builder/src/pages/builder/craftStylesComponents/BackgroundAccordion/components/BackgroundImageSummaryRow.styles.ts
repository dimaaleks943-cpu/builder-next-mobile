import { Box } from "@mui/material"
import { styled } from "@mui/material/styles"
import { COLORS } from "../../../../../theme/colors.ts"

export const BACKGROUND_IMAGE_ROW_ACTIONS_CLASS = "background-image-row-actions"

export const SummaryRowRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "popperOpen",
})<{ popperOpen?: boolean }>(({ popperOpen }) => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "6px 8px",
  borderRadius: "4px",
  cursor: "pointer",
  textAlign: "left",
  position: "relative",
  width: "100%",
  boxSizing: "border-box",

  "& .background-image-drag-handle": {
    cursor: "grab",
  },
  "& .background-image-drag-handle:active": {
    cursor: "grabbing",
  },
  transition: "border-color 0.15s ease, background-color 0.15s ease",
  ...(popperOpen
    ? {
      border: `1px solid ${COLORS.purple400}`,
      backgroundColor: COLORS.purple100,
    }
    : {
      border: `1px solid ${COLORS.gray300}`,
      backgroundColor: COLORS.gray100,
    }),
  "&:hover": {
    borderColor: COLORS.purple200,
  },
  [`&:hover .${BACKGROUND_IMAGE_ROW_ACTIONS_CLASS}`]: {
    opacity: 1,
  },
}))

export const DragHandleBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: COLORS.gray700,
  cursor: "grab",
  touchAction: "none",
  userSelect: "none",
  WebkitUserSelect: "none",
  "&:active": {
    cursor: "grabbing",
  },
  "& svg": {
    cursor: "grab",
    pointerEvents: "none",
    display: "block",
  },
}))

export const PreviewMediaRoot = styled(Box)(() => ({
  width: 10,
  height: 10,
  flexShrink: 0,
  borderRadius: "2px",
  border: `1px solid ${COLORS.gray300}`,
  overflow: "hidden",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
}))

export const PreviewImg = styled("img")(() => ({
  width: "100%",
  height: "100%",
  display: "block",
  objectFit: "cover",
}))

export const PreviewGradientBox = styled(PreviewMediaRoot)<{
  $backgroundImage: string
}>(({ $backgroundImage }) => ({
  backgroundImage: $backgroundImage,
}))

export const SummaryLabel = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  fontSize: "11px",
  lineHeight: "14px",
  color: COLORS.black,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  paddingRight: "52px",
}))

export const RowActionsBox = styled(Box)(() => ({
  position: "absolute",
  right: 6,
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  alignItems: "center",
  gap: "2px",
  opacity: 0,
  transition: "opacity 0.12s ease",
}))
