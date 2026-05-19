import designVariablesMockJson from "../../../../../variables/designVariables.mock.json"
import type {
  DesignVariablesPayload,
  DesignVariablesResponse,
} from "../../../../../variables/types.ts"

export const fetchDesignVariablesMock = async (): Promise<DesignVariablesPayload> => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 150)
  })

  const response = designVariablesMockJson as DesignVariablesResponse
  return response.data
}
