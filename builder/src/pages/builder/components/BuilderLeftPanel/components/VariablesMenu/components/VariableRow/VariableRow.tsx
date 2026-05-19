import { Box } from "@mui/material"
import { ColorPaletteIcon } from "../../../../../../../../icons/ColorPaletteIcon.tsx"
import { COLORS } from "../../../../../../../../theme/colors.ts"
import { formatVariableValue } from "../../utils/collectionVariables.ts"
import type { DesignVariable } from "../../../../../../variables/types.ts";
import {
  VariableColorSwatch,
  VariableName,
  VariableNameCell,
  VariableRowRoot,
  VariableTypeIcon, VariableValue,
  VariableValueCell
} from "./styles.ts";

interface Props {
  variable: DesignVariable
}

const VariableTypeBadge = ({ variable }: { variable: DesignVariable }) => {
  if (variable.type === "color") {
    return (
      <VariableTypeIcon>
        <ColorPaletteIcon size={12} fill={COLORS.purple400} />
      </VariableTypeIcon>
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

export const VariableRow = ({ variable }: Props) => {
  const value = formatVariableValue(variable)

  return (
    <VariableRowRoot>
      <VariableNameCell>
        <VariableTypeBadge variable={variable} />
        <VariableName title={variable.name}>{variable.name}</VariableName>
      </VariableNameCell>

      <VariableValueCell>
        {variable.type === "color" && (
          <VariableColorSwatch sx={{ backgroundColor: variable.value }} />
        )}
        <VariableValue title={value}>{value}</VariableValue>
      </VariableValueCell>
    </VariableRowRoot>
  )
}
