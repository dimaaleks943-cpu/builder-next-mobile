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

/** Shown after successful submission (Webflow FormSuccessMessage). */
export const CraftFormSuccessMessage = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const previewState = useFormPreviewState()
  const {
    connectors: { connect, drag },
  } = useNode()

  const isHidden = previewState !== "success"

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
      data-craft-form-success=""
      role="status"
      aria-live="polite"
      style={{
        ...(responsiveStyle as CSSProperties),
        display: isHidden ? "none" : resolvedDisplay,
      }}
    >
      {props.children}
    </div>
  )
};

(CraftFormSuccessMessage as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.FormSuccessMessage,
  props: {
    style: FORM_MESSAGE_DEFAULT_STYLE,
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}
