import { useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { InlineSettingsModal } from "../../../components/InlineSettingsModal/InlineSettingsModal.tsx"
import { FormFieldSettingsFields } from "../../../pages/builder/settingsCraftComponents/FormFieldSettingsFields/FormFieldSettingsFields.tsx"
import { CRAFT_DISPLAY_NAME } from "../../craftDisplayNames.ts"
import { useCraftNodeStyle } from "../../../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../../../pages/builder/responsiveStyle.ts"
import { FORM_BLOCK_LABEL_DEFAULT_PROPS } from "../formDefaults.ts"
import { useFormInlineSettings } from "../useFormInlineSettings.ts"

export interface Props {
  text?: string
  styleClassIds?: string[]
  style?: ResponsiveStyle
  htmlId?: string
}

/** Label for a form field (Webflow FormBlockLabel). */
export const CraftFormBlockLabel = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const labelText = props.text ?? FORM_BLOCK_LABEL_DEFAULT_PROPS.text
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
      <label
        ref={(ref) => {
          elementRef.current = ref
          if (!ref) return
          connect(drag(ref))
        }}
        {...(props.htmlId ? { id: props.htmlId } : {})}
        data-craft-form-label=""
        style={responsiveStyle as CSSProperties}
      >
        {labelText}
      </label>
      <InlineSettingsModal
        open={isSettingsOpen}
        title="Настройки label"
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

(CraftFormBlockLabel as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.FormBlockLabel,
  props: FORM_BLOCK_LABEL_DEFAULT_PROPS,
  rules: {
    canMoveIn: () => false,
  },
}
