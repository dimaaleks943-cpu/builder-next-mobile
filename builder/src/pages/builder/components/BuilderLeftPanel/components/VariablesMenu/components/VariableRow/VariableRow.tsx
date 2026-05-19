import { Box } from "@mui/material"
import { useState, type MouseEvent } from "react"
import { ColorPaletteIcon } from "../../../../../../../../icons/ColorPaletteIcon.tsx"
import { COLORS } from "../../../../../../../../theme/colors.ts"
import type { ColorVariable, DesignVariable } from "../../../../../../variables/types.ts"
import { formatVariableValue } from "../../utils/collectionVariables.ts"
import { VariableColorPickerPopper } from "../VariableColorPickerPopper/VariableColorPickerPopper.tsx"
import {
  VariableColorSwatch,
  VariableName,
  VariableNameCell,
  VariableRowRoot,
  VariableTypeIcon,
  VariableTypeIconButton,
  VariableValue,
  VariableValueCell,
} from "./styles.ts"

interface Props {
  variable: DesignVariable
  pickerZIndex: number
  onColorChange: (variableId: string, value: string) => void
}

interface VariableTypeBadgeProps {
  variable: DesignVariable
  pickerZIndex: number
  onColorChange: (variableId: string, value: string) => void
}

const VariableTypeBadge = ({
  variable,
}: VariableTypeBadgeProps) => {
  if (variable.type === "color") {
    return (
      <>
        <VariableTypeIconButton role="button" tabIndex={0}>
          <ColorPaletteIcon size={12} fill={COLORS.purple400} />
        </VariableTypeIconButton>
      </>
    )
  }

  const label =
    variable.type === "size"
      ? "S"
      : variable.type === "fontFamily"
        ? "T"
        : "#"

  return (
    <VariableTypeIcon>
      <Box
        component="span"
        sx={{
          fontSize: 9,
          lineHeight: "12px",
          color: COLORS.purple400,
          fontWeight: 600,
        }}
      >
        {label}
      </Box>
    </VariableTypeIcon>
  )
}

export const VariableRow = ({
  variable,
  pickerZIndex,
  onColorChange,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const isPickerOpen = Boolean(anchorEl)

  const handleClosePicker = () => {
    setAnchorEl(null)
  }

  const handleOpenPicker = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl((current) =>
      current === event.currentTarget ? null : event.currentTarget,
    )
  }
  const value = formatVariableValue(variable)
  const colorVariable = variable.type === "color" ? (variable as ColorVariable) : null

  return (
    <VariableRowRoot>
      <VariableNameCell>
        <VariableTypeBadge
          variable={variable}
          pickerZIndex={pickerZIndex}
          onColorChange={onColorChange}
        />
        <VariableName title={variable.name}>{variable.name}</VariableName>
      </VariableNameCell>

      <VariableValueCell>
        {colorVariable && (
          <VariableColorSwatch sx={{ backgroundColor: colorVariable.value }}     onMouseDown={handleOpenPicker} />
        )}
        <VariableValue title={value}>{value}</VariableValue>
      </VariableValueCell>

      <VariableColorPickerPopper
        anchorEl={anchorEl}
        open={isPickerOpen}
        value={variable.value as string}
        zIndex={pickerZIndex}
        onChange={(value) => onColorChange(variable.id, value)}
        onClose={handleClosePicker}
      />
    </VariableRowRoot>
  )
}
