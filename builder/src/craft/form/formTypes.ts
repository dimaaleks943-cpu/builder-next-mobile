/** Preview / runtime form visibility state (Webflow `FormSettings.state`). */
export type FormState = "normal" | "success" | "error"

export type FormMethod = "get" | "post"

export type FormRedirectMode = "none" | "page" | "url"

export interface FormSendToWebhook {
  id: string
  url: string
}

export interface FormCustomActionSettings {
  url: string
  method: FormMethod
}

/** Where form submissions are sent (Webflow Send to). */
export interface FormSendToSettings {
  platform: boolean
  email: boolean
  webhooks: FormSendToWebhook[]
  customAction: FormCustomActionSettings | null
}

export const DEFAULT_FORM_SEND_TO_SETTINGS: FormSendToSettings = {
  platform: true,
  email: true,
  webhooks: [],
  customAction: null,
}

/** Submit configuration for FormForm (runtime). */
export interface FormSubmitSettings {
  name: string
  redirect: string
  redirectMode: FormRedirectMode
  sendTo: FormSendToSettings
}

export const DEFAULT_FORM_SUBMIT_SETTINGS: FormSubmitSettings = {
  name: "Email Form",
  redirect: "",
  redirectMode: "none",
  sendTo: DEFAULT_FORM_SEND_TO_SETTINGS,
}

export type FormTextInputType =
  | "text"
  | "email"
  | "tel"
  | "password"
  | "number"
  | "url"

/** Shared field props (Webflow form input methods: name, required). */
export interface FormFieldProps {
  name: string
  required: boolean
  placeholder: string
  autofocus: boolean
}

export const DEFAULT_FORM_FIELD_PROPS: FormFieldProps = {
  name: "Field",
  required: false,
  placeholder: "",
  autofocus: false,
}
