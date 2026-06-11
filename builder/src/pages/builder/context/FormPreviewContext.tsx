import { useEditor, useNode } from "@craftjs/core"
import { createContext, useContext, type ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts"
import { readPreviewStateForWrapper } from "../../../craft/form/formPreviewState.ts"
import { DEFAULT_FORM_WRAPPER_SETTINGS, type FormState } from "../../../craft/form/formTypes.ts"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts"

const FormPreviewContext = createContext<FormState | null>(null)

export const FormPreviewProvider = ({
  state,
  children,
}: {
  state: FormState
  children: ReactNode
}) => (
  <FormPreviewContext.Provider value={state}>{children}</FormPreviewContext.Provider>
)

const isFormState = (value: unknown): value is FormState =>
  value === "normal" || value === "success" || value === "error"

const useFormPreviewStateFromAncestor = (): FormState => {
  const { id } = useNode()

  const { previewState } = useEditor((state, query) => {
    try {
      const ancestors = query.node(id).ancestors(true) as string[]
      for (const ancestorId of ancestors) {
        const ancestorNode = query.node(ancestorId).get()
        if (resolveNodeDisplayName(ancestorNode) === CRAFT_DISPLAY_NAME.FormWrapper) {
          return {
            previewState: readPreviewStateForWrapper(
              ancestorId,
              state.nodes as Parameters<typeof readPreviewStateForWrapper>[1],
            ),
          }
        }
      }
    } catch {
      // Craft query may be unavailable during early mount or drag
    }
    return { previewState: DEFAULT_FORM_WRAPPER_SETTINGS.previewState }
  })

  return previewState
}

export const useFormPreviewState = (): FormState => {
  const context = useContext(FormPreviewContext)
  const fromAncestor = useFormPreviewStateFromAncestor()
  return isFormState(context) ? context : fromAncestor
}
