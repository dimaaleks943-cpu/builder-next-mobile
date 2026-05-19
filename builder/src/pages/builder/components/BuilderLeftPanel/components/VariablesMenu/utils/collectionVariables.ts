import type {
  DesignVariable,
  DesignVariableCollection,
} from "../../../../../variables/types.ts"

export const getCollectionVariables = (
  collection: DesignVariableCollection | undefined,
  variables: DesignVariable[],
): DesignVariable[] => {
  if (!collection) return []

  const byId = new Map(variables.map((variable) => [variable.id, variable]))

  return collection.variable_ids
    .map((id) => byId.get(id))
    .filter((variable): variable is DesignVariable => !!variable)
}

export const formatVariableValue = (variable: DesignVariable): string => {
  if (variable.type === "number") {
    return String(variable.value)
  }

  return variable.value
}

export const filterVariablesByQuery = (
  variables: DesignVariable[],
  query: string,
): DesignVariable[] => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return variables

  return variables.filter((variable) => {
    const value = formatVariableValue(variable).toLowerCase()
    return (
      variable.name.toLowerCase().includes(normalized) ||
      value.includes(normalized)
    )
  })
}
