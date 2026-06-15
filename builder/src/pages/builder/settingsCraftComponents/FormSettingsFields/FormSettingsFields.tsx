import type { ChangeEvent } from "react"
import { useMemo } from "react"
import { Box } from "@mui/material"
import { useEditor } from "@craftjs/core"
import { resolveNodeDisplayName } from "../../../../utils/resolveNodeDisplayName.ts"
import { CRAFT_DISPLAY_NAME } from "../../../../craft/craftDisplayNames.ts"
import { collectFormFields } from "../../../../craft/form/collectFormFields.ts"
import type { FormFieldSummary } from "../../../../craft/form/collectFormFields.ts"
import { DEFAULT_FORM_SUBMIT_SETTINGS } from "../../../../craft/form/formTypes.ts"
import type { FormMethod, FormRedirectMode } from "../../../../craft/form/formTypes.ts"
import { PageType } from "../../../../api/extranet.ts"
import { useGetExtranetPagesQuery } from "../../../../store/extranetApi.ts"
import { CraftSettingsButtonGroup } from "../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsInput } from "../../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsSelect } from "../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { SettingsAccordion } from "../components/SettingsAccordion/SettingsAccordion.tsx"
import { FormFieldsList } from "./FormFieldsList/FormFieldsList.tsx"

interface FormFormProps {
  name?: string
  redirect?: string
  redirectMode?: FormRedirectMode
  action?: string
  method?: FormMethod
}

interface EditorSelection {
  targetId: string | null
  selectedProps: FormFormProps | null
  formFields: FormFieldSummary[]
}

interface Props {
  asAccordion?: boolean
  nodeId?: string
}

const FORM_METHOD_OPTIONS = [
  { id: "post", value: "POST" },
  { id: "get", value: "GET" },
]

const REDIRECT_MODE_OPTIONS = [
  { id: "none", content: "None" },
  { id: "page", content: "Page" },
  { id: "url", content: "URL" },
]

/** Submit settings for FormForm (name, action, method, redirect). */
export const FormSettingsFields = ({ asAccordion, nodeId }: Props) => {
  const { actions } = useEditor()
  const { data: pages, isError: isPagesError } = useGetExtranetPagesQuery()
  const { targetId, selectedProps, formFields } = useEditor((state): EditorSelection => {
    const id = nodeId ?? ((Array.from(state.events.selected)[0] as string | undefined) ?? null)
    if (!id) {
      return { targetId: null, selectedProps: null, formFields: [] }
    }

    const node = state.nodes[id]
    const displayName = node ? resolveNodeDisplayName(node) : null

    if (displayName !== CRAFT_DISPLAY_NAME.FormForm || !node) {
      return { targetId: null, selectedProps: null, formFields: [] }
    }

    const raw = node.data.props as FormFormProps | undefined

    return {
      targetId: id,
      selectedProps: raw ?? null,
      formFields: collectFormFields(id, state.nodes),
    }
  })

  const pageOptions = useMemo(() => (pages?.data ?? [])
        .filter((page) => [PageType.SYSTEM_PAGE, PageType.STATIC].includes(page.type))
        .map((page) => ({
          id: page.slug || page.id,
          value: page.name,
        })),
    [pages?.data],
  )

  if (!targetId || !selectedProps) {
    return null
  }

  const setProp = <K extends keyof FormFormProps>(key: K, value: FormFormProps[K]) => {
    actions.setProp(targetId, (props: FormFormProps) => {
      (props as Record<string, unknown>)[key] = value
    })
  }

  const name = selectedProps.name ?? DEFAULT_FORM_SUBMIT_SETTINGS.name
  const redirect = selectedProps.redirect ?? DEFAULT_FORM_SUBMIT_SETTINGS.redirect
  const redirectMode = selectedProps.redirectMode ?? DEFAULT_FORM_SUBMIT_SETTINGS.redirectMode
  const action = selectedProps.action ?? DEFAULT_FORM_SUBMIT_SETTINGS.action
  const method = selectedProps.method ?? DEFAULT_FORM_SUBMIT_SETTINGS.method

  const hasPageOptions = pageOptions.length > 0
  const safePageOptions = hasPageOptions
    ? pageOptions
    : [{ id: "", value: isPagesError ? "Не удалось загрузить страницы" : "Нет доступных страниц" }]
  const pageValue = hasPageOptions
    ? pageOptions.some((option) => option.id === redirect)
      ? redirect
      : pageOptions[0].id
    : ""

  const handleRedirectModeChange = (mode: FormRedirectMode) => {
    actions.setProp(targetId, (props: FormFormProps) => {
      props.redirectMode = mode

      if (mode === "none") {
        props.redirect = ""
        return
      }

      if (mode === "page") {
        props.redirect = pageOptions[0]?.id ?? ""
        return
      }

      props.redirect = ""
    })
  }

  const handlePageChange = (event: ChangeEvent<HTMLSelectElement>) => setProp("redirect", event.target.value)

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <CraftSettingsInput
        label="Name"
        value={name}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setProp("name", event.target.value)
        }
      />
      <FormFieldsList fields={formFields} />
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
          setProp("method", event.target.value as FormMethod)
        }
        options={FORM_METHOD_OPTIONS}
      />
      <CraftSettingsButtonGroup
        label="Redirect"
        value={redirectMode}
        options={REDIRECT_MODE_OPTIONS}
        onChange={(modeId) => handleRedirectModeChange(modeId as FormRedirectMode)}
      />
      {redirectMode === "page" && (
        <CraftSettingsSelect
          label="Page"
          value={pageValue}
          onChange={handlePageChange}
          options={safePageOptions}
        />
      )}
      {redirectMode === "url" && (
        <CraftSettingsInput
          label="URL"
          value={redirect}
          placeholder="e.g. /success"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setProp("redirect", event.target.value)
          }
        />
      )}
    </Box>
  )

  return (
    <SettingsAccordion asAccordion={asAccordion} title="Form submit">
      {content}
    </SettingsAccordion>
  )
}
