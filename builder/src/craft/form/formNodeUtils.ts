import { CRAFT_DISPLAY_NAME } from "../craftDisplayNames.ts"

interface CraftNodeData {
  data?: {
    nodes?: string[]
    displayName?: string
  }
}

/** Direct child FormForm id under FormWrapper, if present. */
export const findFormFormChildId = (
  wrapperId: string,
  nodes: Record<string, CraftNodeData>,
): string | null => {
  const wrapperNode = nodes[wrapperId]

  for (const childId of (wrapperNode?.data?.nodes ?? []) as string[]) {
    const child = nodes[childId]
    if (child?.data?.displayName === CRAFT_DISPLAY_NAME.FormForm) {
      return childId
    }
  }

  return null
}
