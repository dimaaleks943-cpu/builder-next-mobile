/** Preview / runtime form visibility state (Webflow `FormSettings.state`). */
export type FormState = "normal" | "success" | "error"

export type FormMethod = "get" | "post"

/** Submit configuration for FormForm (runtime). */
export interface FormSubmitSettings {
  name: string
  redirect: string
  action: string
  method: FormMethod
}

/** Builder-only preview on FormWrapper. */
export interface FormWrapperSettings {
  previewState: FormState
}

/** @deprecated Use FormSubmitSettings + FormWrapperSettings */
export interface FormSettings extends FormSubmitSettings {
  state?: FormState
}

export const DEFAULT_FORM_SUBMIT_SETTINGS: FormSubmitSettings = {
  name: "Email Form",
  redirect: "",
  action: "",
  method: "post",
}

export const DEFAULT_FORM_WRAPPER_SETTINGS: FormWrapperSettings = {
  previewState: "normal",
}

/** @deprecated */
export const DEFAULT_FORM_SETTINGS: FormSettings = {
  ...DEFAULT_FORM_SUBMIT_SETTINGS,
  state: "normal",
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
