import { useNode } from "@craftjs/core"
import type { CSSProperties, ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "../../craftDisplayNames.ts"
import { useCraftNodeStyle } from "../../../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../../../pages/builder/responsiveStyle.ts"
import { useFormPreviewState } from "../../../pages/builder/context/FormPreviewContext.tsx"
import { FORM_MESSAGE_DEFAULT_STYLE } from "../formDefaults.ts"
import { PreviewViewport } from "../../../pages/builder/builder.enum.ts"

export interface Props {
  children?: ReactNode
  styleClassIds?: string[]
  style?: ResponsiveStyle
}

/** Shown when submission fails (Webflow FormErrorMessage). */
export const CraftFormErrorMessage = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const previewState = useFormPreviewState()
  const {
    connectors: { connect, drag },
  } = useNode()

  const isHidden = previewState !== "error"

  const resolvedDisplay =
    (responsiveStyle as CSSProperties).display ??
    FORM_MESSAGE_DEFAULT_STYLE[PreviewViewport.DESKTOP]?.display ??
    "block"

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      data-craft-form-error=""
      role="alert"
      aria-live="assertive"
      style={{
        ...(responsiveStyle as CSSProperties),
        display: isHidden ? "none" : resolvedDisplay,
      }}
    >
      {props.children}
    </div>
  )
};

(CraftFormErrorMessage as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.FormErrorMessage,
  props: {
    style: FORM_MESSAGE_DEFAULT_STYLE,
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}
