import type { ChangeEvent } from "react"
import { Box } from "@mui/material"
import { useEditor } from "@craftjs/core"
import { resolveNodeDisplayName } from "../../../../utils/resolveNodeDisplayName.ts"
import { CRAFT_DISPLAY_NAME } from "../../../../craft/craftDisplayNames.ts"
import { DEFAULT_FORM_SUBMIT_SETTINGS } from "../../../../craft/form/formTypes.ts"
import type { FormMethod } from "../../../../craft/form/formTypes.ts"
import { CraftSettingsInput } from "../../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsSelect } from "../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { SettingsAccordion } from "../components/SettingsAccordion/SettingsAccordion.tsx"

interface FormFormProps {
  name?: string
  redirect?: string
  action?: string
  method?: FormMethod
}

interface EditorSelection {
  targetId: string | null
  selectedProps: FormFormProps | null
}

interface Props {
  asAccordion?: boolean
  nodeId?: string
}

const FORM_METHOD_OPTIONS = [
  { id: "post", value: "POST" },
  { id: "get", value: "GET" },
]

/** Submit settings for FormForm (name, action, method, redirect). */
export const FormSettingsFields = ({ asAccordion, nodeId }: Props) => {
  const { actions } = useEditor()
  const { targetId, selectedProps } = useEditor((state): EditorSelection => {
    const id = nodeId ?? ((Array.from(state.events.selected)[0] as string | undefined) ?? null)
    const node = id ? state.nodes[id] : null
    const displayName = node ? resolveNodeDisplayName(node) : null

    if (displayName !== CRAFT_DISPLAY_NAME.FormForm || !node) {
      return { targetId: null, selectedProps: null }
    }

    const raw = node.data.props as FormFormProps | undefined

    return {
      targetId: id,
      selectedProps: raw ?? null,
    }
  })

  if (!targetId || !selectedProps) {
    return null
  }

  const setProp = (key: keyof FormFormProps, value: string) => {
    actions.setProp(targetId, (props: FormFormProps) => {
      (props as Record<string, unknown>)[key] = value
    })
  }

  const name = selectedProps.name ?? DEFAULT_FORM_SUBMIT_SETTINGS.name
  const redirect = selectedProps.redirect ?? DEFAULT_FORM_SUBMIT_SETTINGS.redirect
  const action = selectedProps.action ?? DEFAULT_FORM_SUBMIT_SETTINGS.action
  const method = selectedProps.method ?? DEFAULT_FORM_SUBMIT_SETTINGS.method

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <CraftSettingsInput
        label="Form name"
        value={name}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setProp("name", event.target.value)
        }
      />
      <CraftSettingsInput
        label="Action URL"
        value={action}
        placeholder="Platform default if empty"
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setProp("action", event.target.value)
        }
      />
      <CraftSettingsSelect
        label="Method"
        value={method}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          setProp("method", event.target.value)
        }
        options={FORM_METHOD_OPTIONS}
      />
      <CraftSettingsInput
        label="Redirect URL"
        value={redirect}
        placeholder="Optional after success"
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setProp("redirect", event.target.value)
        }
      />
    </Box>
  )

  return (
    <SettingsAccordion asAccordion={asAccordion} title="Form submit">
      {content}
    </SettingsAccordion>
  )
}
