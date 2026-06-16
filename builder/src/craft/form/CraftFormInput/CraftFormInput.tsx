import { useNode } from "@craftjs/core"
import type { CSSProperties, ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "../../craftDisplayNames.ts"
import { useCraftNodeStyle } from "../../../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../../../pages/builder/responsiveStyle.ts"
import { canMoveIntoFormInput } from "../formCraftRules.ts"
import { FORM_INPUT_DEFAULT_STYLE } from "../formDefaults.ts"

export interface Props {
  htmlId?: string
  children?: ReactNode
  styleClassIds?: string[]
  style?: ResponsiveStyle
}

/** Wrapper for a single form field: label + control (Webflow FormInput / DivBlock pattern). */
export const CraftFormInput = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      {...(props.htmlId ? { id: props.htmlId } : {})}
      data-craft-form-input=""
      style={responsiveStyle as CSSProperties}
    >
      {props.children}
    </div>
  )
};

(CraftFormInput as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.FormInput,
  props: {
    style: FORM_INPUT_DEFAULT_STYLE,
  },
  rules: {
    canMoveIn: canMoveIntoFormInput,
  },
  isCanvas: true,
}
