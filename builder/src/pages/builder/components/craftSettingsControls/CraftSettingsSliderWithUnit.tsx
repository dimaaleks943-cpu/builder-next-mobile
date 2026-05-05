import { Box, Slider } from "@mui/material"
import { COLORS } from "../../../../theme/colors.ts"
import {
  type CraftSizeMenuToken,
  parseSizeProp,
} from "../../../../utils/craftCssSizeProp.ts"
import { CraftSettingsValueWithUnit } from "./CraftSettingsValueWithUnit.tsx"

type Props = {
  value: unknown
  onCommit: (next: string | number | undefined) => void
  allowedUnits?: readonly CraftSizeMenuToken[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  disableUnitPopperPortal?: boolean
}

const getDefaultUnit = (allowedUnits: readonly CraftSizeMenuToken[]): CraftSizeMenuToken => {
  const firstNumericUnit = allowedUnits.find((unit) => unit !== "auto")
  return firstNumericUnit ?? "px"
}

const getSliderMidpoint = (min: number, max: number): number => (min + max) / 2

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value))
}

const toNumericString = (value: number): string => {
  if (Number.isInteger(value)) {
    return String(value)
  }
  return value.toFixed(2).replace(/\.?0+$/, "")
}

export const CraftSettingsSliderWithUnit = ({
  value,
  onCommit,
  allowedUnits = ["px", "auto"],
  min = -100,
  max = 100,
  step = 1,
  disabled = false,
  disableUnitPopperPortal = false,
}: Props) => {
  const midpoint = getSliderMidpoint(min, max)
  const defaultUnit = getDefaultUnit(allowedUnits)
  const parsed = parseSizeProp(value)

  const sliderValue = () => {
    if (parsed.kind === "auto") {
      return midpoint
    }
    if (parsed.kind === "length") {
      const asNumber = Number(parsed.n)
      return Number.isFinite(asNumber) ? clamp(asNumber, min, max) : midpoint
    }
    return midpoint
  }

  const handleSliderChange = (_: Event, nextValue: number | number[]) => {
    const rawValue = typeof nextValue === "number" ? nextValue : nextValue[0] ?? midpoint
    const clampedValue = clamp(rawValue, min, max)
    onCommit(`${toNumericString(clampedValue)}${defaultUnit}`)
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <Slider
        size="small"
        value={sliderValue()}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
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
      <Box sx={{ width: "90px", flexShrink: 0 }}>
        <CraftSettingsValueWithUnit
          label="Inset"
          withoutLabel
          value={value}
          onCommit={onCommit}
          allowedUnits={allowedUnits}
          inputWidth="100%"
          disabled={disabled}
          disableUnitPopperPortal={disableUnitPopperPortal}
        />
      </Box>
    </Box>
  )
}
