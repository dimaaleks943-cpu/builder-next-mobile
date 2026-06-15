import type { FormTextInputType } from "./formTypes.ts"

/** Webflow-style labels shown in Form settings → Fields list. */
export const FORM_TEXT_INPUT_TYPE_LABELS: Record<FormTextInputType, string> = {
  text: "Plain",
  email: "Email",
  tel: "Phone",
  password: "Password",
  number: "Number",
  url: "URL",
}

export const getFormTextInputTypeLabel = (inputType: FormTextInputType | undefined): string =>
  FORM_TEXT_INPUT_TYPE_LABELS[inputType ?? "text"]

export const FORM_TEXTAREA_TYPE_LABEL = "Textarea"
