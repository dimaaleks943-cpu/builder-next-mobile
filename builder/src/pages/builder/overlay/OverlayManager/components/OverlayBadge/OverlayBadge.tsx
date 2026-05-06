import { Box, IconButton, Typography } from "@mui/material"
import { SettingIcon } from "../../../../../../icons/SettingIcon.tsx"
import { COLORS } from "../../../../../../theme/colors.ts"
import { OVERLAY_BADGE_GAP_Y } from "../../../constants.ts"
import type { OverlayGeometry } from "../../../interface.ts"

const BADGE_HEIGHT = "18px";

interface Props {
  geometry: OverlayGeometry
  label: string
  showSettingsButton: boolean
  onSettingsClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const OverlayBadge = ({
  geometry,
  label,
  showSettingsButton,
  onSettingsClick,
}: Props) => {
  if (!geometry.isVisible) {
    return null
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top: geometry.top + 2,// + 2 что бы сесть прямо на бордер
        left: geometry.left,
        transform: "translateY(-100%)",
        maxWidth: Math.max(120, geometry.width),
        borderRadius: "4px 4px 0 0",
        backgroundColor: COLORS.purple400,
        color: COLORS.white,
        display: "flex",
        alignItems: "center",
        gap: OVERLAY_BADGE_GAP_Y,
        boxSizing: "border-box",
        pointerEvents: "auto",
        height: BADGE_HEIGHT
      }}
      onMouseDown={(event) => {
        event.stopPropagation()
      }}
    >
      <Typography
        component="span"
        noWrap
        sx={{
          minWidth: 0,
          fontSize: 10,
          lineHeight: "14px",
          fontFamily: "Inter, Arial, sans-serif",
          color: COLORS.white,
          padding: "2px 4px",
        }}
      >
        {label}
      </Typography>
      {showSettingsButton ? (
        <Box display="flex">
          <Box sx={{
            display: "flex",
            borderLeft: `1px solid ${COLORS.white}`,
            boxSizing: "border-box",
            height: BADGE_HEIGHT
          }}/>

          <IconButton
            type="button"
            size="small"
            aria-label="Настройки"
            onMouseDown={(event) => {
              event.stopPropagation()
              event.preventDefault()
            }}
            onClick={(event) => {
              event.stopPropagation()
              event.preventDefault()
              onSettingsClick(event)
            }}
            sx={{ color: COLORS.white, padding: "2px 4px" }}
          >
            <SettingIcon size={12} fill={COLORS.white}/>
          </IconButton>
        </Box>
      ) : null}
    </Box>
  )
}
