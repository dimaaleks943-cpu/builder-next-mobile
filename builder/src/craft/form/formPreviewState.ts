import { CRAFT_DISPLAY_NAME } from "../craftDisplayNames.ts"
import { DEFAULT_FORM_WRAPPER_SETTINGS, type FormState } from "./formTypes.ts"

interface FormWrapperProps {
  previewState?: FormState
}

interface FormFormLegacyProps {
  state?: FormState
}

interface CraftNodeData {
  data?: {
    props?: FormWrapperProps & FormFormLegacyProps
    nodes?: string[]
    displayName?: string
  }
}

export const readPreviewStateForWrapper = (
  wrapperId: string,
  nodes: Record<string, CraftNodeData>,
): FormState => {
  const wrapperNode = nodes[wrapperId]
  const own = wrapperNode?.data?.props?.previewState
  if (own) {
    return own
  }

  for (const childId of (wrapperNode?.data?.nodes ?? []) as string[]) {
    const child = nodes[childId]
    if (child?.data?.displayName === CRAFT_DISPLAY_NAME.FormForm) {
      const legacyState = child.data.props?.state
      if (legacyState) {
        return legacyState
      }
    }
  }

  return DEFAULT_FORM_WRAPPER_SETTINGS.previewState
}
