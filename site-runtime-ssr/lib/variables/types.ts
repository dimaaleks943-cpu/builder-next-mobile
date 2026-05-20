export type DesignVariableType = "color" | "size" | "fontFamily" | "number"

export type DesignVariableBase = {
  id: string
  name: string
  slug: string
  collection_id: string
  sort: number
  created_at: string
  updated_at: string
}

export type ColorVariable = DesignVariableBase & {
  type: "color"
  value: string
}

export type SizeVariable = DesignVariableBase & {
  type: "size"
  value: string
}

export type FontFamilyVariable = DesignVariableBase & {
  type: "fontFamily"
  value: string
}

export type NumberVariable = DesignVariableBase & {
  type: "number"
  value: number
}

export type DesignVariable =
  | ColorVariable
  | SizeVariable
  | FontFamilyVariable
  | NumberVariable

export type DesignVariableCollection = {
  id: string
  name: string
  sort: number
  variable_ids: string[]
}

export type DesignVariablesPayload = {
  site_id: number
  version: number
  collections: DesignVariableCollection[]
  variables: DesignVariable[]
  updated_at: string
}

export type DesignVariablesResponse = {
  data: DesignVariablesPayload
  links: unknown | null
}

export type StyleVariableRef = {
  $ref: string
}

export const isStyleVariableRef = (
  value: unknown,
): value is StyleVariableRef =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  typeof (value as StyleVariableRef).$ref === "string" &&
  (value as StyleVariableRef).$ref.length > 0
