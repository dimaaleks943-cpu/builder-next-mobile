import { Element } from "@craftjs/core"
import { CraftParagraph } from "../CraftParagraph.tsx"
import { CraftFormWrapper } from "./CraftFormWrapper/CraftFormWrapper.tsx"
import { CraftFormForm } from "./CraftFormForm/CraftFormForm.tsx"
import { CraftFormSuccessMessage } from "./CraftFormSuccessMessage/CraftFormSuccessMessage.tsx"
import { CraftFormErrorMessage } from "./CraftFormErrorMessage/CraftFormErrorMessage.tsx"
import { CraftFormInput } from "./CraftFormInput/CraftFormInput.tsx"
import { CraftFormBlockLabel } from "./CraftFormBlockLabel/CraftFormBlockLabel.tsx"
import { CraftFormTextInput } from "./CraftFormTextInput/CraftFormTextInput.tsx"
import { CraftFormTextarea } from "./CraftFormTextarea/CraftFormTextarea.tsx"
import { CraftFormButton } from "./CraftFormButton/CraftFormButton.tsx"

interface TextFieldPresetOptions {
  label: string
  name: string
  inputType?: "text" | "email" | "tel" | "password" | "number" | "url"
  required?: boolean
  placeholder?: string
}

export const buildFormTextFieldPreset = ({
  label,
  name,
  inputType = "text",
  required = false,
  placeholder = "",
}: TextFieldPresetOptions) => (
  <Element is={CraftFormInput} canvas>
    <Element is={CraftFormBlockLabel} text={label} />
    <Element
      is={CraftFormTextInput}
      name={name}
      inputType={inputType}
      required={required}
      placeholder={placeholder}
    />
  </Element>
)

export const buildFormTextareaFieldPreset = ({
  label,
  name,
  required = false,
  placeholder = "",
}: Omit<TextFieldPresetOptions, "inputType">) => (
  <Element is={CraftFormInput} canvas>
    <Element is={CraftFormBlockLabel} text={label} />
    <Element
      is={CraftFormTextarea}
      name={name}
      required={required}
      placeholder={placeholder}
    />
  </Element>
)

export const buildFullFormPreset = () => (
  <Element is={CraftFormWrapper} canvas>
    <Element is={CraftFormForm} canvas>
      {buildFormTextFieldPreset({
        label: "Name",
        name: "Name",
        required: true,
      })}
      {buildFormTextFieldPreset({
        label: "Email",
        name: "Email",
        inputType: "email",
        required: true,
      })}
      {buildFormTextareaFieldPreset({
        label: "Message",
        name: "Message",
      })}
      <Element is={CraftFormButton} />
    </Element>
    <Element is={CraftFormSuccessMessage} canvas>
      <Element
        is={CraftParagraph}
        text="Thank you! Your submission has been received!"
      />
    </Element>
    <Element is={CraftFormErrorMessage} canvas>
      <Element
        is={CraftParagraph}
        text="Oops! Something went wrong while submitting the form."
      />
    </Element>
  </Element>
)
