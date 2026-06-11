import { useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { CRAFT_DISPLAY_NAME } from "../../craftDisplayNames.ts"
import { useCraftNodeStyle } from "../../../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../../../pages/builder/responsiveStyle.ts"
import { FORM_TEXTAREA_DEFAULT_PROPS } from "../formDefaults.ts"

export interface Props {
  name?: string
  required?: boolean
  placeholder?: string
  autofocus?: boolean
  styleClassIds?: string[]
  style?: ResponsiveStyle
}

/** Multi-line text input (Webflow FormTextarea). */
export const CraftFormTextarea = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const fieldName = props.name ?? FORM_TEXTAREA_DEFAULT_PROPS.name
  const required = props.required ?? FORM_TEXTAREA_DEFAULT_PROPS.required
  const placeholder = props.placeholder ?? FORM_TEXTAREA_DEFAULT_PROPS.placeholder
  const autofocus = props.autofocus ?? FORM_TEXTAREA_DEFAULT_PROPS.autofocus
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <textarea
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      data-craft-form-textarea=""
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

(CraftFormTextarea as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.FormTextarea,
  props: FORM_TEXTAREA_DEFAULT_PROPS,
  rules: {
    canMoveIn: () => false,
  },
}
