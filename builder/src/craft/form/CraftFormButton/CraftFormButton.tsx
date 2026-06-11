import { useNode } from "@craftjs/core"
import type { CSSProperties, MouseEvent } from "react"
import { CRAFT_DISPLAY_NAME } from "../../craftDisplayNames.ts"
import { useCraftNodeStyle } from "../../../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../../../pages/builder/responsiveStyle.ts"
import { FORM_BUTTON_DEFAULT_PROPS } from "../formDefaults.ts"

export interface Props {
  text?: string
  loadingText?: string
  styleClassIds?: string[]
  style?: ResponsiveStyle
}

/** Submit button for the form (Webflow FormButton). */
export const CraftFormButton = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const buttonText = props.text ?? FORM_BUTTON_DEFAULT_PROPS.text
  const {
    connectors: { connect, drag },
  } = useNode()

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  return (
    <button
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      data-craft-form-button=""
      type="submit"
      onClick={handleClick}
      style={responsiveStyle as CSSProperties}
    >
      {buttonText}
    </button>
  )
};

(CraftFormButton as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.FormButton,
  props: FORM_BUTTON_DEFAULT_PROPS,
  rules: {
    canMoveIn: () => false,
  },
}
