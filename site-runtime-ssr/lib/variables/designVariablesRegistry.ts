import designVariablesMockJson from "./designVariables.mock.json"
import type {
  ColorVariable,
  DesignVariable,
  DesignVariableCollection,
  DesignVariablesResponse,
} from "./types"

const payload = (designVariablesMockJson as DesignVariablesResponse).data

export const DESIGN_VARIABLE_COLLECTIONS: DesignVariableCollection[] =
  payload.collections

export const DESIGN_VARIABLES: DesignVariable[] = payload.variables

export const getColorVariables = (): ColorVariable[] =>
  DESIGN_VARIABLES.filter(
    (variable): variable is ColorVariable => variable.type === "color",
  )

export const getVariableById = (id: string): DesignVariable | undefined =>
  DESIGN_VARIABLES.find((variable) => variable.id === id)

export const getColorVariableById = (id: string): ColorVariable | undefined => {
  const variable = getVariableById(id)
  return variable?.type === "color" ? variable : undefined
}
