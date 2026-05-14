import { Box, Button, IconButton, Typography, styled } from "@mui/material"
import { alpha } from "@mui/material/styles"
import { COLORS } from "../../../../theme/colors.ts"

export const GRID_MANUAL_ROW_RAIL_PX = 20
export const GRID_MANUAL_COL_HEADER_PX = 20
/** Полоса справа от превью сетки: кнопка «+ колонка» не участвует в ширине дорожек заголовка. */
export const GRID_MANUAL_ADD_COL_STRIP_PX = 28
/** Полоса снизу от превью: кнопка «+ ряд» не участвует в высоте бокового рельса рядов. */
export const GRID_MANUAL_ADD_ROW_STRIP_PX = 28
/** Минимальная ширина колонки `auto` только в оверлее ручной настройки грида (не пишется в стили блока). */
export const GRID_MANUAL_AUTO_COLUMN_MIN_PX = 75
/** Минимальная высота строки превью в оверлее (якорь на холсте может быть нулевой высоты при `auto` рядах). */
export const GRID_MANUAL_PREVIEW_ROW_MIN_PX = 75
/** Если у узла gap 0 / не задан — рисуем зазоры только в оверлее, в стили блока не пишем. */
export const GRID_MANUAL_OVERLAY_FALLBACK_GAP_PX = 8
/** Высота дорожки (px), ниже которой подпись «AUTO» не помещается — показываем «...». */
export const GRID_MANUAL_ROW_LABEL_MIN_HEIGHT_FOR_AUTO_PX = 56

export const OverlayGridManualDimmer = styled(Box)(() => ({
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(27, 29, 33, 0.45)",
  pointerEvents: "auto",
}))

export const OverlayGridManualRoot = styled(Box)(() => ({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  zIndex: 25,
}))

export const OverlayGridManualEditorChrome = styled(Box)(() => ({
  position: "absolute",
  pointerEvents: "none",
  display: "grid",
  gridTemplateColumns: `${GRID_MANUAL_ROW_RAIL_PX}px minmax(0, 1fr) ${GRID_MANUAL_ADD_COL_STRIP_PX}px`,
  gridTemplateRows: `${GRID_MANUAL_COL_HEADER_PX}px minmax(0, 1fr) ${GRID_MANUAL_ADD_ROW_STRIP_PX}px`,
  boxSizing: "border-box",
}))

export const OverlayGridManualCorner = styled(Box)(() => ({
  gridColumn: 1,
  gridRow: 1,
  pointerEvents: "none",
}))

export const OverlayGridManualColumnsHeader = styled(Box)(() => ({
  gridColumn: 2,
  gridRow: 1,
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  minWidth: 0,
  pointerEvents: "auto",
}))

/** Кнопка добавления колонки — отдельная колонка сетки, ширина заголовков = ширина превью. */
export const OverlayGridManualAddColumnAside = styled(Box)(() => ({
  gridColumn: 3,
  gridRow: 1,
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  justifyContent: "center",
  minWidth: 0,
  pointerEvents: "auto",
}))

export const OverlayGridManualRowsRail = styled(Box)(() => ({
  gridColumn: 1,
  gridRow: 2,
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  minHeight: 0,
  height: "100%",
  pointerEvents: "auto",
}))

/** Кнопка добавления ряда — отдельная строка сетки, высота рельса рядов = высота превью. */
export const OverlayGridManualAddRowAside = styled(Box)(() => ({
  gridColumn: 1,
  gridRow: 3,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 0,
  pointerEvents: "auto",
}))

export const OverlayGridManualGridPreview = styled(Box)(() => ({
  gridColumn: 2,
  gridRow: 2,
  alignSelf: "stretch",
  minWidth: 0,
  minHeight: 0,
  width: "100%",
  height: "100%",
  position: "relative",
  boxSizing: "border-box",
  pointerEvents: "auto",
}))

export const OverlayGridManualGridCell = styled(Box)(() => ({
  boxSizing: "border-box",
  minWidth: 0,
  minHeight: 0,
  border: `1px dashed ${COLORS.blue400}`,
  backgroundColor: alpha(COLORS.blue200, 0.45),
}))

export const OverlayGridManualColumnTrack = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  backgroundColor: COLORS.blue300,
  borderRadius: "4px 4px 0 0",
}))

export const OverlayGridManualColumnLabel = styled(Typography)(() => ({
  flex: 1,
  minWidth: 0,
  alignSelf: "center",
  textAlign: "center",
  fontSize: "10px",
  lineHeight: "14px",
  fontWeight: 500,
  letterSpacing: "0.04em",
  color: COLORS.white,
  fontFamily: "Inter, Arial, sans-serif",
}))

/** Дополнительные визуальные колонки `repeat(auto-fit, …)` — как в Webflow. */
export const OverlayGridManualColumnTrackGhost = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  borderRadius: "4px 4px 0 0",
  border: `1px dashed ${COLORS.blue400}`,
  boxSizing: "border-box",
}))

export const OverlayGridManualColumnLabelGhost = styled(Typography)(() => ({
  flex: 1,
  minWidth: 0,
  alignSelf: "center",
  textAlign: "center",
  fontSize: "10px",
  lineHeight: "14px",
  fontWeight: 500,
  letterSpacing: "0.04em",
  color: COLORS.blue400,
  fontFamily: "Inter, Arial, sans-serif",
}))

export const OverlayGridManualColumnLabelAutoFitPrimary = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  alignSelf: "center",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
}))

export const OverlayGridManualColumnAutoFitPrimaryCaption = styled(Typography)(() => ({
  flex: "0 0 auto",
  fontSize: "10px",
  lineHeight: "14px",
  fontWeight: 500,
  letterSpacing: "0.04em",
  color: COLORS.white,
  fontFamily: "Inter, Arial, sans-serif",
}))

export const OverlayGridManualAddColumnWrap = styled(Box)(() => ({
  flexShrink: 0,
  display: "flex",
  alignItems: "stretch",
  justifyContent: "center",
}))

export const OverlayGridManualRowTrack = styled(Box)(() => ({
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.blue300,
  borderRadius: "4px 0 0 4px",
  position: "relative",
}))

export const OverlayGridManualRowTrackGhost = styled(Box)(() => ({
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.white,
  borderRadius: "4px 0 0 4px",
  border: `1px dashed ${COLORS.blue400}`,
  boxSizing: "border-box",
  position: "relative",
}))

export const OverlayGridManualRowTrackGhostSingleRow = styled(OverlayGridManualRowTrackGhost)(() => ({
  flexShrink: 0,
  minHeight: `${GRID_MANUAL_ROW_LABEL_MIN_HEIGHT_FOR_AUTO_PX}px`,
  overflow: "visible",
}))

/** Один ряд: дорожка не сжимается ниже высоты подписи «AUTO», подпись не обрезается. */
export const OverlayGridManualRowTrackSingleRow = styled(OverlayGridManualRowTrack)(() => ({
  flexShrink: 0,
  minHeight: `${GRID_MANUAL_ROW_LABEL_MIN_HEIGHT_FOR_AUTO_PX}px`,
  overflow: "visible",
}))

export const OverlayGridManualRowLabel = styled(Typography)(() => ({
  writingMode: "vertical-rl",
  transform: "rotate(180deg)",
  fontSize: "10px",
  lineHeight: "14px",
  fontWeight: 500,
  letterSpacing: "0.06em",
  color: COLORS.white,
  fontFamily: "Inter, Arial, sans-serif",
  overflow: "hidden",
  maxHeight: "100%",
  flexShrink: 0,
}))

export const OverlayGridManualRowLabelFull = styled(OverlayGridManualRowLabel)(() => ({
  overflow: "visible",
  maxHeight: "none",
}))

export const OverlayGridManualRowLabelGhost = styled(Typography)(() => ({
  writingMode: "vertical-rl",
  transform: "rotate(180deg)",
  fontSize: "10px",
  lineHeight: "14px",
  fontWeight: 500,
  letterSpacing: "0.06em",
  color: COLORS.blue400,
  fontFamily: "Inter, Arial, sans-serif",
  overflow: "hidden",
  maxHeight: "100%",
  flexShrink: 0,
}))

export const OverlayGridManualRowLabelGhostFull = styled(OverlayGridManualRowLabelGhost)(() => ({
  overflow: "visible",
  maxHeight: "none",
}))

export const OverlayGridManualRowLabelAutoFitPrimary = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "3px",
  flexShrink: 0,
}))

export const OverlayGridManualAddRowWrap = styled(Box)(() => ({
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
}))

export const OverlayGridManualAddIconButton = styled(IconButton)(() => ({
  padding: "2px",
  borderRadius: "4px",
  backgroundColor: COLORS.blue300,
  color: COLORS.white,
  "&:hover": {
    backgroundColor: COLORS.blue300,
  },
}))

export const OverlayGridManualToolbar = styled(Box)(() => ({
  position: "absolute",
  left: "50%",
  bottom: "16px",
  transform: "translateX(-50%)",
  pointerEvents: "auto",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "12px",
  padding: "8px 12px",
  borderRadius: "8px",
  backgroundColor: COLORS.gray900,
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.25)",
}))

export const OverlayGridManualToolbarLeft = styled(Box)(() => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "8px",
}))

export const OverlayGridManualToolbarTitle = styled(Typography)(() => ({
  fontSize: "12px",
  lineHeight: "16px",
  color: COLORS.white,
  fontFamily: "Inter, Arial, sans-serif",
}))

export const OverlayGridManualDoneButton = styled(Button)(() => ({
  textTransform: "none",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "6px 14px",
  borderRadius: "6px",
  backgroundColor: COLORS.blue400,
  color: COLORS.white,
  fontFamily: "Inter, Arial, sans-serif",
  "&:hover": {
    backgroundColor: COLORS.blue500,
  },
}))

export const OverlayGridManualDoneAccent = styled(Box)(() => ({
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  border: `2px solid ${COLORS.white}`,
  backgroundColor: COLORS.blue400,
  flexShrink: 0,
}))

export const OverlayGridManualToolbarActions = styled(Box)(() => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "8px",
}))
