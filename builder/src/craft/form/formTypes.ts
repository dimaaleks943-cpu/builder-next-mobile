/** Preview / runtime form visibility state (Webflow `FormSettings.state`). */
export type FormState = "normal" | "success" | "error"

export type FormMethod = "get" | "post"

export type FormRedirectMode = "none" | "page" | "url"

/** Submit configuration for FormForm (runtime). */
export interface FormSubmitSettings {
  name: string
  redirect: string
  redirectMode: FormRedirectMode
  action: string
  method: FormMethod
}

export const DEFAULT_FORM_SUBMIT_SETTINGS: FormSubmitSettings = {
  name: "Email Form",
  redirect: "",
  redirectMode: "none",
  action: "",
  method: "post",
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
