import type { ChangeEvent } from "react"
import { Box } from "@mui/material"
import { useEditor } from "@craftjs/core"
import { resolveNodeDisplayName } from "../../../../utils/resolveNodeDisplayName.ts"
import { CRAFT_DISPLAY_NAME } from "../../../../craft/craftDisplayNames.ts"
import { readPreviewStateForWrapper } from "../../../../craft/form/formPreviewState.ts"
import { DEFAULT_FORM_WRAPPER_SETTINGS } from "../../../../craft/form/formTypes.ts"
import type { FormState } from "../../../../craft/form/formTypes.ts"
import { CraftSettingsSelect } from "../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { SettingsAccordion } from "../components/SettingsAccordion/SettingsAccordion.tsx"

interface FormWrapperProps {
  previewState?: FormState
}

interface EditorSelection {
  selectedId: string | null
  previewState: FormState
}

interface Props {
  asAccordion?: boolean
}

const FORM_STATE_OPTIONS = [
  { id: "normal", value: "Normal" },
  { id: "success", value: "Success" },
  { id: "error", value: "Error" },
]

/** Builder-only preview switcher on FormWrapper. */
export const FormWrapperSettingsFields = ({ asAccordion }: Props) => {
  const { actions } = useEditor()
  const { selectedId, previewState } = useEditor((state): EditorSelection => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null
    const displayName = node ? resolveNodeDisplayName(node) : null

    if (!id || displayName !== CRAFT_DISPLAY_NAME.FormWrapper || !node) {
      return { selectedId: null, previewState: DEFAULT_FORM_WRAPPER_SETTINGS.previewState }
    }

    return {
      selectedId: id,
      previewState: readPreviewStateForWrapper(
        id,
        state.nodes as Parameters<typeof readPreviewStateForWrapper>[1],
      ),
    }
  })

  if (!selectedId) {
    return null
  }

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <CraftSettingsSelect
        label="Preview state"
        value={previewState}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          actions.setProp(selectedId, (props: FormWrapperProps) => {
            props.previewState = event.target.value as FormState
          })
        }}
        options={FORM_STATE_OPTIONS}
      />
    </Box>
  )

  return (
    <SettingsAccordion asAccordion={asAccordion} title="Form preview">
      {content}
    </SettingsAccordion>
  )
}
