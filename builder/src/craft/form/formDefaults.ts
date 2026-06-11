import { PreviewViewport } from "../../pages/builder/builder.enum.ts"
import { COLORS } from "../../theme/colors.ts"
import {
  DEFAULT_FORM_FIELD_PROPS,
  DEFAULT_FORM_SUBMIT_SETTINGS,
  DEFAULT_FORM_WRAPPER_SETTINGS,
} from "./formTypes.ts"

export const FORM_WRAPPER_DEFAULT_STYLE = {
  [PreviewViewport.DESKTOP]: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
  },
}

export const FORM_FORM_DEFAULT_STYLE = {
  [PreviewViewport.DESKTOP]: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
    boxSizing: "border-box",
  },
}

export const FORM_MESSAGE_DEFAULT_STYLE = {
  [PreviewViewport.DESKTOP]: {
    display: "block",
    width: "100%",
    paddingTop: "16px",
    paddingRight: "16px",
    paddingBottom: "16px",
    paddingLeft: "16px",
    boxSizing: "border-box",
  },
}

export const FORM_INPUT_DEFAULT_STYLE = {
  [PreviewViewport.DESKTOP]: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
    boxSizing: "border-box",
  },
}

export const FORM_LABEL_DEFAULT_STYLE = {
  [PreviewViewport.DESKTOP]: {
    display: "block",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 500,
    color: COLORS.gray700,
    boxSizing: "border-box",
  },
}

export const FORM_CONTROL_DEFAULT_STYLE = {
  [PreviewViewport.DESKTOP]: {
    display: "block",
    width: "100%",
    minHeight: "40px",
    paddingTop: "8px",
    paddingRight: "12px",
    paddingBottom: "8px",
    paddingLeft: "12px",
    fontSize: "14px",
    lineHeight: "20px",
    borderRadius: "4px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    boxSizing: "border-box",
  },
}

export const FORM_TEXTAREA_DEFAULT_STYLE = {
  [PreviewViewport.DESKTOP]: {
    ...FORM_CONTROL_DEFAULT_STYLE[PreviewViewport.DESKTOP],
    minHeight: "120px",
    resize: "vertical",
  },
}

export const FORM_BUTTON_DEFAULT_STYLE = {
  [PreviewViewport.DESKTOP]: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    paddingTop: "10px",
    paddingRight: "20px",
    paddingBottom: "10px",
    paddingLeft: "20px",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    color: COLORS.white,
    backgroundColor: COLORS.purple400,
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  },
}

export const FORM_WRAPPER_DEFAULT_PROPS = {
  ...DEFAULT_FORM_WRAPPER_SETTINGS,
  style: FORM_WRAPPER_DEFAULT_STYLE,
}

export const FORM_FORM_DEFAULT_PROPS = {
  ...DEFAULT_FORM_SUBMIT_SETTINGS,
  style: FORM_FORM_DEFAULT_STYLE,
}

export const FORM_TEXT_INPUT_DEFAULT_PROPS = {
  ...DEFAULT_FORM_FIELD_PROPS,
  inputType: "text" as const,
  style: FORM_CONTROL_DEFAULT_STYLE,
}

export const FORM_TEXTAREA_DEFAULT_PROPS = {
  ...DEFAULT_FORM_FIELD_PROPS,
  name: "Message",
  style: FORM_TEXTAREA_DEFAULT_STYLE,
}

export const FORM_BLOCK_LABEL_DEFAULT_PROPS = {
  text: "Label",
  style: FORM_LABEL_DEFAULT_STYLE,
}

export const FORM_BUTTON_DEFAULT_PROPS = {
  text: "Submit",
  loadingText: "Please wait…",
  style: FORM_BUTTON_DEFAULT_STYLE,
}
