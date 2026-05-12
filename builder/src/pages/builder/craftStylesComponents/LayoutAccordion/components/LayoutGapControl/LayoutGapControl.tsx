import { CraftSettingsSliderWithUnit } from "../../../../components/craftSettingsControls/CraftSettingsSliderWithUnit.tsx"
import { LayoutGapControlLabel, LayoutGapControlRow } from "./styles.ts"

interface Props {
  value: unknown
  onCommit: (next: string | number | undefined) => void
}

export const LayoutGapControl = ({ value, onCommit }: Props) => (
  <LayoutGapControlRow>
    <LayoutGapControlLabel>Gap</LayoutGapControlLabel>
    <CraftSettingsSliderWithUnit
      value={value}
      onCommit={onCommit}
      allowedUnits={["px"]}
      min={0}
      max={100}
      step={1}
    />
  </LayoutGapControlRow>
)
