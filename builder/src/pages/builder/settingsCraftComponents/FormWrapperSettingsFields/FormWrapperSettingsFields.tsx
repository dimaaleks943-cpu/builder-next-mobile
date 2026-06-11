import type { ChangeEvent } from "react"
import { Box } from "@mui/material"
import { useEditor } from "@craftjs/core"
import { resolveNodeDisplayName } from "../../../../utils/resolveNodeDisplayName.ts"
import { CRAFT_DISPLAY_NAME } from "../../../../craft/craftDisplayNames.ts"
import type { FormState } from "../../../../craft/form/formTypes.ts"
import { useFormPreviewSession } from "../../context/FormPreviewContext.tsx"
import { CraftSettingsSelect } from "../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { SettingsAccordion } from "../components/SettingsAccordion/SettingsAccordion.tsx"

interface EditorSelection {
  selectedId: string | null
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
  const { getPreviewState, setPreviewState } = useFormPreviewSession()
  const { selectedId } = useEditor((state): EditorSelection => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null
    const displayName = node ? resolveNodeDisplayName(node) : null

    if (!id || displayName !== CRAFT_DISPLAY_NAME.FormWrapper || !node) {
      return { selectedId: null }
    }

    return { selectedId: id }
  })

  if (!selectedId) {
    return null
  }

  const previewState = getPreviewState(selectedId)

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <CraftSettingsSelect
        label="Preview state"
        value={previewState}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          setPreviewState(selectedId, event.target.value as FormState)
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
