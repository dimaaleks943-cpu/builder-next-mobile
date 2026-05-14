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
  /**
   * Grid track sizing: `auto` / `min-content` / `max-content` pin the thumb to {@link min};
   * dragging always commits pixel lengths (switches off keyword sizing).
   */
  gridTrackKeywordSlidersAtMin?: boolean
}

const getDefaultUnit = (allowedUnits: readonly CraftSizeMenuToken[]): CraftSizeMenuToken => {
  const firstNumericUnit = allowedUnits.find(
    (unit) => unit !== "auto" && unit !== "min-content" && unit !== "max-content",
  )
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
  gridTrackKeywordSlidersAtMin = false,
}: Props) => {
  const midpoint = getSliderMidpoint(min, max)
  const defaultUnit = getDefaultUnit(allowedUnits)
  const parsed = parseSizeProp(value)

  const isGridKeywordTrack =
    gridTrackKeywordSlidersAtMin &&
    (parsed.kind === "auto" ||
      (parsed.kind === "raw" &&
        /^(min-content|max-content)$/i.test(parsed.text.trim())))

  const frQuarterStep =
    gridTrackKeywordSlidersAtMin &&
    parsed.kind === "length" &&
    parsed.unit === "fr"

  const resolvedSliderStep = frQuarterStep ? 0.25 : step

  const sliderValue = () => {
    if (parsed.kind === "auto" && !gridTrackKeywordSlidersAtMin) {
      return midpoint
    }
    if (isGridKeywordTrack) {
      return min
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
    const parsedNow = parseSizeProp(value)
    const keywordNow =
      gridTrackKeywordSlidersAtMin &&
      (parsedNow.kind === "auto" ||
        (parsedNow.kind === "raw" &&
          /^(min-content|max-content)$/i.test(parsedNow.text.trim())))
    const dragUnit: CraftSizeMenuToken = keywordNow
      ? "px"
      : parsedNow.kind === "length" && parsedNow.unit === "fr"
        ? "fr"
        : parsedNow.kind === "length" && parsedNow.unit === "px"
          ? "px"
          : defaultUnit
    const numericOut =
      dragUnit === "fr" ? Math.round(clampedValue * 4) / 4 : clampedValue
    onCommit(`${toNumericString(numericOut)}${dragUnit}`)
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flex: 1,
        minWidth: 0,
        width: "100%",
      }}
    >
      <Slider
        size="small"
        value={sliderValue()}
        min={min}
        max={max}
        step={resolvedSliderStep}
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
