import { getVariableById } from "./designVariablesRegistry"
import { isStyleVariableRef } from "./types"

export const resolveDesignVariableRefs = (
  style: Record<string, unknown>,
): Record<string, unknown> => {
  const resolved: Record<string, unknown> = { ...style }

  for (const [key, value] of Object.entries(resolved)) {
    if (!isStyleVariableRef(value)) continue

    const variable = getVariableById(value.$ref)
    if (!variable) continue

    if (
      variable.type === "color" ||
      variable.type === "size" ||
      variable.type === "fontFamily"
    ) {
      resolved[key] = variable.value
      continue
    }

    if (variable.type === "number") {
      resolved[key] = variable.value
    }
  }

  return resolved
}
