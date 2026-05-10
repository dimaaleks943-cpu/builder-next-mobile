import { Box } from "@mui/material"
import { CraftSettingsResetLabelWithPopper } from "../../components/craftSettingsControls/CraftSettingsResetLabelWithPopper.tsx"
import { CraftSettingsSliderWithUnit } from "../../components/craftSettingsControls/CraftSettingsSliderWithUnit.tsx"
import {
  BOX_SHADOW_LENGTH_UNITS,
  commitLength,
} from "../EffectsAccordion/boxShadowUtils.ts"

interface Props {
  label: string
  value: string
  min: number
  max: number
  step?: number
  hasResetValue: boolean
  onReset: () => void
  onCommitLength: (next: string) => void
}

export const ShadowLengthSliderRowWithReset = ({
  label,
  value,
  min,
  max,
  step = 1,
  hasResetValue,
  onReset,
  onCommitLength,
}: Props) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      width: "100%",
      gap: "8px",
      boxSizing: "border-box",
    }}
  >
    <CraftSettingsResetLabelWithPopper
      kind="labelReset"
      label={label}
      variant="fixed"
      disableResetPopperPortal
      labelReset={{
        hasValue: hasResetValue,
        onReset,
      }}
    />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <CraftSettingsSliderWithUnit
        value={value}
        onCommit={(next) => onCommitLength(commitLength(next))}
        allowedUnits={BOX_SHADOW_LENGTH_UNITS}
        min={min}
        max={max}
        step={step}
        disableUnitPopperPortal
      />
    </Box>
  </Box>
)
