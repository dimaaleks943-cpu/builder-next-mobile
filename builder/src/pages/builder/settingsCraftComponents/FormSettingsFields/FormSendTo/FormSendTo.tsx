import type { ChangeEvent, MouseEvent, ReactNode, RefObject } from "react"
import { useRef, useState } from "react"
import { Box, Popper } from "@mui/material"
import { AddIcon } from "../../../../../icons/AddIcon.tsx"
import { DeleteIcon } from "../../../../../icons/DeleteIcon.tsx"
import { COLORS } from "../../../../../theme/colors.ts"
import type {
  FormCustomActionSettings,
  FormMethod,
  FormSendToSettings,
} from "../../../../../craft/form/formTypes.ts"
import {
  createFormSendToWebhookId,
  isCustomActionSendToOptionDisabled,
  isEmailSendToOptionDisabled,
  isPlatformSendToOptionDisabled,
} from "../../../../../craft/form/formSendToUtils.ts"
import { CraftSettingsButtonGroup } from "../../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsInput } from "../../../components/craftSettingsControls/CraftSettingsInput.tsx"
import {
  buildFormSendToListItems,
  FORM_SEND_TO_DESTINATION_ICONS,
  FORM_SEND_TO_DESTINATION_LABELS,
  type FormSendToDestinationKind,
} from "./formSendToMeta.tsx"
import { useFormSendToPopper } from "./useFormSendToPopper.ts"
import {
  SendToAddButton,
  SendToConfigActionsRow,
  SendToConfigPaper,
  SendToContainer,
  SendToHeader,
  SendToLabel,
  SendToMenuItem,
  SendToMenuItemLabel,
  SendToMenuPaper,
  SendToRoot,
  SendToRow,
  SendToRowDeleteButton,
  SendToRowIcon,
  SendToRowLabel,
  SendToSaveButton,
} from "./styles.ts"

interface Props {
  sendTo: FormSendToSettings
  onChange: (sendTo: FormSendToSettings) => void
}

type ConfigMode = "customAction" | "webhook" | null

const CUSTOM_ACTION_METHOD_OPTIONS = [
  { id: "post", content: "POST" },
  { id: "get", content: "GET" },
]

const ADD_MENU_OPTIONS: FormSendToDestinationKind[] = [
  "platform",
  "email",
  "webhook",
  "customAction",
]

const SEND_TO_POPPER_MODIFIERS = [{ name: "offset", options: { offset: [0, 6] } }]

interface SendToPopperProps {
  open: boolean
  anchorEl: HTMLElement | null
  paperRef: RefObject<HTMLDivElement>
  children: ReactNode
  placement?: "bottom-end" | "bottom-start"
}

const SendToPopper = ({
  open,
  anchorEl,
  paperRef,
  children,
  placement = "bottom-end",
}: SendToPopperProps) => (
  <Popper
    open={open}
    anchorEl={anchorEl}
    placement={placement}
    modifiers={SEND_TO_POPPER_MODIFIERS}
    style={{ zIndex: 4000 }}
  >
    <Box ref={paperRef}>{children}</Box>
  </Popper>
)

export const FormSendTo = ({ sendTo, onChange }: Props) => {
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const addMenu = useFormSendToPopper()
  const configPopper = useFormSendToPopper()

  const [configMode, setConfigMode] = useState<ConfigMode>(null)
  const [editingWebhookId, setEditingWebhookId] = useState<string | null>(null)
  const [draftActionUrl, setDraftActionUrl] = useState("")
  const [draftActionMethod, setDraftActionMethod] = useState<FormMethod>("post")
  const [draftWebhookUrl, setDraftWebhookUrl] = useState("")

  const listItems = buildFormSendToListItems(sendTo)

  const closeConfig = () => {
    configPopper.close()
    setConfigMode(null)
    setEditingWebhookId(null)
    setDraftActionUrl("")
    setDraftActionMethod("post")
    setDraftWebhookUrl("")
  }

  const openConfig = (
    anchor: HTMLElement,
    mode: ConfigMode,
    webhookId: string | null = null,
  ) => {
    addMenu.close()
    configPopper.open(anchor)
    setConfigMode(mode)
    setEditingWebhookId(webhookId)

    if (mode === "customAction") {
      setDraftActionUrl(sendTo.customAction?.url ?? "")
      setDraftActionMethod(sendTo.customAction?.method ?? "post")
      return
    }

    if (mode === "webhook" && webhookId) {
      const webhook = sendTo.webhooks.find((item) => item.id === webhookId)
      setDraftWebhookUrl(webhook?.url ?? "")
      return
    }

    setDraftWebhookUrl("")
  }

  const handleAddClick = (event: MouseEvent<HTMLButtonElement>) => {
    configPopper.close()
    addMenu.toggle(event)
  }

  const isAddOptionDisabled = (kind: FormSendToDestinationKind): boolean => {
    if (kind === "platform") return isPlatformSendToOptionDisabled(sendTo)
    if (kind === "email") return isEmailSendToOptionDisabled(sendTo)
    if (kind === "customAction") return isCustomActionSendToOptionDisabled(sendTo)
    return false
  }

  const handleAddOptionSelect = (kind: FormSendToDestinationKind) => {
    if (isAddOptionDisabled(kind)) return

    addMenu.close()

    if (kind === "platform") {
      onChange({ ...sendTo, platform: true })
      return
    }

    if (kind === "email") {
      onChange({ ...sendTo, email: true })
      return
    }

    const anchor = addButtonRef.current
    if (!anchor) return

    if (kind === "customAction") {
      openConfig(anchor, "customAction")
      return
    }

    openConfig(anchor, "webhook")
  }

  const handleRemoveItem = (
    event: MouseEvent<HTMLButtonElement>,
    kind: FormSendToDestinationKind,
    webhookId?: string,
  ) => {
    event.stopPropagation()

    if (kind === "platform") {
      onChange({ ...sendTo, platform: false })
      return
    }

    if (kind === "email") {
      onChange({ ...sendTo, email: false })
      return
    }

    if (kind === "webhook" && webhookId) {
      onChange({
        ...sendTo,
        webhooks: sendTo.webhooks.filter((item) => item.id !== webhookId),
      })
      return
    }

    if (kind === "customAction") {
      onChange({ ...sendTo, customAction: null })
    }
  }

  const handleRowClick = (
    event: MouseEvent<HTMLDivElement>,
    kind: FormSendToDestinationKind,
    webhookId?: string,
  ) => {
    if (kind === "customAction") {
      openConfig(event.currentTarget, "customAction")
      return
    }

    if (kind === "webhook" && webhookId) {
      openConfig(event.currentTarget, "webhook", webhookId)
    }
  }

  const handleSaveCustomAction = () => {
    const customAction: FormCustomActionSettings = {
      url: draftActionUrl.trim(),
      method: draftActionMethod,
    }

    onChange({
      ...sendTo,
      platform: false,
      email: false,
      customAction,
    })
    closeConfig()
  }

  const handleSaveWebhook = () => {
    const url = draftWebhookUrl.trim()

    if (editingWebhookId) {
      onChange({
        ...sendTo,
        webhooks: sendTo.webhooks.map((item) =>
          item.id === editingWebhookId ? { ...item, url } : item,
        ),
      })
      closeConfig()
      return
    }

    onChange({
      ...sendTo,
      webhooks: [...sendTo.webhooks, { id: createFormSendToWebhookId(), url }],
    })
    closeConfig()
  }

  return (
    <SendToRoot>
      <SendToHeader>
        <SendToLabel>Send to</SendToLabel>
        <SendToAddButton
          ref={addButtonRef}
          type="button"
          aria-label="Add send to destination"
          aria-expanded={addMenu.isOpen}
          onClick={handleAddClick}
        >
          <AddIcon height={12} width={12} fill={COLORS.gray700} />
        </SendToAddButton>
      </SendToHeader>

      {listItems.length > 0 && (
        <SendToContainer>
          {listItems.map((item) => {
            const Icon = FORM_SEND_TO_DESTINATION_ICONS[item.kind]

            return (
              <SendToRow
                key={item.webhookId ?? item.kind}
                onClick={(event) => handleRowClick(event, item.kind, item.webhookId)}
              >
                <SendToRowIcon>{Icon({})}</SendToRowIcon>
                <SendToRowLabel>{item.label}</SendToRowLabel>
                <SendToRowDeleteButton
                  type="button"
                  aria-label={`Remove ${item.label}`}
                  onClick={(event) => handleRemoveItem(event, item.kind, item.webhookId)}
                >
                  <DeleteIcon size={14} fill={COLORS.gray600} />
                </SendToRowDeleteButton>
              </SendToRow>
            )
          })}
        </SendToContainer>
      )}

      <SendToPopper
        open={addMenu.isOpen}
        anchorEl={addMenu.anchorEl}
        paperRef={addMenu.paperRef}
      >
        <SendToMenuPaper elevation={3}>
          {ADD_MENU_OPTIONS.map((kind) => {
            const Icon = FORM_SEND_TO_DESTINATION_ICONS[kind]
            const disabled = isAddOptionDisabled(kind)

            return (
              <SendToMenuItem
                key={kind}
                type="button"
                $disabled={disabled}
                disabled={disabled}
                onClick={() => handleAddOptionSelect(kind)}
              >
                <SendToRowIcon>{Icon({})}</SendToRowIcon>
                <SendToMenuItemLabel>{FORM_SEND_TO_DESTINATION_LABELS[kind]}</SendToMenuItemLabel>
              </SendToMenuItem>
            )
          })}
        </SendToMenuPaper>
      </SendToPopper>

      <SendToPopper
        open={configPopper.isOpen}
        anchorEl={configPopper.anchorEl}
        paperRef={configPopper.paperRef}
      >
        <SendToConfigPaper elevation={3}>
          {configMode === "customAction" && (
            <>
              <CraftSettingsInput
                label="Action"
                value={draftActionUrl}
                placeholder="https://webflow.com/action/path"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setDraftActionUrl(event.target.value)
                }
              />
              <CraftSettingsButtonGroup
                label="Method"
                value={draftActionMethod}
                options={CUSTOM_ACTION_METHOD_OPTIONS}
                onChange={(methodId) => setDraftActionMethod(methodId as FormMethod)}
              />
              <SendToConfigActionsRow>
                <SendToSaveButton type="button" onClick={handleSaveCustomAction}>
                  Save
                </SendToSaveButton>
              </SendToConfigActionsRow>
            </>
          )}

          {configMode === "webhook" && (
            <>
              <CraftSettingsInput
                label="Webhook URL"
                value={draftWebhookUrl}
                placeholder="https://domain.com/webhook/webflow"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setDraftWebhookUrl(event.target.value)
                }
              />
              <SendToConfigActionsRow>
                <SendToSaveButton type="button" onClick={handleSaveWebhook}>
                  Save
                </SendToSaveButton>
              </SendToConfigActionsRow>
            </>
          )}
        </SendToConfigPaper>
      </SendToPopper>
    </SendToRoot>
  )
}
