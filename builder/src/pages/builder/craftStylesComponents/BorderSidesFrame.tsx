import { Box } from "@mui/material"
import { COLORS } from "../../../theme/colors.ts"
import { BorderIcon } from "../../../icons/BorderIcon.tsx"
import { BorderUpIcon } from "../../../icons/BorderUpIcon.tsx"

export type BorderSide = "top" | "right" | "bottom" | "left"

export type BorderSidesSelection = "all" | BorderSide[]

const hitSize = 16
const gap = 6

const sideRotation: Record<BorderSide, number> = {
  top: 0,
  right: 90,
  bottom: 180,
  left: 270,
}

const iconSize = 16

type FrameProps = {
  activeSides: BorderSidesSelection
  isSideActive: (side: BorderSide) => boolean
  onToggleSide: (side: BorderSide) => void
  onToggleAllSides: () => void
}

const hitButtonSx = {
  width: hitSize,
  height: hitSize,
  boxSizing: "border-box" as const,
  borderRadius: "4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  border: "none",
  padding: 0,
  background: "none",
  "&:focus-visible": {
    outline: `2px solid ${COLORS.purple400}`,
    outlineOffset: 1,
  },
}

export const BorderSidesFrame = ({
  activeSides,
  isSideActive,
  onToggleSide,
  onToggleAllSides,
}: FrameProps) => {
  const allActive = activeSides === "all"

  const sideCell = (side: BorderSide) => {
    const on = isSideActive(side)
    return (
      <Box
        key={side}
        component="button"
        type="button"
        aria-pressed={on}
        onClick={() => onToggleSide(side)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onToggleSide(side)
          }
        }}
        sx={{
          ...hitButtonSx,
          backgroundColor: on ? COLORS.purple100 : "transparent",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `rotate(${sideRotation[side]}deg)`,
          }}
        >
          <BorderUpIcon
            size={iconSize}
            fill={on ? COLORS.purple400 : COLORS.purple200}
          />
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: `${gap}px`,
        flexShrink: 0,
      }}
    >
      {sideCell("top")}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: `${gap}px`,
        }}
      >
        {sideCell("left")}
        <Box
          component="button"
          type="button"
          aria-pressed={allActive}
          onClick={onToggleAllSides}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onToggleAllSides()
            }
          }}
          sx={{
            ...hitButtonSx,
            backgroundColor: allActive ? COLORS.purple100 : "transparent",
          }}
        >
          <BorderIcon
            size={iconSize}
            fill={allActive ? COLORS.purple400 : COLORS.purple200}
          />
        </Box>
        {sideCell("right")}
      </Box>
      {sideCell("bottom")}
    </Box>
  )
}
