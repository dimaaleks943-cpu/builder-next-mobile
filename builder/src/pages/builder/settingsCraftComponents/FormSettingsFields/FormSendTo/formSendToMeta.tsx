import type { ReactNode } from "react"
import type { FormSendToSettings } from "../../../../../craft/form/formTypes.ts"
import {
  FormSendToCustomActionIcon,
  FormSendToEmailIcon,
  FormSendToPlatformIcon,
  FormSendToWebhookIcon,
} from "./FormSendToIcons.tsx"

export type FormSendToDestinationKind = "platform" | "email" | "webhook" | "customAction"

export interface FormSendToListItem {
  kind: FormSendToDestinationKind
  webhookId?: string
  label: string
}

export const FORM_SEND_TO_DESTINATION_LABELS: Record<FormSendToDestinationKind, string> = {
  platform: "Platform",
  email: "Email Notifications",
  webhook: "Webhook",
  customAction: "Custom Action",
}

export const FORM_SEND_TO_DESTINATION_ICONS: Record<
  FormSendToDestinationKind,
  (props: { fill?: string }) => ReactNode
> = {
  platform: (props) => <FormSendToPlatformIcon {...props} />,
  email: (props) => <FormSendToEmailIcon {...props} />,
  webhook: (props) => <FormSendToWebhookIcon {...props} />,
  customAction: (props) => <FormSendToCustomActionIcon {...props} />,
}

export const buildFormSendToListItems = (sendTo: FormSendToSettings): FormSendToListItem[] => {
  const items: FormSendToListItem[] = []

  if (sendTo.platform) {
    items.push({
      kind: "platform",
      label: FORM_SEND_TO_DESTINATION_LABELS.platform,
    })
  }

  if (sendTo.email) {
    items.push({
      kind: "email",
      label: FORM_SEND_TO_DESTINATION_LABELS.email,
    })
  }

  for (const webhook of sendTo.webhooks) {
    items.push({
      kind: "webhook",
      webhookId: webhook.id,
      label: FORM_SEND_TO_DESTINATION_LABELS.webhook,
    })
  }

  if (sendTo.customAction) {
    items.push({
      kind: "customAction",
      label: FORM_SEND_TO_DESTINATION_LABELS.customAction,
    })
  }

  return items
}
