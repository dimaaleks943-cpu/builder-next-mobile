import designVariablesMockJson from "./designVariables.mock.json"
import type {
  ColorVariable,
  DesignVariable,
  DesignVariableCollection,
  DesignVariablesResponse,
} from "./types.ts"

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

export const getColorVariablesByCollection = (): Array<{
  collection: DesignVariableCollection
  variables: ColorVariable[]
}> => {
  const colorById = new Map(
    getColorVariables().map((variable) => [variable.id, variable]),
  )

  return [...DESIGN_VARIABLE_COLLECTIONS]
    .sort((a, b) => a.sort - b.sort)
    .map((collection) => ({
      collection,
      variables: collection.variable_ids
        .map((id) => colorById.get(id))
        .filter((variable): variable is ColorVariable => !!variable),
    }))
    .filter((group) => group.variables.length > 0)
}
