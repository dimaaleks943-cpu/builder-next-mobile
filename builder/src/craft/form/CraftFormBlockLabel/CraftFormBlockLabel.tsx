import { useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { CRAFT_DISPLAY_NAME } from "../../craftDisplayNames.ts"
import { useCraftNodeStyle } from "../../../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../../../pages/builder/responsiveStyle.ts"
import { FORM_BLOCK_LABEL_DEFAULT_PROPS } from "../formDefaults.ts"

export interface Props {
  text?: string
  styleClassIds?: string[]
  style?: ResponsiveStyle
}

/** Label for a form field (Webflow FormBlockLabel). */
export const CraftFormBlockLabel = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const labelText = props.text ?? FORM_BLOCK_LABEL_DEFAULT_PROPS.text
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <label
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      data-craft-form-label=""
      style={responsiveStyle as CSSProperties}
    >
      {labelText}
    </label>
  )
};

(CraftFormBlockLabel as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.FormBlockLabel,
  props: FORM_BLOCK_LABEL_DEFAULT_PROPS,
  rules: {
    canMoveIn: () => false,
  },
}
