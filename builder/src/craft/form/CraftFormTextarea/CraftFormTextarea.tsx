import { useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { InlineSettingsModal } from "../../../components/InlineSettingsModal/InlineSettingsModal.tsx"
import { FormFieldSettingsFields } from "../../../pages/builder/settingsCraftComponents/FormFieldSettingsFields/FormFieldSettingsFields.tsx"
import { CRAFT_DISPLAY_NAME } from "../../craftDisplayNames.ts"
import { useCraftNodeStyle } from "../../../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../../../pages/builder/responsiveStyle.ts"
import { FORM_TEXTAREA_DEFAULT_PROPS } from "../formDefaults.ts"
import { useFormInlineSettings } from "../useFormInlineSettings.ts"

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
  const {
    elementRef,
    id,
    isSettingsOpen,
    modalPosition,
    closeInlineSettings,
    handleShowAllSettings,
  } = useFormInlineSettings()

  return (
    <>
      <textarea
        ref={(ref) => {
          elementRef.current = ref
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
      <InlineSettingsModal
        open={isSettingsOpen}
        title="Настройки textarea"
        top={modalPosition.top}
        left={modalPosition.left}
        onClose={closeInlineSettings}
        onShowAllSettings={handleShowAllSettings}
      >
        <FormFieldSettingsFields nodeId={id} />
      </InlineSettingsModal>
    </>
  )
};

(CraftFormTextarea as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.FormTextarea,
  props: FORM_TEXTAREA_DEFAULT_PROPS,
  rules: {
    canMoveIn: () => false,
  },
}
