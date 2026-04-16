import { Box, Slider, Typography } from "@mui/material"
import type { ChangeEvent } from "react"
import { COLORS } from "../../../../theme/colors.ts"

const clampPercent = (n: number) =>
  Math.min(100, Math.max(0, Number.isNaN(n) ? 0 : n))

type Props = {
  label: string
  value: number
  onChange: (value: number) => void
}

export const CraftSettingsPercentSliderRow = ({ label, value, onChange }: Props) => {
  const safe = clampPercent(value)

  const handleSliderChange = (_: Event, v: number | number[]) => {
    const next = typeof v === "number" ? v : v[0] ?? 0
    onChange(clampPercent(next))
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    onChange(clampPercent(next))
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        columnGap: "8px",
        boxSizing: "border-box",
      }}
    >
      <Typography
        sx={{
          minWidth: "48px",
          fontSize: "10px",
          lineHeight: "14px",
          color: COLORS.gray700,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Slider
        size="small"
        value={safe}
        min={0}
        max={100}
        step={1}
        onChange={handleSliderChange}
        sx={{
          flex: 1,
          minWidth: 0,
          color: COLORS.purple400,
          "& .MuiSlider-thumb": {
            width: 14,
            height: 14,
            transition: "none",
            "&::before, &::after": {
              display: "none",
            },
            "&:hover, &.Mui-focusVisible, &.Mui-active": {
              boxShadow: "none",
              // без увеличения «кружка» при hover / перетаскивании
              transform: "translate(-50%, -50%) scale(1)",
            },
          },
          "@media (pointer: fine)": {
            "& .MuiSlider-thumb:hover": {
              boxShadow: "none",
              transform: "translate(-50%, -50%) scale(1)",
            },
          },
        }}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          width: 56,
          boxSizing: "border-box",
          padding: "4px 6px",
          borderRadius: "4px",
          border: `1px solid ${COLORS.purple100}`,
          backgroundColor: COLORS.white,
          gap: "2px",
        }}
      >
        <Box
          component="input"
          type="number"
          value={safe}
          onChange={handleInputChange}
          sx={{
            flex: 1,
            minWidth: 0,
            width: 0,
            border: "none",
            outline: "none",
            padding: 0,
            fontSize: "12px",
            lineHeight: "14px",
            color: COLORS.black,
            textAlign: "right",
            MozAppearance: "textfield",
            "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
              margin: 0,
            },
          }}
        />
        <Typography
          component="span"
          sx={{
            fontSize: "12px",
            lineHeight: "14px",
            color: COLORS.gray700,
            flexShrink: 0,
          }}
        >
          %
        </Typography>
      </Box>
    </Box>
  )
}
