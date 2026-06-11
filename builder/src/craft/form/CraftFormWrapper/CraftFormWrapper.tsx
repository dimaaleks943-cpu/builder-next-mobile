import { useEditor, useNode } from "@craftjs/core"
import type { CSSProperties, ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "../../craftDisplayNames.ts"
import { useCraftNodeStyle } from "../../../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../../../pages/builder/responsiveStyle.ts"
import { FormPreviewProvider } from "../../../pages/builder/context/FormPreviewContext.tsx"
import { canMoveIntoFormWrapper } from "../formCraftRules.ts"
import { FORM_WRAPPER_DEFAULT_PROPS } from "../formDefaults.ts"
import { readPreviewStateForWrapper } from "../formPreviewState.ts"
import type { FormState } from "../formTypes.ts"

export interface Props {
  children?: ReactNode
  styleClassIds?: string[]
  style?: ResponsiveStyle
  /** Builder-only: which form branch is visible on the canvas. */
  previewState?: FormState
}

/** Outermost form container: holds FormForm, success and error messages (Webflow FormWrapper). */
export const CraftFormWrapper = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const { nodeId } = useNode((node) => ({ nodeId: node.id }))
  const { previewState } = useEditor((state) => ({
    previewState: readPreviewStateForWrapper(
      nodeId,
      state.nodes as Parameters<typeof readPreviewStateForWrapper>[1],
    ),
  }))
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      data-craft-form-wrapper=""
      data-form-preview-state={previewState}
      style={responsiveStyle as CSSProperties}
    >
      <FormPreviewProvider state={previewState}>{props.children}</FormPreviewProvider>
    </div>
  )
};

(CraftFormWrapper as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.FormWrapper,
  props: FORM_WRAPPER_DEFAULT_PROPS,
  rules: {
    canMoveIn: canMoveIntoFormWrapper,
  },
  isCanvas: true,
}
