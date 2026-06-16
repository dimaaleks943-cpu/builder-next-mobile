import { useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { InlineSettingsModal } from "../../../components/InlineSettingsModal/InlineSettingsModal.tsx"
import { FormFieldSettingsFields } from "../../../pages/builder/settingsCraftComponents/FormFieldSettingsFields/FormFieldSettingsFields.tsx"
import { CRAFT_DISPLAY_NAME } from "../../craftDisplayNames.ts"
import { useCraftNodeStyle } from "../../../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../../../pages/builder/responsiveStyle.ts"
import { FORM_TEXT_INPUT_DEFAULT_PROPS } from "../formDefaults.ts"
import type { FormTextInputType } from "../formTypes.ts"
import { useFormInlineSettings } from "../useFormInlineSettings.ts"

export interface Props {
  htmlId?: string
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
      <input
        ref={(ref) => {
          elementRef.current = ref
          if (!ref) return
          connect(drag(ref))
        }}
        {...(props.htmlId ? { id: props.htmlId } : {})}
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
      <InlineSettingsModal
        open={isSettingsOpen}
        title="Настройки поля"
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

(CraftFormTextInput as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.FormTextInput,
  props: FORM_TEXT_INPUT_DEFAULT_PROPS,
  rules: {
    canMoveIn: () => false,
  },
}
