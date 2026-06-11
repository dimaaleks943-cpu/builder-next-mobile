import type { ChangeEvent } from "react"
import { Box, Checkbox, FormControlLabel } from "@mui/material"
import { useEditor } from "@craftjs/core"
import { resolveNodeDisplayName } from "../../../../utils/resolveNodeDisplayName.ts"
import { CRAFT_DISPLAY_NAME } from "../../../../craft/craftDisplayNames.ts"
import { DEFAULT_FORM_FIELD_PROPS } from "../../../../craft/form/formTypes.ts"
import { FORM_BLOCK_LABEL_DEFAULT_PROPS } from "../../../../craft/form/formDefaults.ts"
import { FORM_BUTTON_DEFAULT_PROPS } from "../../../../craft/form/formDefaults.ts"
import type { FormTextInputType } from "../../../../craft/form/formTypes.ts"
import { CraftSettingsInput } from "../../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsSelect } from "../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { SettingsAccordion } from "../components/SettingsAccordion/SettingsAccordion.tsx"

type FieldSettingsKind =
  | "FormTextInput"
  | "FormTextarea"
  | "FormBlockLabel"
  | "FormButton"

interface FieldProps {
  name?: string
  required?: boolean
  placeholder?: string
  autofocus?: boolean
  inputType?: FormTextInputType
  text?: string
  loadingText?: string
}

interface EditorSelection {
  targetId: string | null
  kind: FieldSettingsKind | null
  selectedProps: FieldProps | null
}

interface Props {
  asAccordion?: boolean
  nodeId?: string
}

const INPUT_TYPE_OPTIONS = [
  { id: "text", value: "Text" },
  { id: "email", value: "Email" },
  { id: "tel", value: "Phone" },
  { id: "password", value: "Password" },
  { id: "number", value: "Number" },
  { id: "url", value: "URL" },
]

const resolveFieldKind = (displayName: string | null): FieldSettingsKind | null => {
  if (displayName === CRAFT_DISPLAY_NAME.FormTextInput) return "FormTextInput"
  if (displayName === CRAFT_DISPLAY_NAME.FormTextarea) return "FormTextarea"
  if (displayName === CRAFT_DISPLAY_NAME.FormBlockLabel) return "FormBlockLabel"
  if (displayName === CRAFT_DISPLAY_NAME.FormButton) return "FormButton"
  return null
}

/** Settings tab fields for form inputs, labels and submit button. */
export const FormFieldSettingsFields = ({ asAccordion, nodeId }: Props) => {
  const { actions } = useEditor()
  const { targetId, kind, selectedProps } = useEditor(
    (state): EditorSelection => {
      const id = nodeId ?? ((Array.from(state.events.selected)[0] as string | undefined) ?? null)
      const node = id ? state.nodes[id] : null
      const displayName = node ? resolveNodeDisplayName(node) : null
      const fieldKind = resolveFieldKind(displayName)

      if (!fieldKind || !node) {
        return { targetId: null, kind: null, selectedProps: null }
      }

      return {
        targetId: id,
        kind: fieldKind,
        selectedProps: (node.data.props as FieldProps) ?? null,
      }
    },
  )

  if (!targetId || !kind || !selectedProps) {
    return null
  }

  const setProp = <K extends keyof FieldProps>(key: K, value: FieldProps[K]) => {
    actions.setProp(targetId, (props: FieldProps) => {
      props[key] = value
    })
  }

  const isLabel = kind === "FormBlockLabel"
  const isButton = kind === "FormButton"
  const isInput = kind === "FormTextInput" || kind === "FormTextarea"

  const name = selectedProps.name ?? DEFAULT_FORM_FIELD_PROPS.name
  const required = selectedProps.required ?? DEFAULT_FORM_FIELD_PROPS.required
  const placeholder = selectedProps.placeholder ?? DEFAULT_FORM_FIELD_PROPS.placeholder
  const autofocus = selectedProps.autofocus ?? DEFAULT_FORM_FIELD_PROPS.autofocus
  const inputType = selectedProps.inputType ?? "text"
  const labelText = selectedProps.text ?? FORM_BLOCK_LABEL_DEFAULT_PROPS.text
  const buttonText = selectedProps.text ?? FORM_BUTTON_DEFAULT_PROPS.text
  const loadingText = selectedProps.loadingText ?? FORM_BUTTON_DEFAULT_PROPS.loadingText

  const title =
    kind === "FormBlockLabel"
      ? "Field label"
      : kind === "FormButton"
        ? "Submit button"
        : kind === "FormTextarea"
          ? "Textarea"
          : "Text input"

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {isLabel && (
        <CraftSettingsInput
          label="Label text"
          value={labelText}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setProp("text", event.target.value)
          }
        />
      )}

      {isButton && (
        <>
          <CraftSettingsInput
            label="Button text"
            value={buttonText}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setProp("text", event.target.value)
            }
          />
          <CraftSettingsInput
            label="Loading text"
            value={loadingText}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setProp("loadingText", event.target.value)
            }
          />
        </>
      )}

      {isInput && (
        <>
          <CraftSettingsInput
            label="Field name"
            value={name}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setProp("name", event.target.value)
            }
          />
          <CraftSettingsInput
            label="Placeholder"
            value={placeholder}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setProp("placeholder", event.target.value)
            }
          />
          {kind === "FormTextInput" && (
            <CraftSettingsSelect
              label="Input type"
              value={inputType}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                setProp("inputType", event.target.value as FormTextInputType)
              }
              options={INPUT_TYPE_OPTIONS}
            />
          )}
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={required}
                onChange={(_event, checked) => setProp("required", checked)}
              />
            }
            label="Required"
            sx={{ marginLeft: 0 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={autofocus}
                onChange={(_event, checked) => setProp("autofocus", checked)}
              />
            }
            label="Autofocus"
            sx={{ marginLeft: 0 }}
          />
        </>
      )}
    </Box>
  )

  return (
    <SettingsAccordion asAccordion={asAccordion} title={title}>
      {content}
    </SettingsAccordion>
  )
}
