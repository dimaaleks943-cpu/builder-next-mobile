import {
  DEFAULT_FORM_SEND_TO_SETTINGS,
  type FormSendToSettings,
} from "./formTypes.ts"

export const resolveFormSendToSettings = (
  raw?: Partial<FormSendToSettings> | null,
): FormSendToSettings => ({
  platform: raw?.platform ?? DEFAULT_FORM_SEND_TO_SETTINGS.platform,
  email: raw?.email ?? DEFAULT_FORM_SEND_TO_SETTINGS.email,
  webhooks: raw?.webhooks ?? DEFAULT_FORM_SEND_TO_SETTINGS.webhooks,
  customAction: raw?.customAction ?? DEFAULT_FORM_SEND_TO_SETTINGS.customAction,
})

export const isCustomActionSendToOptionDisabled = (sendTo: FormSendToSettings): boolean =>
  sendTo.platform || sendTo.email || sendTo.customAction !== null

export const isPlatformSendToOptionDisabled = (sendTo: FormSendToSettings): boolean =>
  sendTo.customAction !== null || sendTo.platform

export const isEmailSendToOptionDisabled = (sendTo: FormSendToSettings): boolean =>
  sendTo.customAction !== null || sendTo.email

export const createFormSendToWebhookId = (): string =>
  `webhook-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
