import { useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { CRAFT_DISPLAY_NAME } from "../../craftDisplayNames.ts"
import { useCraftNodeStyle } from "../../../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../../../pages/builder/responsiveStyle.ts"
import { FORM_TEXT_INPUT_DEFAULT_PROPS } from "../formDefaults.ts"
import type { FormTextInputType } from "../formTypes.ts"

export interface Props {
  name?: string
  required?: boolean
  placeholder?: string
  autofocus?: boolean
  inputType?: FormTextInputType
  styleClassIds?: string[]
  style?: ResponsiveStyle
}

/** Single-line text input (Webflow FormTextInput). */
export const CraftFormTextInput = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const fieldName = props.name ?? FORM_TEXT_INPUT_DEFAULT_PROPS.name
  const inputType = props.inputType ?? FORM_TEXT_INPUT_DEFAULT_PROPS.inputType
  const required = props.required ?? FORM_TEXT_INPUT_DEFAULT_PROPS.required
  const placeholder = props.placeholder ?? FORM_TEXT_INPUT_DEFAULT_PROPS.placeholder
  const autofocus = props.autofocus ?? FORM_TEXT_INPUT_DEFAULT_PROPS.autofocus
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <input
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      data-craft-form-text-input=""
      type={inputType}
      name={fieldName}
      required={required}
      placeholder={placeholder}
      autoFocus={autofocus}
      readOnly
      tabIndex={-1}
      style={responsiveStyle as CSSProperties}
    />
  )
};

(CraftFormTextInput as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.FormTextInput,
  props: FORM_TEXT_INPUT_DEFAULT_PROPS,
  rules: {
    canMoveIn: () => false,
  },
}
