import { useNode } from "@craftjs/core"
import type { CSSProperties, ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "../../craftDisplayNames.ts"
import { useCraftNodeStyle } from "../../../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../../../pages/builder/responsiveStyle.ts"
import { useFormPreviewState } from "../../../pages/builder/context/FormPreviewContext.tsx"
import { canMoveIntoFormForm } from "../formCraftRules.ts"
import { FORM_FORM_DEFAULT_PROPS } from "../formDefaults.ts"
import type { FormMethod, FormRedirectMode } from "../formTypes.ts"

export interface Props {
  children?: ReactNode
  styleClassIds?: string[]
  style?: ResponsiveStyle
  name?: string
  redirect?: string
  redirectMode?: FormRedirectMode
  action?: string
  method?: FormMethod
}

const resolveCanvasDisplay = (
  responsiveStyle: CSSProperties,
  isHidden: boolean,
): CSSProperties["display"] => {
  if (isHidden) return "none"
  return responsiveStyle.display ?? "flex"
}

/**
 * Form fields container (Webflow FormForm).
 * Builder uses `<div role="form">` — native `<form>` breaks Craft.js drag-and-drop.
 */
export const CraftFormForm = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style) as CSSProperties
  const previewState = useFormPreviewState()
  const formName = props.name ?? FORM_FORM_DEFAULT_PROPS.name
  const formMethod = props.method ?? FORM_FORM_DEFAULT_PROPS.method
  const redirectMode = props.redirectMode ?? FORM_FORM_DEFAULT_PROPS.redirectMode
  const redirect = props.redirect ?? FORM_FORM_DEFAULT_PROPS.redirect
  const { connectors: { connect, drag } } = useNode()

  const isHidden = previewState === "success"

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      role="form"
      data-craft-form=""
      data-form-name={formName}
      data-form-action={props.action ?? FORM_FORM_DEFAULT_PROPS.action}
      data-form-method={formMethod}
      data-form-redirect={redirect}
      data-form-redirect-mode={redirectMode}
      style={{
        ...responsiveStyle,
        display: resolveCanvasDisplay(responsiveStyle, isHidden),
        boxSizing: "border-box",
      }}
    >
      {props.children}
    </div>
  )
};

(CraftFormForm as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.FormForm,
  props: FORM_FORM_DEFAULT_PROPS,
  rules: {
    canMoveIn: canMoveIntoFormForm,
  },
  isCanvas: true,
}
